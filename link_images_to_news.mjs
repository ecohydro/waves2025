import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Mapping of news slugs to asset IDs (from upload output)
const imageLinks = [
  { slug: 'agu-fall-meeting-2020', assetId: 'image-8797ad1b3652f305357cbabda5337046e300e78a-1920x1080-jpg', alt: 'AGU Fall Meeting 2020' },
  { slug: 'cascade-tuholske-defends-disseration-via-zoom', assetId: 'image-25c28d5ad746eb48f7610fd622de726dc48baac5-708x577-jpg', alt: 'Cascade Tuholske in Zambia' },
  { slug: 'finding-support-in-a-time-of-physical-distancing', assetId: 'image-9ea3dfb81f1b64097c8baff605be000eca20364a-2863x1262-png', alt: 'Lab team on Zoom' },
  { slug: 'waves-lab-at-the-agu-fall-meeting-2019', assetId: 'image-b08f1040dcc197e35a9e08d6812e1fcbf3ebb00a-2500x417-jpg', alt: 'WAVES lab at AGU 2019' },
  { slug: 'scholarships-fellowships-and-grants-awarded-to-waves-lab-students', assetId: 'image-4a9f63c00fd5d10312c49d62335866e7acf2f618-1280x737-png', alt: 'Sedgwick Reserve' },
  { slug: 'monitoring-crop-production-and-farmer-decision-making-in-central-kenya', assetId: 'image-d77f4243024f83121d215fdc1fe1477f20a1dc64-1600x1200-jpg', alt: 'Arable installation in Kenya' },
  { slug: 'arable-featured-in-paw', assetId: 'image-31168833aad745ddea298901f9bd788e9d5ee483-1600x884-png', alt: 'Arable Pod' },
  { slug: 'summer-at-mpala-water-use-and-agriculture', assetId: 'image-7f9b16723aa7e8b08c079737a4b13da022dac518-1280x956-jpg', alt: 'Meeting at Mugo Kongo' },
  { slug: 'teaching-the-tbi-field-school-students', assetId: 'image-0fe3fa45828dc46f359d1cb3d8d1345ac46536c4-1362x908-jpg', alt: 'Teaching the TBI Field School students' },
  { slug: 'first-course-on-uas-for-environmental-monitoring', assetId: 'image-c035a458b9e0d98f9374f3f52ffc9f4144f50a26-960x834-jpg', alt: 'Unmanned Aerial System' },
  { slug: 'new-article-in-science', assetId: 'image-12fa58e97b81c2bebea72afc7821a4d4187b7a0f-600x450-jpg', alt: 'Autumn landscape' },
  { slug: 'collaboration-with-textit-for-crop-failure-early-warning-system', assetId: 'image-2a55fe506eb813c5bcd9ea41a8083909f5926f0c-620x413-jpg', alt: 'Mobile technology for farming' },
  { slug: 'new-paper-in-nature-climate-change', assetId: 'image-2691243fd30c4db7ca10e783e1b94bb185732390-977x672-png', alt: 'Paper screenshot' },
  { slug: 'new-paper-in-nature-geoscience', assetId: 'image-c84dadb1e5866311fcb4449a9061baa3342f2bbc-978x936-png', alt: 'Paper screenshot' },
  { slug: 'new-paper-in-science', assetId: 'image-939d47571b7d5f344d10ac7aaa09ff9aba90e8e4-1600x1200-jpg', alt: 'African termite mound' },
  { slug: 'field-ecohydrology-at-mpala', assetId: 'image-3830eb725b91e6be7c484d3f501a2e7c96b83b70-800x600-jpg', alt: 'Field ecohydrology at Mpala' },
  { slug: 'national-socio-environmental-synthesis-center-sesync-workshop', assetId: 'image-cf0d0ff536153c58c524398c542ba62dfeca4b27-1280x853-jpg', alt: 'SESYNC Workshop' },
  { slug: 'waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report', assetId: 'image-ed4c303915266b3f4de3a9e5fc20467e9320b6ed-1280x1280-png', alt: 'FAO headquarters in Rome' },
];

console.log('🔗 Linking Jekyll images to news items...\n');

let linked = 0;
let failed = 0;

for (const link of imageLinks) {
  try {
    await client
      .patch(`news-${link.slug}`)
      .set({
        featuredImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: link.assetId,
          },
          alt: link.alt,
        },
      })
      .commit();
    
    console.log(`✅ ${link.slug}`);
    linked++;
  } catch (err) {
    console.log(`❌ ${link.slug}: ${err.message.split('\n')[0]}`);
    failed++;
  }
}

console.log(`\n📊 Linked: ${linked} | Failed: ${failed}`);
console.log(`\n✨ Jekyll images migrated! Now rebuilding site...`);
