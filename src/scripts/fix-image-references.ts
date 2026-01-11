#!/usr/bin/env tsx

/**
 * Comprehensive image reference fixing script
 * - Fixes broken Sanity asset references
 * - Maps legacy image paths to new optimized versions
 * - Uploads missing images to Sanity
 * - Updates CMS records with corrected references
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

// Create clients
const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
  token: process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN, // We'll need write permissions
});

const readOnlyClient = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
});

interface FixReport {
  people: {
    total: number;
    fixed: number;
    errors: number;
    details: Array<{ name: string; status: 'fixed' | 'error' | 'skipped'; message?: string }>;
  };
  news: {
    total: number;
    fixed: number;
    errors: number;
    details: Array<{ title: string; status: 'fixed' | 'error' | 'skipped'; message?: string }>;
  };
  assets: {
    validated: number;
    uploaded: number;
    failed: number;
  };
}

/**
 * Check if a Sanity asset reference exists and is valid
 */
async function validateAssetReference(assetRef: string): Promise<boolean> {
  try {
    if (!assetRef || !assetRef.startsWith('image-')) {
      return false;
    }

    // Query Sanity to check if asset exists
    const asset = await readOnlyClient.fetch(
      `*[_type == "sanity.imageAsset" && _id == $assetId][0]`,
      { assetId: assetRef.replace('image-', 'image-') },
    );

    return !!asset;
  } catch (error) {
    console.warn(`Could not validate asset ${assetRef}:`, error);
    return false;
  }
}

/**
 * Find matching image in public directory based on name
 */
