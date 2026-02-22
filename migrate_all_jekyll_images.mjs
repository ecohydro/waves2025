import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import dotenv from 'dotenv';

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

// Step 1: Extract all Jekyll posts with images
console.log('🔍 Step 1: Scanning Jekyll posts...\n');

const jekyllPosts = [];
fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .forEach(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;
    
    try {
      const fm = yaml.parse(match[1]);
      if (fm.header && fm.header.image) {
        let imagePath = fm.header.image
          .replace(/^.*assets\/images\//, '')
          .replace(/\{\{.*?image\s*\|\s*/, '')
          .replace(/\}\}.*/, '')
          .trim();
        
        const diskPath = path.join(imagesDir, imagePath);
        if (fs.existsSync(diskPath)) {
          jekyllPosts.push({
            title: fm.title,
            date: fm.date,
            imagePath,
            diskPath,
            size: fs.statSync(diskPath).size,
          });
        }
      }
    } catch (err) {
      // skip
    }
  });

console.log(`✅ Found ${jekyllPosts.length} Jekyll posts with images\n`);

// Step 2: Fetch all Sanity news items
console.log('🔍 Step 2: Fetching Sanity news items...\n');

const allNews = await client.fetch(`*[_type == 'news'] {
  title,
  slug,
  featuredImage,
  _id
} | order(publishedAt desc)`);

console.log(`✅ Found ${allNews.length} news items\n`);

// Step 3: Match Jekyll posts to Sanity news items (by fuzzy title matching)
console.log('🔗 Step 3: Matching Jekyll posts to Sanity items...\n');

const unmatched = [];
const toUpload = [];

jekyllPosts.forEach(jekyll => {
  const sanityItem = allNews.find(n => 
    n.title.toLowerCase().includes(jekyll.title.split('(')[0].trim().toLowerCase().slice(0, 20)) ||
    jekyll.title.toLowerCase().includes(n.title.toLowerCase().slice(0, 20))
  );
  
  if (sanityItem) {
    toUpload.push({
      jekyll,
      sanity: sanityItem,
    });
    console.log(`✅ ${jekyll.title} → ${sanityItem.slug?.current}`);
  } else {
    unmatched.push(jekyll.title);
    console.log(`❌ ${jekyll.title} (no match)`);
  }
});

console.log(`\n📊 Matched: ${toUpload.length} | Unmatched: ${unmatched.length}\n`);

// Step 4: Upload and link images
console.log('🖼️  Step 4: Uploading and linking images...\n');

let uploaded = 0;
let linked = 0;
let failed = 0;

for (const item of toUpload) {
  try {
    // Skip if already has an image (unless it's a generic stock image)
    if (item.sanity.featuredImage && item.sanity.featuredImage.credit?.includes('Getty')) {
      console.log(`🔄 Replacing stock image: ${item.sanity.slug?.current}`);
    } else if (item.sanity.featuredImage) {
      console.log(`⏭️  Already has image: ${item.sanity.slug?.current}`);
      continue;
    }
    
    // Upload image
    const buffer = fs.readFileSync(item.jekyll.diskPath);
    const filename = path.basename(item.jekyll.diskPath);
    const asset = await client.assets.upload('image', buffer, { filename });
    
    // Link to news item
    await client
      .patch(`news-${item.sanity.slug?.current}`)
      .set({
        featuredImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
          alt: item.jekyll.title,
        },
      })
      .commit();
    
    console.log(`✅ ${filename} → ${item.sanity.slug?.current}`);
    uploaded++;
    linked++;
  } catch (err) {
    if (!err.message.includes('project user not found')) {
      console.log(`❌ ${item.jekyll.imagePath}: ${err.message.split('\n')[0]}`);
      failed++;
    }
  }
}

console.log(`\n📊 Uploaded: ${uploaded} | Linked: ${linked} | Failed: ${failed}`);

if (unmatched.length > 0) {
  console.log(`\n⚠️  Unmatched Jekyll posts (${unmatched.length}):`);
  unmatched.slice(0, 10).forEach(t => console.log(`   • ${t}`));
}
