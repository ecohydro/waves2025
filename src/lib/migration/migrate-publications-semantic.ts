import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  enhancePublicationWithSemanticScholar,
  SemanticScholarAPI,
} from './semantic-scholar-working';
import type { EnhancedPublicationData } from './semantic-scholar-working';

interface JekyllPublication {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  pdf?: string;
  abstract?: string;
  keywords?: string;
  volume?: string;
  pages?: string;
  issue?: string;
  publisher?: string;
  type?: string;
  booktitle?: string;
  editor?: string;
  address?: string;
  series?: string;
  number?: string;
  organization?: string;
  school?: string;
  institution?: string;
  howpublished?: string;
  note?: string;
  month?: string;
  annote?: string;
  crossref?: string;
  key?: string;
}

interface NextJSPublication extends JekyllPublication {
  slug: string;
  date: string;
  lastModified: string;
  tags: string[];
  categories: string[];
  featured?: boolean;
  draft?: boolean;
  semanticScholar?: EnhancedPublicationData['semanticScholar'];
}

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  semanticScholarEnhanced: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

function generateSlug(title: string, year: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50)}-${year}`;
}

// function parseAuthors(authorsString: string): string[] {
//   if (!authorsString) return [];
//
//   // Handle different author formats
//   const authors = authorsString
//     .split(/\s+and\s+|\s*,\s*|\s*;\s*/)
//     .map((author) => author.trim())
//     .filter((author) => author.length > 0);
//
//   return authors;
// }

function extractTags(publication: JekyllPublication): string[] {
  const tags = new Set<string>();

  // Add keywords as tags
  if (publication.keywords) {
    publication.keywords.split(/[,;]/).forEach((keyword) => {
      tags.add(keyword.trim().toLowerCase());
    });
  }

  // Add publication type as tag
  if (publication.type) {
    tags.add(publication.type.toLowerCase());
  }

  // Add journal as tag (simplified)
  if (publication.journal) {
    const journalTag = publication.journal
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 30);
    tags.add(journalTag);
  }

  return Array.from(tags);
}

function extractCategories(publication: JekyllPublication): string[] {
  const categories = new Set<string>();

  // Add research areas based on journal/venue
  if (publication.journal) {
    const journal = publication.journal.toLowerCase();

    if (journal.includes('water') || journal.includes('hydro')) {
      categories.add('hydrology');
    }
    if (journal.includes('eco') || journal.includes('environment')) {
      categories.add('ecology');
    }
    if (journal.includes('climate') || journal.includes('atmospheric')) {
      categories.add('climate');
    }
    if (journal.includes('remote') || journal.includes('sensing')) {
      categories.add('remote-sensing');
    }
    if (journal.includes('agriculture') || journal.includes('crop')) {
      categories.add('agriculture');
    }
    if (journal.includes('nature') || journal.includes('science')) {
      categories.add('high-impact');
    }
  }

  // Add publication type as category
  if (publication.type) {
    categories.add(publication.type.toLowerCase());
  }

  // Default category
  if (categories.size === 0) {
    categories.add('research');
  }

  return Array.from(categories);
}

async function transformPublication(
  jekyllPub: JekyllPublication,
  filename: string,
  api: SemanticScholarAPI,
): Promise<NextJSPublication> {
  const slug = generateSlug(jekyllPub.title, jekyllPub.year);
  // const authors = parseAuthors(jekyllPub.authors); // For future use
  const tags = extractTags(jekyllPub);
  const categories = extractCategories(jekyllPub);

  // Create base publication
  const nextjsPub: NextJSPublication = {
    ...jekyllPub,
    slug,
    date: `${jekyllPub.year}-01-01`,
    lastModified: new Date().toISOString(),
    tags,
    categories,
    authors: jekyllPub.authors, // Keep original string format
    featured: categories.includes('high-impact'),
    draft: false,
  };

  // Enhance with Semantic Scholar data
  try {
    console.log(`Enhancing ${jekyllPub.title} with Semantic Scholar data...`);
    const enhancement = await enhancePublicationWithSemanticScholar(jekyllPub, api);

    if (enhancement.semanticScholar) {
      nextjsPub.semanticScholar = enhancement.semanticScholar;
      console.log(`  ✓ Enhanced with Semantic Scholar data`);

      // Update abstract if we got a better one
      if (enhancement.semanticScholar.abstract && !nextjsPub.abstract) {
        nextjsPub.abstract = enhancement.semanticScholar.abstract;
      }

      // Add TLDR if available
      if (enhancement.semanticScholar.tldr && !nextjsPub.note) {
        nextjsPub.note = `TLDR: ${enhancement.semanticScholar.tldr}`;
      }

      // Add fields of study as additional tags
      if (enhancement.semanticScholar.fieldsOfStudy) {
        enhancement.semanticScholar.fieldsOfStudy.forEach((field) => {
          const fieldTag = field.toLowerCase().replace(/\s+/g, '-');
          if (!nextjsPub.tags.includes(fieldTag)) {
            nextjsPub.tags.push(fieldTag);
          }
        });
      }

      return nextjsPub;
    } else {
      console.log(`  - No Semantic Scholar data found`);
    }
  } catch (error) {
    console.warn(`  ! Error enhancing with Semantic Scholar:`, error);
  }

  return nextjsPub;
}

function createPublicationMDX(publication: NextJSPublication): string {
  const { date, lastModified, tags, categories, featured, draft, semanticScholar, ...frontMatter } =
    publication;

  // Create clean front matter
  const cleanFrontMatter = {
    title: frontMatter.title,
    authors: frontMatter.authors,
    journal: frontMatter.journal,
    year: frontMatter.year,
    date,
    lastModified,
    tags,
    categories,
    featured,
    draft,
    ...(frontMatter.doi && { doi: frontMatter.doi }),
    ...(frontMatter.url && { url: frontMatter.url }),
    ...(frontMatter.pdf && { pdf: frontMatter.pdf }),
    ...(frontMatter.abstract && { abstract: frontMatter.abstract }),
    ...(frontMatter.volume && { volume: frontMatter.volume }),
    ...(frontMatter.pages && { pages: frontMatter.pages }),
    ...(frontMatter.issue && { issue: frontMatter.issue }),
    ...(frontMatter.publisher && { publisher: frontMatter.publisher }),
    ...(frontMatter.type && { type: frontMatter.type }),
    ...(frontMatter.keywords && { keywords: frontMatter.keywords }),
    ...(semanticScholar && { semanticScholar }),
  };

  // Create content
  let content = '';

  if (frontMatter.abstract) {
    content += '## Abstract\n\n';
    content += `${frontMatter.abstract}\n\n`;
  }

  if (semanticScholar?.tldr) {
    content += '## Summary\n\n';
    content += `${semanticScholar.tldr}\n\n`;
  }

  if (semanticScholar?.citationCount) {
    content += '## Citation Metrics\n\n';
    content += `- **Citations**: ${semanticScholar.citationCount}\n`;
    if (semanticScholar.influentialCitationCount) {
      content += `- **Influential Citations**: ${semanticScholar.influentialCitationCount}\n`;
    }
    if (semanticScholar.referenceCount) {
      content += `- **References**: ${semanticScholar.referenceCount}\n`;
    }
    content += '\n';
  }

  if (semanticScholar?.isOpenAccess) {
    content += '## Access\n\n';
    content += '- **Open Access**: Yes\n';
    if (semanticScholar.openAccessPdfUrl) {
      content += `- **PDF**: [Download](${semanticScholar.openAccessPdfUrl})\n`;
    }
    content += '\n';
  }

  if (semanticScholar?.enhancedAuthors && semanticScholar.enhancedAuthors.length > 0) {
    content += '## Author Information\n\n';
    semanticScholar.enhancedAuthors.forEach((author) => {
      content += `### ${author.name}\n\n`;
      if (author.affiliations && author.affiliations.length > 0) {
        content += `- **Affiliations**: ${author.affiliations.join(', ')}\n`;
      }
      if (author.paperCount) {
        content += `- **Papers**: ${author.paperCount}\n`;
      }
      if (author.citationCount) {
        content += `- **Citations**: ${author.citationCount}\n`;
      }
      if (author.hIndex) {
        content += `- **H-Index**: ${author.hIndex}\n`;
      }
      if (author.homepage) {
        content += `- **Homepage**: ${author.homepage}\n`;
      }
      content += '\n';
    });
  }

  if (semanticScholar?.url) {
    content += '## Links\n\n';
    content += `- [Semantic Scholar](${semanticScholar.url})\n`;
    if (frontMatter.doi) {
      content += `- [DOI](https://doi.org/${frontMatter.doi})\n`;
    }
    if (frontMatter.url) {
      content += `- [Publisher](${frontMatter.url})\n`;
    }
    content += '\n';
  }

  return matter.stringify(content, cleanFrontMatter);
}

