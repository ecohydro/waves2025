import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';

export default function NewsPage() {
  const newsDir = path.join(process.cwd(), 'content', 'news');
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.mdx'));
  const news = files.map((filename) => {
    const filePath = path.join(newsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    return {
      title: data.title || filename.replace(/\.mdx$/, ''),
      slug: filename.replace(/\.mdx$/, ''),
      date: data.date || '',
    };
  });

  // Sort by date descending
  news.sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">News</h1>
      <ul className="space-y-2">
        {news.map((post) => (
          <li key={post.slug}>
            <Link href={`/news/${post.slug}`} className="text-blue-600 underline">
              {post.title}
            </Link>
            {post.date && (
              <span className="ml-2 text-gray-500 text-sm">
                (
                {typeof post.date === 'string'
                  ? post.date.slice(0, 10)
                  : post.date instanceof Date
                    ? post.date.toISOString().slice(0, 10)
                    : String(post.date).slice(0, 10)}
                )
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
