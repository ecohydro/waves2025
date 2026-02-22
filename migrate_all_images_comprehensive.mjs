import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const postsDir = '/root/waves-bot/website/_posts';
const imagesDir = '/root/waves-bot/website/assets/images';

// Step 1: Find ALL Jekyll images (YAML + Markdown)
console.log('🔍 Scanning ALL Jekyll posts for images...\n');

const jekyllImages = {};
const allPosts = [];

fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .forEach(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;
    
    try {
      const fm = yaml.parse(match[1]);
      
      let imagePath = null;
      
      // Try YAML header
      if (fm.header && fm.header.image) {
        imagePath = fm.header.image;
      }
      
      // Try markdown ![alt](path)
      if (!imagePath) {
        const mdMatch = content.match(/!\[.*?\]\(\s*([^)]+)\s*\)/);
        if (mdMatch) {
          imagePath = mdMatch[1];
        }
      }
      
      if (imagePath) {
        // Normalize path
        imagePath = imagePath
          .replace(/^.*assets\/images\//, '')
          .replace(/\{\{.*?"\/assets\/images\//, '')
          .replace(/"\s*\|.*/, '')
          .replace(/\}\}.*/, '')
          .trim();
        
        const diskPath = path.join(imagesDir, imagePath);
        if (fs.existsSync(diskPath)) {
          jekyllImages[imagePath] = {
            title: fm.title,
            date: fm.date,
            diskPath,
            size: fs.statSync(diskPath).size,
          };
          
          allPosts.push({
            title: fm.title,
            date: fm.date,
            imagePath,
            diskPath,
          });
        }
      }
    } catch (err) {}
  });

console.log(`✅ Found ${Object.keys(jekyllImages).length} unique Jekyll images\n`);
console.log(`Total posts with images: ${allPosts.length}\n`);

// Step 2: Fetch all Sanity news items
console.log('🔍 Fetching Sanity news items...\n');

const allNews = await client.fetch(`*[_type == 'news'] {
  title,
  slug,
  featuredImage,
  _id
} | order(publishedAt desc)`);

console.log(`✅ Found ${allNews.length} news items\n`);

// Step 3: Match and upload
console.log('🖼️  Uploading and linking images...\n');

let uploaded = 0;
let linked = 0;
let skipped = 0;

for (const [imagePath, jekyllInfo] of Object.entries(jekyllImages)) {
  // Fuzzy match to Sanity item
  const sanityItem = allNews.find(n => 
    n.title.toLowerCase().includes(jekyllInfo.title.split('(')[0].trim().toLowerCase().slice(0, 15)) ||
    jekyllInfo.title.toLowerCase().includes(n.title.toLowerCase().slice(0, 15))
  );
  
  if (!sanityItem) {
    console.log(`⏭️  Unmatched: ${imagePath}`);
    continue;
  }
  
  // Skip if already has a real image (not stock)
  if (sanityItem.featuredImage && 
      !sanityItem.featuredImage.credit?.includes('Getty') &&
      !sanityItem.featuredImage.credit?.includes('Unsplash') &&
      !sanityItem.featuredImage.alt?.includes('generic')) {
    skipped++;
    continue;
  }
  
  try {
    const buffer = fs.readFileSync(jekyllInfo.diskPath);
    const filename = path.basename(jekyllInfo.diskPath);
    const asset = await client.assets.upload('image', buffer, { filename });
    
    await client
      .patch(`news-${sanityItem.slug?.current}`)
      .set({
        featuredImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
          alt: jekyllInfo.title,
        },
      })
      .commit();
    
    console.log(`✅ ${filename.slice(0, 40)}`);
    uploaded++;
    linked++;
  } catch (err) {
    if (err.message.includes('project user not found')) {
      // Token issue - don't log
    } else {
      console.log(`❌ ${imagePath}: ${err.message.split('\n')[0]}`);
    }
  }
}

console.log(`\n📊 Uploaded: ${uploaded} | Linked: ${linked} | Skipped (already have images): ${skipped}`);
