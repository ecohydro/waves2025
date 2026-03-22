#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  // Create a client with editor permissions
  const editorClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  console.log('Fetching Adam Oliphant draft record...');
  const adam = await editorClient.fetch(
    '*[_id == "drafts.person-adam-oliphant"][0]'
  );

  if (!adam) {
    console.error('Adam Oliphant draft not found');
    process.exit(1);
  }

  console.log('Current data:');
  console.log(JSON.stringify(adam, null, 2));

  // Build the update patch
  const updates: any = {};
  const fieldsToUnset: string[] = [];

  // Fix: biography -> bioLong
  if (adam.biography && !adam.bioLong) {
    updates.bioLong = adam.biography;
    fieldsToUnset.push('biography');
    console.log(`\nMigrating 'biography' -> 'bioLong'`);
  }

  if (Object.keys(updates).length === 0 && fieldsToUnset.length === 0) {
    console.log('\n✅ No updates needed - data is already correct');
    return;
  }

  console.log('\n📝 Applying updates...');
  
  let patch = editorClient.patch(adam._id);
  
  if (Object.keys(updates).length > 0) {
    patch = patch.set(updates);
  }
  
  if (fieldsToUnset.length > 0) {
    patch = patch.unset(fieldsToUnset);
  }
  
  const result = await patch.commit();

  console.log('\n✅ Updated successfully!');
  console.log('\nNew data:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
