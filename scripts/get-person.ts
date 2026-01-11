#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function getArgValue(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const id = getArgValue('--id');
  const slug = getArgValue('--slug');
  const name = process.argv
    .slice(2)
    .filter((t) => !t.startsWith('--') && t !== id && t !== slug)
    .join(' ')
    .trim();

  if (!id && !slug && !name) {
    console.error(
      'Usage: npm run bio:get-person -- [--id <sanityId> | --slug <slug> | "Full Name"]',
    );
    process.exit(1);
  }

  const mod: any = await import('../src/lib/cms/client');

  let query = '*[_type == "person" && _id == $id][0]';
  let params: Record<string, any> = { id };
  if (slug) {
    query = '*[_type == "person" && slug.current == $slug][0]';
    params = { slug };
  } else if (!id && name) {
    query = '*[_type == "person" && lower(name) == lower($name)][0]';
    params = { name };
  }

  const doc = await mod.client.fetch(query, params);
  if (!doc) {
    console.error('No matching person found.');
    process.exit(2);
  }

  process.stdout.write(JSON.stringify(doc, null, 2) + '\n');
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