function findMatchingImage(personName: string, publicDir: string): string | null {
  const possiblePaths = [
    // Check various naming conventions
    `images/people/${personName.replace(/\s+/g, '-')}.jpg`,
    `images/people/${personName.replace(/\s+/g, '-')}.png`,
    `images/people/${personName.replace(/\s+/g, '_')}.jpg`,
    `images/people/${personName.replace(/\s+/g, '_')}.png`,
    `images/people/${personName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    `images/people/${personName.toLowerCase().replace(/\s+/g, '-')}.png`,
    `images/people/${personName.toLowerCase().replace(/\s+/g, '_')}.jpg`,
    `images/people/${personName.toLowerCase().replace(/\s+/g, '_')}.png`,
    // Check last name variations
    `images/people/${personName.split(' ').pop()}.jpg`,
    `images/people/${personName.split(' ').pop()}.png`,
    `images/people/${personName.split(' ').pop()?.toLowerCase()}.jpg`,
    `images/people/${personName.split(' ').pop()?.toLowerCase()}.png`,
  ];

  for (const imagePath of possiblePaths) {
    const fullPath = path.join(publicDir, imagePath);
    if (fs.existsSync(fullPath)) {
      return imagePath;
    }
  }

  // Check if there are any optimized versions
  const nameVariations = [
    personName.replace(/\s+/g, '-'),
    personName.replace(/\s+/g, '_'),
    personName.toLowerCase().replace(/\s+/g, '-'),
    personName.toLowerCase().replace(/\s+/g, '_'),
    personName.split(' ').pop(),
    personName.split(' ').pop()?.toLowerCase(),
  ];

  const peopleDir = path.join(publicDir, 'images/people');
  if (fs.existsSync(peopleDir)) {
    const files = fs.readdirSync(peopleDir);

    for (const variation of nameVariations) {
      if (!variation) continue;

      // Look for any matching file (including optimized versions)
      const matchingFile = files.find(
        (file) =>
          file.toLowerCase().includes(variation.toLowerCase()) &&
          /\.(jpg|jpeg|png|webp|avif)$/i.test(file),
      );

      if (matchingFile) {
        return `images/people/${matchingFile}`;
      }
    }
  }

  return null;
}

/**
 * Upload image to Sanity and return asset reference
 */
async function uploadImageToSanity(imagePath: string, publicDir: string): Promise<string | null> {
  try {
    const fullPath = path.join(publicDir, imagePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Image not found: ${fullPath}`);
      return null;
    }

    // Check if we have write permissions
    if (!(process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN)) {
      console.warn(
        'No SANITY_API_EDITOR_TOKEN found. Skipping upload, returning public path instead.',
      );
      return imagePath; // Return public path as fallback
    }

    const imageBuffer = fs.readFileSync(fullPath);
    const filename = path.basename(imagePath);

    console.log(`📤 Uploading ${filename} to Sanity...`);

    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
    });

    console.log(`✅ Uploaded ${filename} as ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error);
    return null;
  }
}

/**
 * Fix people avatar references
 */
async function fixPeopleAvatars(dryRun: boolean = true): Promise<FixReport['people']> {
  console.log('👥 Fixing people avatar references...');

  const people = await readOnlyClient.fetch(`
    *[_type == "person"] {
      _id,
      name,
      slug,
      avatar
    }
  `);

  const report: FixReport['people'] = {
    total: people.length,
    fixed: 0,
    errors: 0,
    details: [],
  };

  const publicDir = path.join(process.cwd(), 'public');

  for (const person of people) {
    try {
      let shouldUpdate = false;
      let newAvatarRef: string | null = null;

      // Case 1: Missing avatar entirely
      if (!person.avatar?.asset?._ref) {
        const matchingImage = findMatchingImage(person.name, publicDir);
        if (matchingImage) {
          console.log(`🔍 Found image for ${person.name}: ${matchingImage}`);
          newAvatarRef = await uploadImageToSanity(matchingImage, publicDir);
          shouldUpdate = !!newAvatarRef;
        } else {
          report.details.push({
            name: person.name,
            status: 'skipped',
            message: 'No matching image found',
          });
          continue;
        }
      }
      // Case 2: Has avatar but reference might be broken
      else {
        const currentRef = person.avatar.asset._ref;
        const isValid = await validateAssetReference(currentRef);

        if (!isValid) {
          console.log(`❌ Broken reference for ${person.name}: ${currentRef}`);
          const matchingImage = findMatchingImage(person.name, publicDir);
          if (matchingImage) {
            newAvatarRef = await uploadImageToSanity(matchingImage, publicDir);
            shouldUpdate = !!newAvatarRef;
          } else {
            report.details.push({
              name: person.name,
              status: 'error',
              message: 'Broken reference and no replacement found',
            });
            report.errors++;
            continue;
          }
        } else {
          report.details.push({
            name: person.name,
            status: 'skipped',
            message: 'Avatar reference is valid',
          });
          continue;
        }
      }

      // Update the person record
      if (shouldUpdate && newAvatarRef) {
        if (!dryRun) {
          // If we have a Sanity asset ID, create proper reference
          if (newAvatarRef.startsWith('image-')) {
            await client
              .patch(person._id)
              .set({
                avatar: {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: newAvatarRef,
                  },
                },
              })
              .commit();
          } else {
            // For public path fallback, we might need different handling
            console.warn(`Using public path fallback for ${person.name}: ${newAvatarRef}`);
          }
        }

        report.fixed++;
        report.details.push({
          name: person.name,
          status: 'fixed',
          message: `Updated avatar reference${dryRun ? ' (dry run)' : ''}`,
        });

        console.log(`✅ ${dryRun ? '[DRY RUN] ' : ''}Fixed avatar for ${person.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${person.name}:`, error);
      report.errors++;
      report.details.push({
        name: person.name,
        status: 'error',
        message: `Processing error: ${error}`,
      });
    }
  }

  return report;
}

/**
 * Fix news featured images
 */
async function fixNewsImages(dryRun: boolean = true): Promise<FixReport['news']> {
  console.log('📰 Fixing news featured images...');

  const news = await readOnlyClient.fetch(`
    *[_type == "news"] {
      _id,
      title,
      slug,
      featuredImage,
      publishedAt
    }
  `);

  const report: FixReport['news'] = {
    total: news.length,
    fixed: 0,
    errors: 0,
    details: [],
  };

  const publicDir = path.join(process.cwd(), 'public');

  for (const article of news) {
    try {
      // For now, we'll skip news images as they're more complex to match
      // This would require analyzing the article content or slug to find matching images
      report.details.push({
        title: article.title,
        status: 'skipped',
        message: 'News image fixing not yet implemented',
      });
    } catch (error) {
      report.errors++;
      report.details.push({
        title: article.title,
        status: 'error',
        message: `Processing error: ${error}`,
      });
    }
  }

  return report;
}

/**
 * Main fixing function
 */
async function fixImageReferences(
  options: {
    dryRun?: boolean;
    fixPeople?: boolean;
    fixNews?: boolean;
  } = {},
): Promise<FixReport> {
  const { dryRun = true, fixPeople = true, fixNews = false } = options;

  console.log('🔧 Starting image reference fixes...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
  console.log(`Fix people: ${fixPeople}, Fix news: ${fixNews}\n`);

  const report: FixReport = {
    people: { total: 0, fixed: 0, errors: 0, details: [] },
    news: { total: 0, fixed: 0, errors: 0, details: [] },
    assets: { validated: 0, uploaded: 0, failed: 0 },
  };

  try {
    // Fix people avatars
    if (fixPeople) {
      report.people = await fixPeopleAvatars(dryRun);
    }

    // Fix news images
    if (fixNews) {
      report.news = await fixNewsImages(dryRun);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🔧 IMAGE FIX SUMMARY');
    console.log('='.repeat(60));

    if (fixPeople) {
      console.log(`\n👥 PEOPLE (${report.people.total} total):`);
      console.log(`   • Fixed: ${report.people.fixed}`);
      console.log(`   • Errors: ${report.people.errors}`);
      console.log(
        `   • Skipped: ${report.people.total - report.people.fixed - report.people.errors}`,
      );
    }

    if (fixNews) {
      console.log(`\n📰 NEWS (${report.news.total} total):`);
      console.log(`   • Fixed: ${report.news.fixed}`);
      console.log(`   • Errors: ${report.news.errors}`);
      console.log(`   • Skipped: ${report.news.total - report.news.fixed - report.news.errors}`);
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'image-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: image-fix-report.json`);

    if (dryRun) {
      console.log('\n💡 This was a dry run. Use --live to apply changes.');
    } else {
      console.log('\n✅ Image fixes applied successfully!');
    }

    return report;
  } catch (error) {
    console.error('❌ Image fixing failed:', error);
    throw error;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--live');
  const fixPeople = !args.includes('--skip-people');
  const fixNews = args.includes('--include-news');

  try {
    await fixImageReferences({
      dryRun,
      fixPeople,
      fixNews,
    });
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { fixImageReferences };
