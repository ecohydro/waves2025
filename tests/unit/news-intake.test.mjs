import { describe, expect, it } from 'vitest';
import { defaultImageAlt } from '../../src/lib/cms/image-alt.mjs';

import {
  buildCorrectionPatch,
  buildEditPatch,
  buildNewsDocument,
  buildPublishMutations,
  canDiscard,
  buildPersonIndex,
  correctionAlreadyApplied,
  docIdForSlackTs,
  liveLink,
  matchPerson,
  previewLink,
  readyToPublish,
  slackTsToIso,
  slugifyTitle,
  studioLink,
  truncateAtWord,
  uniqueSlug,
  validateItem,
} from '../../scripts/news-intake-core.mjs';

const PEOPLE = [
  { _id: 'person-kelly-caylor', name: 'Kelly K. Caylor', email: 'caylor@ucsb.edu' },
  { _id: 'person-bryn-morgan', name: 'Bryn Morgan', email: 'brynmorgan@ucsb.edu' },
  { _id: 'person-natasha-krell', name: 'Natasha Krell' },
  { _id: 'person-jose-nunez', name: 'José Núñez' },
  { _id: 'person-rachel-green', name: 'Rachel Green' },
  { _id: 'person-robin-green', name: 'Robin Green' },
];

const INDEX = buildPersonIndex(PEOPLE);

const BASE_ITEM = {
  slackTs: '1786377522.028519',
  slackChannel: 'waves-news',
  slackChannelId: 'C0NEWS',
  slackPermalink: 'https://ecohydrology.slack.com/archives/C0NEWS/p1786377522028519',
  slackUserId: 'U123',
  submittedByName: 'Bryn Morgan',
  authorEmail: 'brynmorgan@ucsb.edu',
  title: 'Bryn Morgan receives a NASA FINESST fellowship',
  excerpt: 'Bryn Morgan has been awarded a NASA FINESST fellowship for work on plant water stress.',
  content:
    'Bryn Morgan has been awarded a NASA FINESST fellowship supporting three years of doctoral research on how plant water stress can be read from soil moisture dynamics. The award funds fieldwork at Sedgwick Reserve and a collaboration with JPL.',
  category: 'award',
};

describe('matching a Slack poster to a person document', () => {
  it('matches on email first', () => {
    const m = matchPerson(INDEX, { email: 'CAYLOR@ucsb.edu', name: 'Someone Else' });
    expect(m.status).toBe('matched');
    expect(m.person._id).toBe('person-kelly-caylor');
    expect(m.how).toBe('email');
  });

  it('matches an exact name regardless of accents and punctuation', () => {
    const m = matchPerson(INDEX, { name: 'jose nunez' });
    expect(m.status).toBe('matched');
    expect(m.person._id).toBe('person-jose-nunez');
  });

  it('falls back to last name plus first initial', () => {
    const m = matchPerson(INDEX, { name: 'Kelly Caylor' });
    expect(m.status).toBe('matched');
    expect(m.person._id).toBe('person-kelly-caylor');
    expect(m.how).toBe('last-initial');
  });

  it('reports ambiguity rather than guessing', () => {
    const m = matchPerson(INDEX, { name: 'R. Green' });
    expect(m.status).toBe('ambiguous');
    expect(m.candidates).toHaveLength(2);
  });

  it('returns none for someone outside the lab', () => {
    expect(matchPerson(INDEX, { name: 'Ada Lovelace' }).status).toBe('none');
  });
});

