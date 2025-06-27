import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export default function PublicationDetail({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'content', 'publications', `${params.slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">{data.title || params.slug}</h1>
      <div className="mb-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="font-semibold">{key}:</span> {String(value)}
          </div>
        ))}
      </div>
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-4">
        {content.slice(0, 500)}
        {content.length > 500 ? '...' : ''}
      </pre>
      <Link href="/publications" className="text-blue-600 underline">
        Back to Publications
      </Link>
    </main>
  );
}

export async function generateStaticParams() {
  const pubsDir = path.join(process.cwd(), 'content', 'publications');
  const files = fs.readdirSync(pubsDir).filter((f) => f.endsWith('.mdx'));
  return files.map((filename) => ({ slug: filename.replace(/\.mdx$/, '') }));
}
