import { client } from '../src/sanity/lib/client';

async function main() {
  const person = await client.fetch('*[_type == "person" && slug.current == "cella-schnabel"][0]');
  console.log(JSON.stringify(person, null, 2));
}

main();
