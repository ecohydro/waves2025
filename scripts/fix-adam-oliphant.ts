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

  console.log('Fetching Adam Oliphant record...');
  const adam = await editorClient.fetch(
    '*[_type == "person" && slug.current == $slug][0]',
    { slug: 'adam-oliphant' }
  );

  if (!adam) {
    console.error('Adam Oliphant not found');
    process.exit(1);
  }

  console.log('Current data:');
  console.log(JSON.stringify(adam, null, 2));

  // Build the update patch
  const updates: any = {};
  const fieldsToUnset: string[] = [];

  // Fix: role -> title
  if (adam.role && !adam.title) {
    updates.title = adam.role;
    fieldsToUnset.push('role');
    console.log(`\nMigrating 'role' -> 'title': "${adam.role}"`);
  }

  // Fix: photo -> avatar (if exists)
  if (adam.photo && !adam.avatar) {
    updates.avatar = adam.photo;
    fieldsToUnset.push('photo');
    console.log(`\nMigrating 'photo' -> 'avatar'`);
  }

  // Fix: affiliation (should probably be in education or bio, not a top-level field)
  if (adam.affiliation) {
    console.log(`\nRemoving non-schema field 'affiliation': "${adam.affiliation}"`);
    fieldsToUnset.push('affiliation');
  }

  // Fix: researchAreas -> researchInterests (if exists)
  if (adam.researchAreas && !adam.researchInterests) {
    updates.researchInterests = adam.researchAreas;
    fieldsToUnset.push('researchAreas');
    console.log(`\nMigrating 'researchAreas' -> 'researchInterests'`);
  }

  // Fix: tags (not a valid field for person schema)
  if (adam.tags) {
    console.log(`\nRemoving non-schema field 'tags'`);
    fieldsToUnset.push('tags');
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
