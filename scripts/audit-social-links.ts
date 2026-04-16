#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';
import {
  classifySocialLink,
  detectAndFixWaveslabUrl,
  type LinkClassification,
} from './social-link-utils';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type SocialMedia = {
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
};

type PersonDoc = {
  _id: string;
  name: string;
  socialMedia?: SocialMedia;
};

const SOCIAL_FIELDS: Array<keyof SocialMedia> = [
  'linkedin',
  'github',
  'twitter',
  'researchGate',
  'googleScholar',
  'orcid',
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET as string;
const token = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || '';

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity project configuration (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET).',
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token,
  perspective: 'published',
});

const rawClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token,
  perspective: 'raw',
});

type AuditEntry = {
  name: string;
  docId: string;
  isDraft: boolean;
  field: string;
  currentValue: string;
  status: LinkClassification;
  suggestedFix: string;
};

function getFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  const jsonOutput = getFlag('--json');

  const [published, drafts] = await Promise.all([
    client.fetch<PersonDoc[]>(`*[_type == "person"]{_id, name, socialMedia}`),
    rawClient.fetch<PersonDoc[]>(
      `*[_type == "person" && _id in path("drafts.**")]{_id, name, socialMedia}`,
    ),
  ]);

  const allDocs: Array<PersonDoc & { isDraft: boolean }> = [
    ...published.map((p) => ({ ...p, isDraft: false })),
    ...drafts.map((d) => ({ ...d, isDraft: true })),
  ];

  const entries: AuditEntry[] = [];
  const counts = { total: 0, correct: 0, 'broken-hostname': 0, 'bare-slug': 0, empty: 0, 'manual-review': 0 };

  for (const doc of allDocs) {
    for (const field of SOCIAL_FIELDS) {
      const value = doc.socialMedia?.[field];
      const status = classifySocialLink(field, value);
      counts.total++;
      counts[status]++;

      // Only include non-empty entries in the report
      if (status === 'empty') continue;

      let suggestedFix = '';
      if (status === 'broken-hostname') {
        const fixed = detectAndFixWaveslabUrl(field, value);
        suggestedFix = fixed || '(manual review needed)';
      }

      entries.push({
        name: doc.name,
        docId: doc._id,
        isDraft: doc.isDraft,
        field,
        currentValue: value || '',
        status,
        suggestedFix,
      });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ entries, counts }, null, 2));
    return;
  }

  // Table output
  console.log(`\nSocial Link Audit Report`);
  console.log(`${'='.repeat(120)}`);
  console.log(
    `${'Name'.padEnd(25)} ${'Field'.padEnd(16)} ${'Status'.padEnd(18)} ${'Current Value'.padEnd(45)} Suggested Fix`,
  );
  console.log(`${'-'.repeat(120)}`);

  for (const e of entries) {
    const draftTag = e.isDraft ? ' [draft]' : '';
    const nameCol = `${e.name}${draftTag}`.slice(0, 24).padEnd(25);
    const fieldCol = e.field.padEnd(16);
    const statusCol = e.status.padEnd(18);
    const valueCol = e.currentValue.slice(0, 44).padEnd(45);
    const fixCol = e.suggestedFix;
    console.log(`${nameCol} ${fieldCol} ${statusCol} ${valueCol} ${fixCol}`);
  }

  console.log(`\n${'='.repeat(120)}`);
  console.log(`Summary:`);
  console.log(`  Total fields scanned:  ${counts.total}`);
  console.log(`  Correct:               ${counts.correct}`);
  console.log(`  Broken hostname:       ${counts['broken-hostname']}`);
  console.log(`  Bare slug/handle:      ${counts['bare-slug']}`);
  console.log(`  Empty:                 ${counts.empty}`);
  console.log(`  Manual review needed:  ${counts['manual-review']}`);

  if (counts['broken-hostname'] > 0) {
    console.log(`\n⚠️  ${counts['broken-hostname']} social links have incorrect hostnames and need fixing.`);
    console.log(`   Run: npx tsx scripts/fix-person-social-urls.ts        (dry-run preview)`);
    console.log(`   Run: npx tsx scripts/fix-person-social-urls.ts --yes  (apply fixes)`);
  } else {
    console.log(`\n✅ All social links have correct hostnames.`);
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