describe('slugs and document ids', () => {
  it('slugifies the way the news schema does', () => {
    expect(slugifyTitle('Bryn Morgan receives a NASA FINESST fellowship!')).toBe(
      'bryn-morgan-receives-a-nasa-finesst-fellowship',
    );
  });

  it('truncates a long title on a word boundary', () => {
    const slug = slugifyTitle(
      'WAVES lab members present eleven posters and four talks at the AGU fall meeting in San Francisco this December',
    );
    expect(slug.length).toBeLessThanOrEqual(96);
    expect(slug.endsWith('-')).toBe(false);
    expect(slug).toBe(
      'waves-lab-members-present-eleven-posters-and-four-talks-at-the-agu-fall-meeting-in-san',
    );
  });

  it('suffixes a colliding slug and stays within the limit', () => {
    expect(uniqueSlug('agu-fall-meeting-2026', new Set(['agu-fall-meeting-2026']))).toBe(
      'agu-fall-meeting-2026-2',
    );
    const long = 'a'.repeat(96);
    expect(uniqueSlug(long, new Set([long])).length).toBeLessThanOrEqual(96);
  });

  it('derives a stable document id from the Slack timestamp', () => {
    expect(docIdForSlackTs('1786377522.028519')).toBe('news-slack-1786377522-028519');
    expect(docIdForSlackTs('1786377522.028519')).toBe(docIdForSlackTs('1786377522.028519'));
  });

  it('reads a Slack timestamp as a date', () => {
    expect(slackTsToIso('1786377522.028519')).toBe('2026-08-10T15:58:42.029Z');
    expect(slackTsToIso('not-a-timestamp')).toBeNull();
  });

  it('truncates text on a word boundary', () => {
    expect(truncateAtWord('one two three four', 12)).toBe('one two');
    expect(truncateAtWord('short', 40)).toBe('short');
  });
});

