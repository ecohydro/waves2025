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
    '*[_type == "person" && userGroup == "alumni" && isActive == true] | order(leaveDate desc) { _id, name, userGroup, isActive, leaveDate, currentPosition }'
  );

  console.log(JSON.stringify(alumni, null, 2));
}

main();