export async function migratePublicationsEnhanced(
  sourceDir: string,
  targetDir: string,
  options: {
    dryRun?: boolean;
    maxFiles?: number;
    skipSemanticScholar?: boolean;
  } = {},
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    successful: 0,
    failed: 0,
    semanticScholarEnhanced: 0,
    errors: [],
  };

  const api = new SemanticScholarAPI();

  console.log(`Starting enhanced publications migration...`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${targetDir}`);
  console.log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(
    `Semantic Scholar enhancement: ${options.skipSemanticScholar ? 'Disabled' : 'Enabled'}`,
  );

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  if (!options.dryRun && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.markdown'))
    .slice(0, options.maxFiles);

  stats.total = files.length;

  for (const [index, filename] of files.entries()) {
    console.log(`\n[${index + 1}/${files.length}] Processing ${filename}`);

    try {
      const filePath = path.join(sourceDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontMatter } = matter(content);

      // Validate required fields
      if (!frontMatter.title || !frontMatter.year) {
        throw new Error('Missing required fields: title or year');
      }

      // Transform publication
      let publication: NextJSPublication;
      if (options.skipSemanticScholar) {
        publication = await transformPublication(frontMatter as JekyllPublication, filename, api);
      } else {
        publication = await transformPublication(frontMatter as JekyllPublication, filename, api);
        if (publication.semanticScholar) {
          stats.semanticScholarEnhanced++;
        }
      }

      // Generate MDX content
      const mdxContent = createPublicationMDX(publication);

      // Write file
      if (!options.dryRun) {
        const outputPath = path.join(targetDir, `${publication.slug}.mdx`);
        fs.writeFileSync(outputPath, mdxContent);
      }

      stats.successful++;
      console.log(`  ✓ Successfully processed: ${publication.slug}`);
    } catch (error) {
      stats.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push({ file: filename, error: errorMessage });
      console.error(`  ✗ Failed to process ${filename}:`, errorMessage);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('ENHANCED PUBLICATIONS MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Enhanced with Semantic Scholar: ${stats.semanticScholarEnhanced}`);
  console.log(`Success rate: ${((stats.successful / stats.total) * 100).toFixed(1)}%`);
  console.log(
    `Semantic Scholar enhancement rate: ${((stats.semanticScholarEnhanced / stats.successful) * 100).toFixed(1)}%`,
  );

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  return stats;
}

// CLI usage
if (require.main === module) {
  const sourceDir = process.argv[2] || 'legacy/_publications';
  const targetDir = process.argv[3] || 'content/publications';
  const dryRun = process.argv.includes('--dry-run');
  const maxFiles = process.argv.includes('--max')
    ? parseInt(process.argv[process.argv.indexOf('--max') + 1])
    : undefined;
  const skipSemanticScholar = process.argv.includes('--skip-semantic-scholar');

  migratePublicationsEnhanced(sourceDir, targetDir, {
    dryRun,
    maxFiles,
    skipSemanticScholar,
  })
    .then((stats) => {
      console.log('\nMigration completed!');
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
