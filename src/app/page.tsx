export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold mb-4">WAVES Research Lab</h1>
      <p className="mb-8 text-lg">Welcome! Explore our people, publications, and news.</p>
      <nav className="flex gap-8">
        <a href="/people" className="text-blue-600 underline">
          People
        </a>
        <a href="/publications" className="text-blue-600 underline">
          Publications
        </a>
        <a href="/news" className="text-blue-600 underline">
          News
        </a>
      </nav>
    </main>
  );
}
