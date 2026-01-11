#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type FrontMatter = Record<string, unknown> & {
  title?: string;
  authors?: Array<{ name: string }> | string;
  semanticScholar?: {
    enhancedAuthors?: Array<{ name?: string; semanticScholarId?: string }>;
    authors?: Array<{ name?: string; authorId?: string }>; // fallback if present
  };
};

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function normalizeName(name?: string): string | null {
  if (!name) return null;
  const trimmed = name.replace(/\s+/g, ' ').trim();
  if (trimmed.length === 0) return null;
  return trimmed;
}

function parseAuthorsField(authors: FrontMatter['authors']): string[] {
  if (!authors) return [];
  if (typeof authors === 'string') {
    // Split on common separators: commas and 'and'
    return authors
      .split(/,\s*|\s+and\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(authors)) {
    return authors
      .map((a) => (a && typeof a === 'object' ? normalizeName((a as any).name) : null))
      .filter((n): n is string => !!n);
  }
  return [];
}

function looksLikeLastNameOnly(name: string): boolean {
  // Heuristic: single token without spaces or hyphens and starts with uppercase
  // Allow particles like "van", "de" by checking spaces
  if (name.includes(' ')) return false;
  if (name.includes('-')) return false;
  // Exclude initials like "J." by checking trailing period
  if (/^[A-Za-z]\.?$/.test(name)) return true;
  // Single token likely a last name
  return true;
}

function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return value.map((v: any) => pruneUndefined(v)).filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[k] = pruneUndefined(v as any) as unknown;
    }
    return result as unknown as T;
  }
  return value;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  const dryRun = args.includes('--dry-run');
  const maxCount = get('--max') ? parseInt(String(get('--max')), 10) : undefined;
  const onlyIfShortNames = args.includes('--only-if-short-names');

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);

  const files = listMdxFiles(sourceDir);
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    if (maxCount && processed >= maxCount) break;

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as FrontMatter;

    const currentAuthors = parseAuthorsField(fm.authors);

    // Prefer enhancedAuthors from Semantic Scholar
    const ss = (fm.semanticScholar || {}) as FrontMatter['semanticScholar'];
    const ssAuthors = (ss?.enhancedAuthors || ss?.authors || [])
      .map((a) => normalizeName(a?.name))
      .filter((n): n is string => !!n);

    if (!ssAuthors || ssAuthors.length === 0) {
      skipped++;
      processed++;
      continue;
    }

    // Decide whether to update
    let shouldUpdate = false;

    if (currentAuthors.length === 0) {
      shouldUpdate = true;
    } else if (onlyIfShortNames) {
      // Update only when authors look like last names only
      const hasShort = currentAuthors.some((n) => looksLikeLastNameOnly(n));
      shouldUpdate = hasShort;
    } else {
      // Update if the lists differ (case-insensitive) or lengths mismatch
      const a = currentAuthors.map((n) => n.toLowerCase());
      const b = ssAuthors.map((n) => n.toLowerCase());
      shouldUpdate = a.length !== b.length || a.some((n, i) => n !== b[i]);
    }

    if (!shouldUpdate) {
      skipped++;
      processed++;
      continue;
    }

    const nextFm: FrontMatter = {
      ...fm,
      authors: ssAuthors.map((name) => ({ name })),
    };

    const newContent = matter.stringify(
      parsed.content,
      pruneUndefined(nextFm) as Record<string, unknown>,
    );

    if (dryRun) {
      console.log(
        `🧪 [dry-run] ${path.basename(filePath)}\n  from: ${JSON.stringify(currentAuthors)}\n  to:   ${JSON.stringify(
          ssAuthors,
        )}`,
      );
    } else {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated authors in ${path.basename(filePath)}`);
      updated++;
    }

    processed++;
  }

  console.log(
    `\n📊 Author fix summary: processed=${processed}, updated=${updated}, skipped=${skipped}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fix authors from Semantic Scholar failed:', err);
    process.exit(1);
  });
}
