import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content', 'news', `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">{data.title || slug}</h1>
      {data.date && (
        <div className="mb-2 text-gray-500">
          {typeof data.date === 'string'
            ? data.date.slice(0, 10)
            : data.date instanceof Date
              ? data.date.toISOString().slice(0, 10)
              : String(data.date).slice(0, 10)}
        </div>
      )}
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
      <Link href="/news" className="text-blue-600 underline">
        Back to News
      </Link>
    </main>
  );
}

export async function generateStaticParams() {
  const newsDir = path.join(process.cwd(), 'content', 'news');
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.mdx'));
  return files.map((filename) => ({ slug: filename.replace(/\.mdx$/, '') }));
}
