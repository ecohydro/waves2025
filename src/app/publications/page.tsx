import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';

export default function PublicationsPage() {
  const pubsDir = path.join(process.cwd(), 'content', 'publications');
  const files = fs.readdirSync(pubsDir).filter((f) => f.endsWith('.mdx'));
  const pubs = files.map((filename) => {
    const filePath = path.join(pubsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    return {
      title: data.title || filename.replace(/\.mdx$/, ''),
      slug: filename.replace(/\.mdx$/, ''),
    };
  });

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Publications</h1>
      <ul className="space-y-2">
        {pubs.map((pub) => (
          <li key={pub.slug}>
            <Link href={`/publications/${pub.slug}`} className="text-blue-600 underline">
              {pub.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
