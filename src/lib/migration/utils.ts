import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { JekyllPersonFrontMatter, NextJSPersonFrontMatter } from './types';

/**
 * Generate a URL-friendly slug from a title or name
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract name from Jekyll title (e.g., "Kelly Caylor, Professor" -> "Kelly Caylor")
 */
export function extractNameFromTitle(title: string): string {
  // Remove role/position information after comma
  const name = title.split(',')[0].trim();
  return name;
}

/**
 * Convert Jekyll asset path to Next.js public path
 */
export function convertAssetPath(jekyllPath: string): string {
  if (!jekyllPath) return '';

  // Remove 'assets/' prefix and add '/' prefix for Next.js public directory
  return jekyllPath.replace(/^assets\//, '/');
}

/**
 * Parse Jekyll markdown file and extract front matter and content
 */
export function parseJekyllFile(filePath: string): {
  frontMatter: Record<string, unknown>;
  content: string;
} {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(fileContent);

  return {
    frontMatter: parsed.data,
    content: parsed.content,
  };
}

/**
 * Generate MDX file content with front matter
 */
export function generateMDXContent(frontMatter: Record<string, unknown>, content: string): string {
  const yamlFrontMatter = matter.stringify('', frontMatter);
  return `${yamlFrontMatter}\n${content}`;
}

/**
 * Ensure directory exists, create if it doesn't
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get all markdown files in a directory
 */
export function getMarkdownFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(dirPath, file));
}

/**
 * Transform Jekyll person front matter to Next.js format
 */
export function transformPersonFrontMatter(
  jekyllFrontMatter: JekyllPersonFrontMatter,
  authorsData?: Record<string, Record<string, unknown>>,
): NextJSPersonFrontMatter {
  const name = extractNameFromTitle(jekyllFrontMatter.title);
  const slug = generateSlug(name);

  // Get additional data from authors.yml if available
  const authorData = authorsData?.[jekyllFrontMatter.author || name] || {};

  const transformed: NextJSPersonFrontMatter = {
    title: name,
    role: jekyllFrontMatter.role,
    excerpt: jekyllFrontMatter.excerpt,
    avatar: convertAssetPath(jekyllFrontMatter.avatar || ''),
    headerImage: convertAssetPath(jekyllFrontMatter.header?.image || ''),
    headerCaption: jekyllFrontMatter.header?.caption?.replace(/<br\s*\/?>/g, '. '),
    tags: jekyllFrontMatter['portfolio-item-tag'] || [],
    slug,

    // Additional fields from authors.yml
    location: authorData.location as string | undefined,
    email: authorData.email as string | undefined,
    website: authorData.uri as string | undefined,
    orcid: authorData.orcid as string | undefined,
    googleScholar: authorData.google_scholar as string | undefined,
    researchGate: authorData.researchgate as string | undefined,
    linkedin: authorData.linkedin as string | undefined,
    twitter: authorData.twitter as string | undefined,
    github: authorData.github as string | undefined,
    cv: convertAssetPath((authorData.cv as string) || ''),

    // Initialize empty arrays for future population
    education: [],
    researchAreas: [],
    currentProjects: [],
    publications: [],
  };

  // Clean up undefined values
  Object.keys(transformed).forEach((key) => {
    if (transformed[key as keyof NextJSPersonFrontMatter] === undefined) {
      delete transformed[key as keyof NextJSPersonFrontMatter];
    }
  });

  return transformed;
}

/**
 * Parse education information from header caption
 */
export function parseEducationFromCaption(
  caption: string,
): Array<{ degree: string; field: string; institution: string }> {
  if (!caption) return [];

  const education = [];
  const parts = caption.split('<br />').map((part) => part.trim());

  for (const part of parts) {
    if (part.includes('PhD') || part.includes('MS') || part.includes('BS') || part.includes('BA')) {
      const match = part.match(/^(PhD|MS|BS|BA),?\s*([^,]+),?\s*(.+)$/);
      if (match) {
        education.push({
          degree: match[1],
          field: match[2].trim(),
          institution: match[3].trim(),
        });
      }
    }
  }

  return education;
}

/**
 * Log migration progress
 */
export function logProgress(message: string, verbose: boolean = false): void {
  if (verbose) {
    console.log(`[MIGRATION] ${message}`);
  }
}

/**
 * Log migration error
 */
export function logError(message: string): void {
  console.error(`[MIGRATION ERROR] ${message}`);
}

/**
 * Log migration warning
 */
export function logWarning(message: string): void {
  console.warn(`[MIGRATION WARNING] ${message}`);
}
