import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';

export default function PeoplePage() {
  const peopleDir = path.join(process.cwd(), 'content', 'people');
  const files = fs.readdirSync(peopleDir).filter((f) => f.endsWith('.mdx'));
  const people = files.map((filename) => {
    const filePath = path.join(peopleDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    return {
      title: data.title || filename.replace(/\.mdx$/, ''),
      slug: filename.replace(/\.mdx$/, ''),
    };
  });

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">People</h1>
      <ul className="space-y-2">
        {people.map((person) => (
          <li key={person.slug}>
            <Link href={`/people/${person.slug}`} className="text-blue-600 underline">
              {person.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
