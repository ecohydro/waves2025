/**
 * news-intake-core.mjs
 *
 * Pure logic for the Slack -> Sanity news intake: author matching, slugs,
 * schema validation, document assembly. Nothing here performs I/O, so the
 * risky part of the pipeline is unit testable without a token or a network.
 *
 * Dependency-free on purpose, like `website-pubs-digest.mjs`: the Cowork
 * workspace that runs these tasks has no working `tsx`/esbuild, so anything
 * the automation depends on must be plain Node with built-ins only.
 *
 * The runner that talks to Slack and Sanity is `news-intake.mjs`.
 */

import { defaultImageAlt } from '../src/lib/cms/image-alt.mjs';

/* -------------------------------------------------------------------------- */
/* Shape of the data                                                          */
/* -------------------------------------------------------------------------- */

/** Category values declared in `src/lib/cms/schemas/news.ts`. */
export const NEWS_CATEGORIES = [
  'research',
  'publication',
  'lab-news',
  'conference',
  'award',
  'outreach',
  'collaboration',
  'event',
  'general',
];

export const TITLE_MIN = 5;
export const TITLE_MAX = 200;
export const EXCERPT_MAX = 300;
export const SLUG_MAX = 96;

/**
 * @typedef {Object} IntakeImage
 * @property {string} [path]   Local file already on disk. Wins over `url`.
 * @property {string} [url]    Remote file. A Slack url_private needs a token.
 * @property {string} [alt]    Required by the schema. No alt, no image.
 * @property {string} [caption]
 * @property {string} [credit]
 *
 * @typedef {Object} IntakeItem
 * @property {string} slackTs            Dedupe key for the whole pipeline.
 * @property {string} [slackChannel]
 * @property {string} [slackChannelId]
 * @property {string} [slackPermalink]
 * @property {string} [slackUserId]
 * @property {string} [submittedByName]
 * @property {string} [authorEmail]      Preferred: matches person.email.
 * @property {string} [authorName]       Fallback when Slack has no email.
 * @property {string} [title]
 * @property {string} [excerpt]
 * @property {string} [content]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} [publishedAt]      ISO. Defaults to the message time.
 * @property {IntakeImage} [image]
 * @property {string[]} [relatedPeople]  Other members featured, by name/email.
 * @property {Array<{title?:string,url?:string,description?:string}>} [externalLinks]
 *
 * @typedef {Object} PersonRow
 * @property {string} _id
 * @property {string} [name]
 * @property {string} [email]
 * @property {{current?: string}} [slug]
 * @property {string} [userGroup]
 * @property {boolean} [isActive]
 */

