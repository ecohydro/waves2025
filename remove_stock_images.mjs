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

// List of news items to REMOVE featured images from (stock/generic)
// Keep: Teaching TBI (actual lab photo), Arable Zambia (actual field work)
const toRemoveImages = [
  'agu-fall-meeting-2020',
  'cascade-tuholske-defends-disseration-via-zoom',
  'finding-support-in-a-time-of-physical-distancing',
  'waves-lab-at-the-agu-fall-meeting-2019',
  'scholarships-fellowships-and-grants-awarded-to-waves-lab-students',
  'sharing-data-science-skills-with-the-dataup-program-and-software-carpentry',
  'monitoring-crop-production-and-farmer-decision-making-in-central-kenya',
  'ryan-avery-developing-ml-system-for-omidyar-network-at-clark-labs',
  'waves-lab-postdoctoral-positions-available',
  'ifpri-researcher-dr-kwaw-andam-visits-waves-lab',
  'waves-lab-recieves-funding-for-riparian-ecohydrology-projects',
  'waves-lab-contributes-to-2017-fao-state-of-food-agriculture-report',
  'cascade-tuholske-awarded-borlaug-fellowship-to-research-urban-food-security-in-ghana-zambia',
  'cynthia-gerlein-safdi-named-to-michigan-society-of-fellows',
  'natasha-krell-wins-fulbright-award-to-kenya',
  'caylor-lab-at-agu-2016-fall-meeting',
  'article-published-in-environmental-research-letters',
  'nasa-jet-propulsion-lab-surp-grant-received',
  'cynthia-gerlein-safdi-receives-mary-and-randall-hack-69-graduate-award',
  'frances-o8217donnell-starting-as-assistant-professor-at-auburn-university',
  'new-8220campus-as-a-lab8221-project',
  'article-published-in-remote-sensing-of-environment',
  'arable-featured-in-paw',
  'lixin-wang8217s-paper-in-nature-and-interview',
  'princeton-studies-food-new-class-launched',
  'ecohydrology-lab-at-agu-2015',
  'summer-at-mpala-water-use-and-agriculture',
  'first-course-on-uas-for-environmental-monitoring',
  'new-article-in-science',
  'collaboration-with-textit-for-crop-failure-early-warning-system',
  'where-does-water-go-when-it-doesn8217t-flow',
  'lixin-wang8217s-interview-with-the-iupui-newsroom',
  'new-paper-in-nature-climate-change',
  'new-paper-in-nature-geoscience',
  'agu-fellows-program',
  'aaas-session-on-new-earth-observing-methods',
  'new-paper-in-science',
  'ecohydrology-lab-at-the-agu-2014-fall-meeting',
  'new-paper-in-biogeosciences',
  'new-paper-in-grl',
  'summer-at-mpala-plant-physiological-response-to-water-stress',
  'summer-in-the-lab-foliar-uptake-in-colocasia-esculenta',
  'drew-gower-receives-epa-star-fellowship',
  'new-paper-in-erl',
  'pulselab-in-california-and-new-mexico',
  'two-new-grants-awarded',
  'field-ecohydrology-at-mpala',
  'cynthia-gerlein-safdi-receives-nasa-earth-and-space-science-fellowship',
  'first-successful-copter-flight-for-eric-principato',
  'anticipating-the-ecological-impacts-of-agricultural-adaptation-to-climate-change',
  'adam8217s-interview-by-the-center-for-data-innovation',
  'visit-by-dr-thomas-fuchs-jpl-machine-learning-expert',
  'two-jpl-surp-grants-received',
  'first-international-conference-on-global-food-security',
  'congratulations-dr-guan',
];

let count = 0;
for (const slug of toRemoveImages) {
  try {
    await client
      .patch(`news-${slug}`)
      .set({ featuredImage: null })
      .commit();
    count++;
    console.log(`✅ ${slug}`);
  } catch (err) {
    console.log(`⚠️  ${slug}: ${err.message}`);
  }
}

console.log(`\n✅ Removed ${count} stock images`);
console.log(`\nKept featured images on:`);
console.log(`  - Teaching the TBI Field School students (actual lab photo)`);
console.log(`  - Arable Mark deployments in Zambia's Southern Province (field work)`);
