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

// Extract all Jekyll posts with images
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
            imagePath,
            diskPath,
          });
        }
      }
    } catch (err) {}
  });

// Fetch all Sanity news items
const allNews = await client.fetch(`*[_type == 'news'] {
  title,
  slug,
  featuredImage,
  _id
}`);

console.log('🔄 Replacing generic stock images with Jekyll images...\n');

let replaced = 0;
let failed = 0;

// For each Jekyll post, check if corresponding Sanity item has a stock image
for (const jekyll of jekyllPosts) {
  const sanityItem = allNews.find(n => 
    n.title.toLowerCase().includes(jekyll.title.split('(')[0].trim().toLowerCase().slice(0, 20)) ||
    jekyll.title.toLowerCase().includes(n.title.toLowerCase().slice(0, 20))
  );
  
  if (!sanityItem) continue;
  
  // Check if current image is from Getty, Unsplash, or other generic sources
  const isGeneric = !sanityItem.featuredImage ||
    (sanityItem.featuredImage.credit && 
     (sanityItem.featuredImage.credit.includes('Getty') || 
      sanityItem.featuredImage.credit.includes('Unsplash') ||
      sanityItem.featuredImage.alt.includes('stock') ||
      sanityItem.featuredImage.alt.includes('generic')));
  
  if (isGeneric) {
    try {
      const buffer = fs.readFileSync(jekyll.diskPath);
      const filename = path.basename(jekyll.diskPath);
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
            alt: jekyll.title,
          },
        })
        .commit();
      
      console.log(`✅ ${sanityItem.slug?.current}`);
      console.log(`   Replaced with: ${filename}\n`);
      replaced++;
    } catch (err) {
      console.log(`❌ ${sanityItem.slug?.current}: ${err.message.split('\n')[0]}\n`);
      failed++;
    }
  }
}

console.log(`\n📊 Replaced: ${replaced}`);