describe('validating a drafted item', () => {
  it('accepts a well formed item', () => {
    const result = validateItem(BASE_ITEM);
    expect(result.ok).toBe(true);
    expect(result.value.category).toBe('award');
    expect(result.value.publishedAt).toBe('2026-08-10T15:58:42.029Z');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects an item with no body', () => {
    const result = validateItem({ ...BASE_ITEM, content: '   ' });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('content');
  });

  it('rejects a malformed Slack timestamp', () => {
    expect(validateItem({ ...BASE_ITEM, slackTs: '17863775' }).ok).toBe(false);
  });

  it('trims an over-long excerpt instead of dropping the item', () => {
    const result = validateItem({ ...BASE_ITEM, excerpt: 'word '.repeat(100) });
    expect(result.ok).toBe(true);
    expect(result.value.excerpt.length).toBeLessThanOrEqual(300);
    expect(result.warnings.join(' ')).toContain('excerpt');
  });

  it('falls back to the general category and says so', () => {
    const result = validateItem({ ...BASE_ITEM, category: 'fieldwork' });
    expect(result.ok).toBe(true);
    expect(result.value.category).toBe('general');
    expect(result.warnings.join(' ')).toContain('fieldwork');
  });

  it('keeps a photo that has no alt text and gives it the general default', () => {
    const result = validateItem({ ...BASE_ITEM, image: { url: 'https://files.slack.com/x.jpg' } });
    expect(result.ok).toBe(true);
    expect(result.value.image.alt).toBe(defaultImageAlt(result.value.title));
    expect(result.warnings.join(' ')).toContain('alt text');
  });

  it('keeps a photo that has alt text', () => {
    const result = validateItem({
      ...BASE_ITEM,
      image: { url: 'https://files.slack.com/x.jpg', alt: 'Bryn holding a sap flow sensor' },
    });
    expect(result.ok).toBe(true);
    expect(result.value.image.alt).toBe('Bryn holding a sap flow sensor');
  });

  it('drops a link that is not an http URL', () => {
    const result = validateItem({
      ...BASE_ITEM,
      externalLinks: [
        { title: 'ok', url: 'https://nasa.gov' },
        { title: 'bad', url: 'nasa.gov' },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.value.externalLinks).toHaveLength(1);
    expect(result.warnings.join(' ')).toContain('dropped');
  });
});

describe('assembling the Sanity document', () => {
  const result = validateItem({
    ...BASE_ITEM,
    tags: ['NASA', 'fellowship', 'NASA'],
    image: { url: 'https://files.slack.com/x.jpg', alt: 'Bryn in the field' },
    externalLinks: [{ title: 'FINESST', url: 'https://nasa.gov/finesst' }],
  });

  const doc = buildNewsDocument({
    item: BASE_ITEM,
    normalized: result.value,
    slug: 'bryn-morgan-receives-a-nasa-finesst-fellowship',
    docId: 'news-slack-1786377522-028519',
    author: PEOPLE[1],
    imageAssetId: 'image-abc-2000x1500-jpg',
    relatedPersonIds: ['person-kelly-caylor'],
    capturedAt: '2026-08-11T22:00:00.000Z',
  });

  it('writes a draft the public site cannot render', () => {
    expect(doc._id).toBe('drafts.news-slack-1786377522-028519');
    expect(doc.status).toBe('draft');
  });

  it('links the author to a person document', () => {
    expect(doc.author).toEqual({ _type: 'reference', _ref: 'person-bryn-morgan' });
  });

  it('records where the item came from', () => {
    expect(doc.intake).toMatchObject({
      source: 'slack',
      slackTs: '1786377522.028519',
      slackChannel: 'waves-news',
      submittedByName: 'Bryn Morgan',
    });
  });

  it('deduplicates tags', () => {
    expect(doc.tags).toEqual(['NASA', 'fellowship']);
  });

  it('gives every array member a _key', () => {
    for (const arr of [doc.relatedPeople, doc.externalLinks]) {
      expect(Array.isArray(arr)).toBe(true);
      for (const member of arr) expect(member._key).toBeTruthy();
    }
  });

  it('attaches the photo with alt text and a credit', () => {
    expect(doc.featuredImage).toMatchObject({
      _type: 'image',
      asset: { _type: 'reference', _ref: 'image-abc-2000x1500-jpg' },
      alt: 'Bryn in the field',
      credit: 'Bryn Morgan',
    });
  });

  it('does not list the author again as a featured person', () => {
    const selfCredited = buildNewsDocument({
      item: BASE_ITEM,
      normalized: result.value,
      slug: 'x',
      docId: 'news-slack-1',
      author: PEOPLE[1],
      relatedPersonIds: ['person-bryn-morgan'],
      capturedAt: '2026-08-11T22:00:00.000Z',
    });
    expect(selfCredited.relatedPeople).toBeUndefined();
  });

  it('omits keys rather than writing undefined', () => {
    expect(JSON.stringify(doc)).not.toContain('undefined');
  });
});

describe('applying a correction to a draft', () => {
  const existingDoc = {
    _id: 'drafts.news-slack-1786377522-028519',
    _type: 'news',
    title: 'Bryn Morgan receives a NASA FINESST fellowship',
    slug: { _type: 'slug', current: 'bryn-morgan-receives-a-nasa-finesst-fellowship' },
    excerpt: 'Bryn Morgan has been awarded a NASA FINESST fellowship for work on plant water stress.',
    content: BASE_ITEM.content,
    category: 'award',
    publishedAt: '2026-08-10T15:58:42.029Z',
    intake: { slackTs: '1786377522.028519' },
  };

  const correct = (overrides) => {
    const validation = validateItem({ ...BASE_ITEM, ...overrides });
    return buildCorrectionPatch({
      existing: existingDoc,
      normalized: validation.value,
      relatedPersonIds: [],
      correctionTs: '1786400000.000100',
      takenSlugs: new Set([existingDoc.slug.current]),
    });
  };

  it('writes nothing when the correction changes nothing', () => {
    const patch = correct({});
    expect(patch.changed).toHaveLength(0);
    expect(patch.set).toEqual({});
  });

  it('sets only the fields that actually differ', () => {
    const patch = correct({ category: 'research' });
    expect(patch.changed).toEqual(['category']);
    expect(patch.set.category).toBe('research');
    expect(patch.set.content).toBeUndefined();
  });

  it('stamps the correction so a rerun is a no-op', () => {
    const patch = correct({ category: 'research' });
    expect(patch.set['intake.lastCorrectionTs']).toBe('1786400000.000100');
  });

  it('moves the slug with the title while the slug is untouched', () => {
    const patch = correct({ title: 'Bryn Morgan wins a NASA FINESST fellowship' });
    expect(patch.changed).toContain('slug');
    expect(patch.set.slug.current).toBe('bryn-morgan-wins-a-nasa-finesst-fellowship');
  });

  it('leaves a hand-edited slug alone and says so', () => {
    const validation = validateItem({ ...BASE_ITEM, title: 'A different title entirely' });
    const patch = buildCorrectionPatch({
      existing: { ...existingDoc, slug: { current: 'kellys-own-url' } },
      normalized: validation.value,
      relatedPersonIds: [],
      correctionTs: '1786400000.000100',
      takenSlugs: new Set(['kellys-own-url']),
    });
    expect(patch.changed).not.toContain('slug');
    expect(patch.warnings.join(' ')).toContain('by hand');
  });

  it('recognises a correction that was already applied', () => {
    const doc = { intake: { lastCorrectionTs: '1786400000.000100' } };
    expect(correctionAlreadyApplied(doc, '1786400000.000100')).toBe(true);
    expect(correctionAlreadyApplied(doc, '1786500000.000100')).toBe(false);
    expect(correctionAlreadyApplied({ intake: {} }, '1786400000.000100')).toBe(false);
  });
});

describe('review: edits, publishing, discarding', () => {
  const draft = {
    _id: 'drafts.news-slack-1786377522-028519',
    _rev: 'abc',
    _createdAt: '2026-08-10T16:00:00.000Z',
    _type: 'news',
    title: 'Bryn Morgan receives a NASA FINESST fellowship',
    slug: { _type: 'slug', current: 'bryn-morgan-receives-a-nasa-finesst-fellowship' },
    excerpt: 'Bryn Morgan has been awarded a NASA FINESST fellowship.',
    content: BASE_ITEM.content,
    category: 'award',
    publishedAt: '2026-08-10T15:58:42.029Z',
    author: { _type: 'reference', _ref: 'person-bryn-morgan' },
    status: 'draft',
    intake: { source: 'slack', slackTs: '1786377522.028519' },
  };

  it('applies an edit Kelly asked for and moves the slug with it', () => {
    const patch = buildEditPatch(draft, { title: 'Bryn Morgan wins a NASA fellowship' }, new Set([draft.slug.current]));
    expect(patch.changed).toContain('title');
    expect(patch.set.slug.current).toBe('bryn-morgan-wins-a-nasa-fellowship');
  });

  it('ignores an edit that is not a real category', () => {
    const patch = buildEditPatch(draft, { category: 'fieldwork' }, new Set());
    expect(patch.changed).toHaveLength(0);
    expect(patch.warnings.join(' ')).toContain('not in the schema');
  });

  it('ignores an unparseable date', () => {
    const patch = buildEditPatch(draft, { publishedAt: 'last tuesday' }, new Set());
    expect(patch.changed).toHaveLength(0);
    expect(patch.warnings.join(' ')).toContain('not a valid date');
  });

  it('refuses to edit a field that is not Kelly\'s to set from chat', () => {
    const patch = buildEditPatch(draft, { author: { _ref: 'person-someone-else' } }, new Set());
    expect(patch.changed).toHaveLength(0);
  });

  it('knows when an item is ready to publish', () => {
    expect(readyToPublish(draft).ok).toBe(true);
    expect(readyToPublish({ ...draft, author: undefined }).missing).toContain('author');
    expect(readyToPublish({ ...draft, excerpt: '' }).missing).toContain('excerpt');
    // A missing alt no longer blocks publishing: the intake fills the general default.
    expect(
      readyToPublish({ ...draft, featuredImage: { asset: { _ref: 'image-1' } } }).ok,
    ).toBe(true);
  });

  it('publishes by moving the id out of drafts and setting the status field', () => {
    const { publishedId, mutations } = buildPublishMutations(draft, {
      approvedAt: '2026-08-12T17:00:00.000Z',
    });
    expect(publishedId).toBe('news-slack-1786377522-028519');
    const created = mutations[0].createOrReplace;
    expect(created._id).toBe('news-slack-1786377522-028519');
    expect(created.status).toBe('published');
    expect(created._rev).toBeUndefined();
    expect(created._createdAt).toBeUndefined();
    expect(created.intake.approvedVia).toBe('slack');
    expect(mutations[1].delete.id).toBe('drafts.news-slack-1786377522-028519');
  });

  it('discards only a draft this pipeline created', () => {
    expect(canDiscard(draft).ok).toBe(true);
    expect(canDiscard({ ...draft, _id: 'news-slack-1' }).reason).toContain('already published');
    expect(canDiscard({ ...draft, intake: { source: 'studio' } }).reason).toContain('Slack intake');
  });
});

describe('links', () => {
  it('points at the document in the desk tool', () => {
    expect(studioLink('https://waveslab.org/studio/', 'news-slack-1')).toBe(
      'https://waveslab.org/studio/desk/news;news-slack-1',
    );
  });

  it('builds a preview link only when a secret exists', () => {
    expect(previewLink('https://www.waveslab.org', 'a-slug', 's3cret')).toBe(
      'https://www.waveslab.org/api/preview?secret=s3cret&type=news&slug=a-slug',
    );
    expect(previewLink('https://www.waveslab.org', 'a-slug', undefined)).toBeNull();
  });

  it('builds the live URL', () => {
    expect(liveLink('https://www.waveslab.org/', 'a-slug')).toBe(
      'https://www.waveslab.org/news/a-slug',
    );
  });
});
