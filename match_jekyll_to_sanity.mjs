import { createClient } from 'next-sanity';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Fetch all news items
const allNews = await client.fetch(`*[_type == 'news'] {
  title,
  slug,
  publishedAt,
  _id
} | order(publishedAt desc)`);

// Manual mapping of Jekyll posts to Sanity slugs
const jekyllToSanity = [
  { jekyll: 'agu2020.jpg', sanity_slug: 'agu-fall-meeting-2020' },
  { jekyll: 'zambia_tuholske1.jpg', sanity_slug: 'cascade-tuholske-defends-disseration-via-zoom' },
  { jekyll: 'zoom_lab_photo.jpg', sanity_slug: 'finding-support-in-a-time-of-physical-distancing' },
  { jekyll: 'AGU2019.jpg', sanity_slug: 'waves-lab-at-the-agu-fall-meeting-2019' },
  { jekyll: 'sedgwick.png', sanity_slug: 'scholarships-fellowships-and-grants-awarded-to-waves-lab-students' },
  { jekyll: 'kenya-arable-install-1.jpg', sanity_slug: 'monitoring-crop-production-and-farmer-decision-making-in-central-kenya' },
  { jekyll: 'pod.png', sanity_slug: 'arable-featured-in-paw' },
  { jekyll: 'Screen-Shot-2016-02-12-at-11.44.05-AM-1024x426.jpg', sanity_slug: 'lixin-wang-and-interview' },
  { jekyll: 'meeting_MugoKongo.jpg', sanity_slug: 'summer-at-mpala-water-use-and-agriculture' },
  { jekyll: '13.jpg', sanity_slug: 'teaching-the-tbi-field-school-students' },
  { jekyll: 'UAS.jpg', sanity_slug: 'first-course-on-uas-for-environmental-monitoring' },
  { jekyll: 'autumn-601159_640-jpg.jpg', sanity_slug: 'new-article-in-science' },
  { jekyll: 'medium_blog_new-agreement-will-support-tanzania-farmers-through-mobile-technology.jpg', sanity_slug: 'collaboration-with-textit-for-crop-failure-early-warning-system' },
  { jekyll: 'Caylor1-full.jpg', sanity_slug: 'interview-in-scientific-american' }, // May not exist
  { jekyll: 'Screen-Shot-2015-03-16-at-6.57.02-PM.png', sanity_slug: 'new-paper-in-nature-climate-change' },
  { jekyll: 'Screen-Shot-2015-03-10-at-10.20.33-AM.png', sanity_slug: 'new-paper-in-nature-geoscience' },
  { jekyll: 'A_giant_African_ant_hill_with_somone_on_it.JPG', sanity_slug: 'new-paper-in-science' },
  { jekyll: 'img_24241_hydrology-course1-rgov-800width.jpg', sanity_slug: 'field-ecohydrology-at-mpala' },
  { jekyll: 'IMG_3319.jpg', sanity_slug: 'national-socio-environmental-synthesis-center-sesync-workshop' }, // May not exist
  { jekyll: 'Screen-Shot-2013-10-20-at-12.54.56-PM-620x350.png', sanity_slug: 'adam-interview-by-the-center-for-data-innovation' },
  { jekyll: 'FAO_HQ_Rome.png', sanity_slug: 'waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report' },
];

console.log('Matching Jekyll images to Sanity news items:\n');

let matched = 0;
let notFound = 0;

jekyllToSanity.forEach(mapping => {
  const newsItem = allNews.find(n => n.slug?.current === mapping.sanity_slug);
  
  if (newsItem) {
    console.log(`✅ ${mapping.jekyll}`);
    console.log(`   → ${mapping.sanity_slug}`);
    matched++;
  } else {
    console.log(`❌ ${mapping.jekyll}`);
    console.log(`   → ${mapping.sanity_slug} (NOT FOUND in Sanity)`);
    notFound++;
  }
  console.log('');
});

console.log(`\n📊 Matched: ${matched} | Not Found: ${notFound}`);
console.log(`\n💾 These are the Jekyll images we can migrate to Sanity.`);
