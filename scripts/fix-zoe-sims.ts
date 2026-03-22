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

  console.log('Fetching Zoe Sims record...');
  const zoe = await editorClient.fetch(
    '*[_type == "person" && slug.current == $slug][0]',
    { slug: 'zoe-sims' }
  );

  if (!zoe) {
    console.error('Zoe Sims not found');
    process.exit(1);
  }

  console.log('Current data:');
  console.log(JSON.stringify(zoe, null, 2));

  // Build the update patch
  const updates: any = {};

  // Fix: role -> title
  if (zoe.role && !zoe.title) {
    updates.title = zoe.role;
    console.log(`\nMigrating 'role' -> 'title': "${zoe.role}"`);
  }

  // Fix: photo -> avatar
  if (zoe.photo && !zoe.avatar) {
    updates.avatar = zoe.photo;
    console.log(`\nMigrating 'photo' -> 'avatar'`);
  }

  // Fix: top-level social fields -> socialMedia object
  const socialMedia: any = zoe.socialMedia || {};
  
  if (zoe.linkedin) {
    // If it's just a username, construct full URL
    const linkedinUrl = zoe.linkedin.startsWith('http') 
      ? zoe.linkedin 
      : `https://www.linkedin.com/in/${zoe.linkedin}`;
    socialMedia.linkedin = linkedinUrl;
    console.log(`\nMigrating 'linkedin' -> 'socialMedia.linkedin': "${linkedinUrl}"`);
  }

  if (zoe.twitter) {
    socialMedia.twitter = zoe.twitter;
    console.log(`\nMigrating 'twitter' -> 'socialMedia.twitter': "${zoe.twitter}"`);
  }

  if (Object.keys(socialMedia).length > 0) {
    updates.socialMedia = socialMedia;
  }

  if (Object.keys(updates).length === 0) {
    console.log('\n✅ No updates needed - data is already correct');
    return;
  }

  console.log('\n📝 Applying updates...');
  
  const result = await editorClient
    .patch(zoe._id)
    .set(updates)
    .unset(['role', 'photo', 'linkedin', 'twitter']) // Remove old fields
    .commit();

  console.log('\n✅ Updated successfully!');
  console.log('\nNew data:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
