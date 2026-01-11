#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import matter from 'gray-matter';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type SanityPerson = {
  _id: string;
  name: string;
  slug?: { current: string };
  title?: string;
  userGroup?: string;
  education?: Array<{ degree?: string; field?: string; institution?: string; year?: number }>;
  leaveDate?: string;
  currentPosition?: string;
  keywords?: string[];
  seo?: { keywords?: string[] };
};

function inferFromKeywords(person: SanityPerson) {
  const normalizeToken = (k: string) =>
    k
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  const tokens = new Set((person.keywords || []).map(normalizeToken));

  // Exact role tokens per requirement
  const roleTokens = {
    phd: ['phd_graduate', 'graduate_student'],
    postdoc: ['postdoc', 'postdoctoral_researcher', 'postdoctoral_fellow'],
  } as const;

  const isPostdoc = roleTokens.postdoc.some((t) => tokens.has(t));
  const isPhD = roleTokens.phd.some((t) => tokens.has(t));
  const isGradStudent = tokens.has('graduate_student');

  let category: 'phd' | 'postdoc' | null = null;
  if (isPostdoc) category = 'postdoc';
  else if (isPhD) category = 'phd';
  else if (isGradStudent) category = 'phd'; // treat grad students under PhD track

  // Affiliation detection: token contains
  const contains = (needle: string) => Array.from(tokens).some((t) => t.includes(needle));
  let institution: string | null = null;
  if (contains('princeton')) institution = 'Princeton University';
  else if (contains('indiana')) institution = 'Indiana University';
  else if (contains('ucsb') || contains('santa_barbara'))
    institution = 'University of California, Santa Barbara';

  // Proposed position from keywords
  let positionFromKeywords: string | null = null;
  if (category === 'postdoc') positionFromKeywords = 'Postdoctoral Researcher';
  else if (isPhD) positionFromKeywords = 'PhD Graduate';
  else if (isGradStudent) positionFromKeywords = 'Graduate Student';

  return { category, institution, positionFromKeywords };
}

async function fetchAlumni(): Promise<SanityPerson[]> {
  const mod: any = await import('../src/lib/cms/client');
  const q = `*[_type == "person" && userGroup == "alumni"] | order(leaveDate desc, name asc) {
    _id, name, slug, title, userGroup, education, leaveDate, currentPosition, keywords, seo
  }`;
  return mod.client.fetch(q);
}

function buildMdxKeywordIndex(): Map<string, string[]> {
  const mdxDir = path.resolve(process.cwd(), 'content/people');
  const files = globSync('*.mdx', { cwd: mdxDir, absolute: true });
  const slugToKeywords = new Map<string, string[]>();

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const fm = matter(raw).data as any;
      const slug: string | undefined = fm.slug || fm.name?.toLowerCase().replace(/\s+/g, '-');
      if (!slug) continue;
      const tags: string[] = Array.isArray(fm.tags) ? fm.tags : [];
      const statusToken: string | null = fm.status ? normalize(String(fm.status)) : null;
      const tokens = new Set<string>();
      for (const t of tags) tokens.add(normalize(String(t)));
      if (statusToken) tokens.add(statusToken);

      // Map common legacy tags to our role tokens
      const mapped: string[] = [];
      for (const t of Array.from(tokens)) {
        if (t.includes('postdoc') || t.includes('post_doctoral')) {
          mapped.push('postdoc');
        } else if (t.includes('postdoctoral_fellow')) {
          mapped.push('postdoctoral_fellow');
        } else if (t.includes('postdoctoral_researcher')) {
          mapped.push('postdoctoral_researcher');
        } else if (t === 'graduate_student' || t.includes('phd_student')) {
          mapped.push('graduate_student');
        } else if (t.includes('phd_graduate') || t === 'phd') {
          mapped.push('phd_graduate');
        }

        // affiliations
        if (t === 'princeton' || t.includes('princeton')) mapped.push('princeton');
        if (t === 'indiana' || t.includes('indiana')) mapped.push('indiana');
        if (t === 'ucsb' || t.includes('santa_barbara')) mapped.push('ucsb');
      }

      if (mapped.length > 0) slugToKeywords.set(slug, Array.from(new Set(mapped)));
    } catch {
      // ignore parse errors
    }
  }

  return slugToKeywords;
}

async function main() {
  const people = await fetchAlumni();
  console.error(`(info) alumni total: ${people.length}`);
  const mdxIndex = buildMdxKeywordIndex();
  const filtered = people
    .map((p) => {
      // prefer seo.keywords, then keywords, then MDX-derived tokens by slug
      let personWithKw = p;
      const kw =
        p.seo?.keywords && p.seo.keywords.length > 0
          ? p.seo.keywords
          : p.keywords && p.keywords.length > 0
            ? p.keywords
            : undefined;
      if (!kw && p.slug?.current) {
        const mdxKw = mdxIndex.get(p.slug.current);
        if (mdxKw && mdxKw.length > 0) personWithKw = { ...p, keywords: mdxKw } as any;
      } else if (kw) {
        personWithKw = { ...p, keywords: kw } as any;
      }

      const info = inferFromKeywords(personWithKw);
      // fallback if keywords missing
      if (!info.category) {
        const title = (p.title || '').toLowerCase();
        if (/(postdoc|post-doc|postdoctoral)/.test(title)) info.category = 'postdoc';
        else if (/(ph\.?d|doctoral|dphil|graduate student)/.test(title)) info.category = 'phd';
      }
      return { ...p, ...info } as SanityPerson & {
        category: 'phd' | 'postdoc' | null;
        institution?: string | null;
        positionFromKeywords?: string | null;
      };
    })
    .filter((p) => p.category === 'phd' || p.category === 'postdoc');
  console.error(`(info) matched phd/postdoc by keywords/title: ${filtered.length}`);

  const list = filtered.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug?.current || null,
    title: p.title || null,
    category: p.category,
    leaveDate: p.leaveDate || null,
    currentPosition: p.currentPosition || null,
    institutionFromKeywords: (p as any).institution || null,
    positionFromKeywords: (p as any).positionFromKeywords || null,
    updateCommand: `npm run bio:update -- --use-search${(p as any).institution ? ` --context "${(p as any).institution}"` : ''} "${p.name}" --dry-run`,
  }));

  process.stdout.write(JSON.stringify(list, null, 2) + '\n');
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