/* -------------------------------------------------------------------------- */
/* Names and people                                                           */
/* -------------------------------------------------------------------------- */

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalizeName(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lastFirstInitial(name) {
  const parts = normalizeName(name).split(' ').filter(Boolean);
  if (parts.length < 2) return null;
  return `${parts[parts.length - 1]}|${parts[0][0]}`;
}

function push(map, key, value) {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}

/** @param {PersonRow[]} people */
export function buildPersonIndex(people) {
  const byEmail = new Map();
  const byName = new Map();
  const byLastFirstInitial = new Map();

  for (const person of people) {
    if (person.email) push(byEmail, String(person.email).trim().toLowerCase(), person);
    if (person.name) {
      push(byName, normalizeName(person.name), person);
      const key = lastFirstInitial(person.name);
      if (key) push(byLastFirstInitial, key, person);
    }
  }

  return { byEmail, byName, byLastFirstInitial, count: people.length };
}

/**
 * Resolve a Slack poster to a `person` document.
 *
 * Email first, then an exact normalized name, then last name plus first
 * initial. An ambiguous match is reported rather than guessed: a wrong byline
 * on a lab member's news is worse than an item that waits for an answer.
 */
export function matchPerson(index, who) {
  const email = who.email ? String(who.email).trim().toLowerCase() : '';
  if (email) {
    const hits = index.byEmail.get(email);
    if (hits && hits.length === 1) return { status: 'matched', person: hits[0], how: 'email' };
    if (hits && hits.length > 1) return { status: 'ambiguous', candidates: hits, how: 'email' };
  }

  const name = who.name ? String(who.name).trim() : '';
  if (name) {
    const exact = index.byName.get(normalizeName(name));
    if (exact && exact.length === 1) return { status: 'matched', person: exact[0], how: 'name' };
    if (exact && exact.length > 1) return { status: 'ambiguous', candidates: exact, how: 'name' };

    const key = lastFirstInitial(name);
    if (key) {
      const loose = index.byLastFirstInitial.get(key);
      if (loose && loose.length === 1)
        return { status: 'matched', person: loose[0], how: 'last-initial' };
      if (loose && loose.length > 1)
        return { status: 'ambiguous', candidates: loose, how: 'last-initial' };
    }
  }

  return { status: 'none' };
}

/* -------------------------------------------------------------------------- */
/* Slugs and ids                                                              */
/* -------------------------------------------------------------------------- */

/** Truncate on a word boundary, never mid-word, never past `max`. */
export function truncateAtWord(input, max) {
  const text = String(input).trim();
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(' ');
  const base = lastSpace > max * 0.5 ? clipped.slice(0, lastSpace) : clipped;
  return base.replace(/[\s\-–—,;:.]+$/, '').trim();
}

/** Matches the `slugify` in the news schema, then trims to SLUG_MAX. */
export function slugifyTitle(title, max = SLUG_MAX) {
  const base = String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (base.length <= max) return base;
  const clipped = base.slice(0, max);
  const lastDash = clipped.lastIndexOf('-');
  return (lastDash > max * 0.5 ? clipped.slice(0, lastDash) : clipped).replace(/-+$/, '');
}

/** Append -2, -3 ... until the slug is free, staying inside SLUG_MAX. */
export function uniqueSlug(base, taken) {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 200; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, SLUG_MAX - suffix.length).replace(/-+$/, '')}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Could not find a free slug for "${base}"`);
}

/**
 * Document id derived from the Slack timestamp, so a rerun over the same
 * message lands on the same document instead of creating a second one.
 */
export function docIdForSlackTs(slackTs) {
  return `news-slack-${String(slackTs).replace(/[^0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/** Slack timestamps are seconds with a microsecond fraction. */
export function slackTsToIso(slackTs) {
  const seconds = Number.parseFloat(slackTs);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(Math.round(seconds * 1000)).toISOString();
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Bring one drafted item in line with what the news schema will accept.
 *
 * Anything recoverable is repaired and reported as a warning. Dropping a
 * member's update over a long excerpt would teach the group that the channel
 * does not work, which is the failure this whole workflow exists to prevent.
 * Only a missing title, excerpt, body or timestamp is fatal.
 */
export function validateItem(item, now = new Date()) {
  const errors = [];
  const warnings = [];

  if (!item || !item.slackTs || !/^\d+\.\d+$/.test(String(item.slackTs))) {
    errors.push(`slackTs is missing or malformed: ${JSON.stringify(item && item.slackTs)}`);
  }

  let title = String((item && item.title) || '').trim().replace(/\s+/g, ' ');
  if (title.length < TITLE_MIN) {
    errors.push(`title is missing or shorter than ${TITLE_MIN} characters`);
  } else if (title.length > TITLE_MAX) {
    title = truncateAtWord(title, TITLE_MAX);
    warnings.push(`title was longer than ${TITLE_MAX} characters and was trimmed`);
  }

  let excerpt = String((item && item.excerpt) || '').trim().replace(/\s+/g, ' ');
  if (!excerpt) {
    errors.push('excerpt is missing');
  } else if (excerpt.length > EXCERPT_MAX) {
    excerpt = truncateAtWord(excerpt, EXCERPT_MAX);
    warnings.push(`excerpt was longer than ${EXCERPT_MAX} characters and was trimmed`);
  }

  const content = String((item && item.content) || '').trim();
  if (!content) errors.push('content is missing');
  else if (content.length < 120)
    warnings.push('content is very short; worth a look before publishing');

  let category = String((item && item.category) || '').trim();
  if (!NEWS_CATEGORIES.includes(category)) {
    if (item && item.category)
      warnings.push(`category "${item.category}" is not in the schema; used "general"`);
    category = 'general';
  }

  let publishedAt = (item && item.publishedAt) || '';
  if (publishedAt && Number.isNaN(Date.parse(publishedAt))) {
    warnings.push(`publishedAt "${publishedAt}" is not a valid date; used the Slack message time`);
    publishedAt = '';
  }
  if (!publishedAt) publishedAt = slackTsToIso(item && item.slackTs) || now.toISOString();
  else publishedAt = new Date(publishedAt).toISOString();

  const tags = Array.from(
    new Set(((item && item.tags) || []).map((t) => String(t).trim()).filter(Boolean)),
  ).slice(0, 12);

  let image;
  if (item && item.image && (item.image.path || item.image.url)) {
    let alt = String(item.image.alt || '').trim();
    if (!alt) {
      alt = defaultImageAlt(title);
      warnings.push(
        'no alt text was drafted for the photo; using the general default, which Kelly can replace in the Studio',
      );
    }
    image = { ...item.image, alt };
  }

  const rawLinks = (item && item.externalLinks) || [];
  const externalLinks = rawLinks
    .filter((l) => l && l.url && /^https?:\/\//i.test(l.url))
    .map((l) => ({
      title: String(l.title || l.url).trim().slice(0, 120),
      url: l.url,
      description: l.description ? String(l.description).trim() : undefined,
    }));
  const dropped = rawLinks.length - externalLinks.length;
  if (dropped > 0) warnings.push(`${dropped} external link(s) dropped: not an http(s) URL`);

  if (errors.length) return { ok: false, errors, warnings };

  return {
    ok: true,
    warnings,
    value: { title, excerpt, content, category, publishedAt, tags, image, externalLinks },
  };
}

/* -------------------------------------------------------------------------- */
/* Document assembly                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Build the draft document.
 *
 * `status` is always 'draft' and the id always carries the `drafts.` prefix.
 * The site renders `status == "published"` only, so nothing this script writes
 * can appear on waveslab.org until Kelly publishes it in the Studio.
 */
export function buildNewsDocument(args) {
  const { item, normalized, slug, docId, author, imageAssetId, relatedPersonIds, capturedAt } =
    args;

  const doc = {
    _id: `drafts.${docId}`,
    _type: 'news',
    title: normalized.title,
    slug: { _type: 'slug', current: slug },
    excerpt: normalized.excerpt,
    content: normalized.content,
    publishedAt: normalized.publishedAt,
    author: { _type: 'reference', _ref: author._id },
    category: normalized.category,
    status: 'draft',
    isFeatured: false,
    isSticky: false,
    intake: {
      source: 'slack',
      slackTs: item.slackTs,
      slackChannel: item.slackChannel,
      slackChannelId: item.slackChannelId,
      slackPermalink: item.slackPermalink,
      slackUserId: item.slackUserId,
      submittedByName: item.submittedByName,
      capturedAt,
    },
  };

  if (normalized.tags.length) doc.tags = normalized.tags;

  if (imageAssetId && normalized.image) {
    doc.featuredImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: imageAssetId },
      alt: (normalized.image.alt || '').trim() || defaultImageAlt(doc.title),
      caption: normalized.image.caption || undefined,
      credit: normalized.image.credit || item.submittedByName || undefined,
    };
  }

  const related = (relatedPersonIds || []).filter((id) => id && id !== author._id);
  if (related.length) {
    doc.relatedPeople = related.map((id, i) => ({
      _type: 'reference',
      _ref: id,
      _key: `rel-${i}-${id.slice(-6)}`,
    }));
  }

  if (normalized.externalLinks.length) {
    doc.externalLinks = normalized.externalLinks.map((link, i) => ({
      _key: `link-${i}`,
      title: link.title,
      url: link.url,
      ...(link.description ? { description: link.description } : {}),
    }));
  }

  return pruneUndefined(doc);
}

/** Sanity rejects an explicit `undefined`; drop those keys before writing. */
export function pruneUndefined(value) {
  if (Array.isArray(value)) return value.map(pruneUndefined);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = pruneUndefined(v);
    }
    return out;
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Corrections                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fields a correction posted in Slack is allowed to change. Everything else on
 * the document, including anything Kelly has already edited in the Studio, is
 * out of reach of the intake.
 */
export const PATCHABLE = [
  'title',
  'excerpt',
  'content',
  'category',
  'tags',
  'publishedAt',
  'externalLinks',
  'relatedPeople',
];

function sameJson(a, b) {
  return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
}

/**
 * Diff a corrected item against the draft that already exists and produce the
 * `set` for a Sanity patch.
 *
 * Only fields that actually changed are written, so a rerun over the same
 * correction is a no-op, and a field Kelly has already fixed by hand is not
 * overwritten with the member's original wording unless the member changed it.
 *
 * The slug moves with the title only when the current slug is still the one
 * derived from the old title. A hand-edited slug is left alone, because the
 * URL may already have been shared.
 */
export function buildCorrectionPatch(args) {
  const { existing, normalized, relatedPersonIds, correctionTs, takenSlugs } = args;
  const set = {};
  const changed = [];
  const warnings = [];

  const next = {
    title: normalized.title,
    excerpt: normalized.excerpt,
    content: normalized.content,
    category: normalized.category,
    publishedAt: normalized.publishedAt,
    tags: normalized.tags.length ? normalized.tags : undefined,
    externalLinks: normalized.externalLinks.length
      ? normalized.externalLinks.map((link, i) => ({
          _key: `link-${i}`,
          title: link.title,
          url: link.url,
          ...(link.description ? { description: link.description } : {}),
        }))
      : undefined,
    relatedPeople: (relatedPersonIds || []).length
      ? relatedPersonIds.map((id, i) => ({
          _type: 'reference',
          _ref: id,
          _key: `rel-${i}-${id.slice(-6)}`,
        }))
      : undefined,
  };

  for (const field of PATCHABLE) {
    if (next[field] === undefined) continue;
    if (!sameJson(existing[field], next[field])) {
      set[field] = next[field];
      changed.push(field);
    }
  }

  if (changed.includes('title')) {
    const oldDerived = slugifyTitle(existing.title || '');
    const currentSlug = (existing.slug && existing.slug.current) || '';
    if (currentSlug === oldDerived) {
      const taken = new Set(takenSlugs || []);
      taken.delete(currentSlug);
      set.slug = { _type: 'slug', current: uniqueSlug(slugifyTitle(normalized.title), taken) };
      changed.push('slug');
    } else {
      warnings.push(`slug "${currentSlug}" was edited by hand, so it was left as it is`);
    }
  }

  if (changed.length) set['intake.lastCorrectionTs'] = correctionTs;

  return { set, changed, warnings };
}

/**
 * A correction already applied must not be applied again. Slack timestamps sort
 * lexicographically as well as numerically for messages of the same era, but
 * compare as numbers to be safe.
 */
export function correctionAlreadyApplied(existing, correctionTs) {
  const last = existing && existing.intake && existing.intake.lastCorrectionTs;
  if (!last) return false;
  return Number.parseFloat(last) >= Number.parseFloat(correctionTs);
}

/* -------------------------------------------------------------------------- */
/* Review: edits, publishing, discarding                                      */
/* -------------------------------------------------------------------------- */

/** Fields Kelly can change from chat when he approves an item. */
export const EDITABLE = [
  'title',
  'excerpt',
  'content',
  'category',
  'tags',
  'publishedAt',
  'isFeatured',
];

/**
 * Turn "publish it but call it X" into a Sanity `set`.
 *
 * Same slug rule as a member correction: the slug follows the title only while
 * it is still the one derived from the old title.
 */
export function buildEditPatch(existing, edits, takenSlugs) {
  const set = {};
  const changed = [];
  const warnings = [];

  for (const field of EDITABLE) {
    if (edits[field] === undefined) continue;
    let value = edits[field];
    if (field === 'title') value = String(value).trim().replace(/\s+/g, ' ');
    if (field === 'excerpt') {
      value = String(value).trim().replace(/\s+/g, ' ');
      if (value.length > EXCERPT_MAX) {
        value = truncateAtWord(value, EXCERPT_MAX);
        warnings.push(`excerpt was longer than ${EXCERPT_MAX} characters and was trimmed`);
      }
    }
    if (field === 'category' && !NEWS_CATEGORIES.includes(value)) {
      warnings.push(`category "${value}" is not in the schema and was ignored`);
      continue;
    }
    if (field === 'publishedAt') {
      if (Number.isNaN(Date.parse(value))) {
        warnings.push(`publishedAt "${value}" is not a valid date and was ignored`);
        continue;
      }
      value = new Date(value).toISOString();
    }
    if (JSON.stringify(existing[field]) === JSON.stringify(value)) continue;
    set[field] = value;
    changed.push(field);
  }

  if (changed.includes('title')) {
    const currentSlug = (existing.slug && existing.slug.current) || '';
    if (currentSlug === slugifyTitle(existing.title || '')) {
      const taken = new Set(takenSlugs || []);
      taken.delete(currentSlug);
      set.slug = { _type: 'slug', current: uniqueSlug(slugifyTitle(set.title), taken) };
      changed.push('slug');
    } else {
      warnings.push(`slug "${currentSlug}" was edited by hand, so it was left as it is`);
    }
  }

  return { set, changed, warnings };
}

/** Everything the site needs before an item can go live. */
export function readyToPublish(doc) {
  const missing = [];
  if (!doc) return { ok: false, missing: ['the document itself'] };
  if (!doc.title || String(doc.title).trim().length < TITLE_MIN) missing.push('title');
  if (!doc.slug || !doc.slug.current) missing.push('slug');
  if (!doc.excerpt || !String(doc.excerpt).trim()) missing.push('excerpt');
  if (!doc.content || !String(doc.content).trim()) missing.push('content');
  if (!doc.publishedAt || Number.isNaN(Date.parse(doc.publishedAt))) missing.push('publishedAt');
  if (!doc.author || !doc.author._ref) missing.push('author');
  if (!doc.category || !NEWS_CATEGORIES.includes(doc.category)) missing.push('category');
  return { ok: missing.length === 0, missing };
}

/**
 * Mutations that take a draft live.
 *
 * Two things have to happen together. The document has to move out of the
 * `drafts.` namespace, which is what Sanity treats as published, and the
 * `status` field has to read `published`, which is what the site's queries
 * filter on. Doing one without the other leaves an item that looks live in the
 * Studio and is invisible on the page, or the reverse.
 *
 * `createOrReplace` then `delete` runs as one transaction, so a failure leaves
 * the draft where it was rather than losing the item.
 */
export function buildPublishMutations(draftDoc, options = {}) {
  const publishedId = String(draftDoc._id).replace(/^drafts\./, '');
  const doc = { ...draftDoc, _id: publishedId, status: 'published' };
  delete doc._rev;
  delete doc._createdAt;
  delete doc._updatedAt;
  if (options.approvedAt) {
    doc.intake = { ...(doc.intake || {}), approvedAt: options.approvedAt, approvedVia: 'slack' };
  }
  return {
    publishedId,
    mutations: [{ createOrReplace: doc }, { delete: { id: draftDoc._id } }],
  };
}

/** Only ever discard a draft that this pipeline created. */
export function canDiscard(doc) {
  if (!doc) return { ok: false, reason: 'the document could not be read' };
  if (!String(doc._id).startsWith('drafts.')) {
    return { ok: false, reason: 'the item is already published' };
  }
  if (!doc.intake || doc.intake.source !== 'slack') {
    return { ok: false, reason: 'the item did not come from the Slack intake' };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Studio links                                                               */
/* -------------------------------------------------------------------------- */

export function studioLink(studioBase, docId) {
  return `${String(studioBase).replace(/\/$/, '')}/desk/news;${docId}`;
}

/**
 * A link that renders the draft as the page it will become, using the site's
 * own preview route. This is the review surface, not the Studio.
 */
export function previewLink(siteBase, slug, secret) {
  const base = String(siteBase).replace(/\/$/, '');
  if (!secret) return null;
  return `${base}/api/preview?secret=${encodeURIComponent(secret)}&type=news&slug=${encodeURIComponent(slug)}`;
}

export function liveLink(siteBase, slug) {
  return `${String(siteBase).replace(/\/$/, '')}/news/${slug}`;
}
