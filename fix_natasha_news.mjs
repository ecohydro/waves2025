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

// Update the news item to remove featured image and fix broken markdown
const updated = await client
  .patch('news-natasha-krell-wins-fulbright-award-to-kenya')
  .set({
    featuredImage: null,
    content: '[Natasha Krell]() was awarded a <a href="https://us.fulbrightonline.org" target="_blank">Fulbright U.S. Student Program</a> award from the U.S. Department of State and the J. William Fulbright Foreign Scholarship Board. <!--more-->The <a href="http://eca.state.gov/fulbright" target="_blank">Fulbright Program</a> is the flagship international educational exchange program sponsored by the U.S. government and is designed to build lasting connections between the people of the United States and the people of other countries. Natasha will spend 9 months in Kenya in 2018 conducting field research on climate variability impacts on communities around Mount Kenya. Her work is a continuation of the lab\'s NSF Water Sustainability and Climate grant on understanding agricultural decision making and adaptive management in Kenya and Zambia.'
  })
  .commit();

console.log('✅ Updated Natasha Krell news item');
console.log('   - Removed misleading featured image');
console.log('   - Removed broken Fulbright Badge markdown reference');
