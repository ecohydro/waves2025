import { createClient } from 'next-sanity';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const jekyllImages = [
  { file: '/root/waves-bot/website/assets/images/agu2020.jpg', slug: 'agu-fall-meeting-2020', alt: 'AGU Fall Meeting 2020' },
  { file: '/root/waves-bot/website/assets/images/zambia_tuholske1.jpg', slug: 'cascade-tuholske-defends-disseration-via-zoom', alt: 'Cascade Tuholske in Zambia' },
  { file: '/root/waves-bot/website/assets/images/zoom_lab_photo.jpg', slug: 'finding-support-in-a-time-of-physical-distancing', alt: 'Lab team on Zoom' },
  { file: '/root/waves-bot/website/assets/images/AGU2019.jpg', slug: 'waves-lab-at-the-agu-fall-meeting-2019', alt: 'AGU 2019' },
  { file: '/root/waves-bot/website/assets/images/sedgwick.png', slug: 'scholarships-fellowships-and-grants-awarded-to-waves-lab-students', alt: 'Sedgwick Reserve' },
  { file: '/root/waves-bot/website/assets/images/kenya-arable-install-1.jpg', slug: 'monitoring-crop-production-and-farmer-decision-making-in-central-kenya', alt: 'Arable installation in Kenya' },
  { file: '/root/waves-bot/website/assets/images/pod.png', slug: 'arable-featured-in-paw', alt: 'Arable Pod' },
  { file: '/root/waves-bot/website/assets/images/meeting_MugoKongo.jpg', slug: 'summer-at-mpala-water-use-and-agriculture', alt: 'Meeting at Mugo Kongo' },
  { file: '/root/waves-bot/website/assets/images/13.jpg', slug: 'teaching-the-tbi-field-school-students', alt: 'Teaching the TBI Field School students' },
  { file: '/root/waves-bot/website/assets/images/UAS.jpg', slug: 'first-course-on-uas-for-environmental-monitoring', alt: 'Unmanned Aerial System' },
  { file: '/root/waves-bot/website/assets/images/autumn-601159_640-jpg.jpg', slug: 'new-article-in-science', alt: 'Autumn landscape' },
  { file: '/root/waves-bot/website/assets/images/medium_blog_new-agreement-will-support-tanzania-farmers-through-mobile-technology.jpg', slug: 'collaboration-with-textit-for-crop-failure-early-warning-system', alt: 'Mobile technology for farming' },
  { file: '/root/waves-bot/website/assets/images/Screen-Shot-2015-03-16-at-6.57.02-PM.png', slug: 'new-paper-in-nature-climate-change', alt: 'Paper screenshot' },
  { file: '/root/waves-bot/website/assets/images/Screen-Shot-2015-03-10-at-10.20.33-AM.png', slug: 'new-paper-in-nature-geoscience', alt: 'Paper screenshot' },
  { file: '/root/waves-bot/website/assets/images/A_giant_African_ant_hill_with_somone_on_it.JPG', slug: 'new-paper-in-science', alt: 'African termite mound' },
  { file: '/root/waves-bot/website/assets/images/img_24241_hydrology-course1-rgov-800width.jpg', slug: 'field-ecohydrology-at-mpala', alt: 'Field ecohydrology course' },
  { file: '/root/waves-bot/website/assets/images/IMG_3319.jpg', slug: 'national-socio-environmental-synthesis-center-sesync-workshop', alt: 'SESYNC Workshop' },
  { file: '/root/waves-bot/website/assets/images/FAO_HQ_Rome.png', slug: 'waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report', alt: 'FAO headquarters in Rome' },
];

console.log('🖼️  Attempting to upload Jekyll images to Sanity...\n');

let uploadedCount = 0;
let failedCount = 0;

for (const img of jekyllImages) {
  try {
    const buffer = fs.readFileSync(img.file);
    const filename = path.basename(img.file);
    
    // Upload image asset
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
    });
    
    console.log(`✅ ${filename} → asset-${asset._id}`);
    uploadedCount++;
  } catch (err) {
    if (err.message.includes('Insufficient permissions') || err.message.includes('permission')) {
      console.log(`❌ ${path.basename(img.file)}: Missing upload permissions`);
      console.log(`   Error: ${err.message.split('\n')[0]}`);
    } else {
      console.log(`❌ ${path.basename(img.file)}: ${err.message}`);
    }
    failedCount++;
  }
}

console.log(`\n📊 Uploaded: ${uploadedCount} | Failed: ${failedCount}`);

if (failedCount > 0 && uploadedCount === 0) {
  console.log(`\n⚠️  Permissions issue detected. Need to update SANITY_API_TOKEN with asset upload permissions.`);
}
