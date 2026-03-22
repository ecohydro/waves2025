#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_VIEWER_TOKEN!,
  });

  const alumni = await client.fetch(
    `*[_type == "person" && userGroup == "alumni" && isActive == true] | order(name asc) {
      _id,
      name,
      category,
      title
    }`
  );

  // Group by category
  const byCategory: Record<string, any[]> = {};
  
  alumni.forEach((person: any) => {
    const cat = person.category || 'NO_CATEGORY';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(person);
  });

  console.log('=== Alumni by Category ===\n');
  
  Object.keys(byCategory).sort().forEach(cat => {
    console.log(`\n${cat} (${byCategory[cat].length}):`);
    byCategory[cat].forEach((p: any) => {
      const title = p.title ? ` — ${p.title}` : '';
      console.log(`  ${p.name}${title}`);
    });
  });

  console.log(`\n\nTotal alumni: ${alumni.length}`);
}

main();
