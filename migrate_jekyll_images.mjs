import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Images that exist in Jekyll and should be migrated
const imageMappings = [
  {
    jekyll: '/root/waves-bot/website/assets/images/A_giant_African_ant_hill_with_somone_on_it.JPG',
    alt: 'Monkeys climbing on a termite mound in dry brush.',
    news_slug: 'new-paper-in-science',  // 2015-02-09
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/Screen-Shot-2015-03-10-at-10.20.33-AM.png',
    alt: 'Screenshot from research paper',
    news_slug: 'new-paper-in-nature-geoscience',  // 2015-03-12
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/Screen-Shot-2015-03-16-at-6.57.02-PM.png',
    alt: 'Screenshot from research paper',
    news_slug: 'new-paper-in-nature-climate-change',  // 2015-03-16
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/medium_blog_new-agreement-will-support-tanzania-farmers-through-mobile-technology.jpg',
    alt: 'Mobile technology for farming',
    news_slug: 'collaboration-with-textit-for-crop-failure-early-warning-system',  // 2015-08-01
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/autumn-601159_640-jpg.jpg',
    alt: 'Autumn landscape',
    news_slug: 'new-article-in-science',  // 2015-08-03
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/UAS.jpg',
    alt: 'Unmanned aerial system',
    news_slug: 'first-course-on-uas-for-environmental-monitoring',  // 2015-08-17
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/13.jpg',
    alt: 'Teaching the TBI Field School students',
    news_slug: 'teaching-the-tbi-field-school-students',  // 2015-09-23
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/meeting_MugoKongo.jpg',
    alt: 'Meeting at Mugo Kongo',
    news_slug: 'summer-at-mpala-water-use-and-agriculture',  // 2015-09-23
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/img_24241_hydrology-course1-rgov-800width.jpg',
    alt: 'Field ecohydrology course at Mpala',
    news_slug: 'field-ecohydrology-at-mpala',  // 2014-06-26
  },
  {
    jekyll: '/root/waves-bot/website/assets/images/Caylor1-full.jpg',
    alt: 'Kelly Caylor',
    news_slug: 'interview-in-scientific-american',  // 2015-04-14 (not in current list)
  },
];

console.log('🔍 Checking Jekyll images...\n');

for (const mapping of imageMappings) {
  if (fs.existsSync(mapping.jekyll)) {
    const size = fs.statSync(mapping.jekyll).size;
    console.log(`✅ ${path.basename(mapping.jekyll)} (${(size/1024).toFixed(0)}KB) → ${mapping.news_slug}`);
  } else {
    console.log(`❌ ${path.basename(mapping.jekyll)} (not found)`);
  }
}

console.log('\n\n📌 To complete migration:');
console.log('1. Download these images from /root/waves-bot/website/assets/images/');
console.log('2. Upload to Sanity Studio manually for each news item');
console.log('3. Or, I can write a script to upload them programmatically if you set my token permissions');
