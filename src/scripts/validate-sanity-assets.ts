#!/usr/bin/env tsx

/**
 * Validate and fix existing Sanity asset references
 * This script checks if the asset references are actually broken or just need proper formatting
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
});

async function validateAssetReferences() {
  console.log('🔍 Validating Sanity asset references...\n');

  // Get all people with avatar references
  const people = await client.fetch<
    Array<{
      _id: string;
      name: string;
      avatarRef: string;
    }>
  >(`
    *[_type == "person" && defined(avatar.asset._ref)] {
      _id,
      name,
      "avatarRef": avatar.asset._ref
    }
  `);

  console.log(`Found ${people.length} people with avatar references`);

  // Get all unique asset references
  const assetRefs = [...new Set(people.map((p) => p.avatarRef))];
  console.log(`Checking ${assetRefs.length} unique asset references...\n`);

  let validAssets = 0;
  let invalidAssets = 0;
  const invalidRefs: string[] = [];

  for (const assetRef of assetRefs) {
    try {
      // Check if asset exists in Sanity
      const asset = await client.fetch(`*[_type == "sanity.imageAsset" && _id == $assetId][0]`, {
        assetId: assetRef,
      });

      if (asset) {
        validAssets++;
        console.log(`✅ Valid: ${assetRef}`);
      } else {
        invalidAssets++;
        invalidRefs.push(assetRef);
        console.log(`❌ Invalid: ${assetRef}`);
      }
    } catch (error) {
      invalidAssets++;
      invalidRefs.push(assetRef);
      console.log(`❌ Error checking ${assetRef}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('ASSET VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total assets checked: ${assetRefs.length}`);
  console.log(`Valid assets: ${validAssets}`);
  console.log(`Invalid assets: ${invalidAssets}`);

  if (invalidRefs.length > 0) {
    console.log('\n❌ Invalid asset references:');
    invalidRefs.forEach((ref) => console.log(`   ${ref}`));
  }

  // Find people affected by invalid assets
  const affectedPeople = people.filter((p) => invalidRefs.includes(p.avatarRef));

  if (affectedPeople.length > 0) {
    console.log('\n👥 People with invalid asset references:');
    affectedPeople.forEach((person) => {
      console.log(`   ${person.name}: ${person.avatarRef}`);
    });
  }

  return {
    totalAssets: assetRefs.length,
    validAssets,
    invalidAssets,
    invalidRefs,
    affectedPeople,
  };
}

async function listAllSanityAssets() {
  console.log('\n🖼️ Listing all available Sanity image assets...\n');

  try {
    const assets = await client.fetch<
      Array<{
        _id: string;
        originalFilename?: string;
        url?: string;
        metadata?: { dimensions?: { width?: number; height?: number } };
      }>
    >(`
      *[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...20] {
        _id,
        originalFilename,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    `);

    console.log(`Found ${assets.length} image assets (showing first 20):`);
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.originalFilename || 'unnamed'}`);
      console.log(`   ID: ${asset._id}`);
      console.log(
        `   Size: ${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height}`,
      );
      console.log(`   URL: ${asset.url}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error fetching Sanity assets:', error);
  }
}

async function main() {
  try {
    const validationResult = await validateAssetReferences();

    if (process.argv.includes('--list-assets')) {
      await listAllSanityAssets();
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'asset-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(validationResult, null, 2));
    console.log(`\n📝 Report saved to: asset-validation-report.json`);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
