#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

interface URLMapping {
  source: string;
  destination: string;
  permanent: boolean;
  type: 'people' | 'publications' | 'news' | 'pages' | 'assets';
}

interface URLMappingReport {
  timestamp: string;
  totalMappings: number;
  mappingsByType: {
    people: number;
    publications: number;
    news: number;
    pages: number;
    assets: number;
  };
  mappings: URLMapping[];
}

class URLMappingGenerator {
  private mappings: URLMapping[] = [];

  async generateMappings(): Promise<URLMappingReport> {
    console.log('🔗 Starting URL mapping generation...\n');

    try {
      // Generate mappings for different content types
      await this.generatePeopleMappings();
      await this.generatePublicationMappings();
      await this.generateNewsMappings();
      await this.generatePageMappings();
      await this.generateAssetMappings();

      // Generate report
      const report = this.generateReport();

      // Save mappings and report
      await this.saveMappings(report);

      return report;
    } catch (error) {
      console.error('URL mapping generation failed:', error);
      throw error;
    }
  }

  private async generatePeopleMappings(): Promise<void> {
    console.log('👥 Generating people URL mappings...');

    const peopleFiles = await glob('content/people/*.mdx');

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.slug) {
          // Jekyll URL pattern: /people/[filename]/
          const legacySlug = path.basename(filePath, '.mdx');
          const jekyllUrl = `/people/${legacySlug}/`;
          const nextUrl = `/people/${frontmatter.slug}`;

          // Only redirect from Jekyll-style URL (with trailing slash) to Next.js URL
          // Don't create self-referencing redirects
          if (jekyllUrl !== nextUrl + '/') {
            this.addMapping(jekyllUrl, nextUrl, true, 'people');
          }

          // Also handle without trailing slash, but only if different from destination
          const jekyllUrlNoSlash = `/people/${legacySlug}`;
          if (jekyllUrlNoSlash !== nextUrl) {
            this.addMapping(jekyllUrlNoSlash, nextUrl, true, 'people');
          }
        }
      } catch {
        // Skip invalid files
      }
    }
  }

  private async generatePublicationMappings(): Promise<void> {
    console.log('📚 Generating publication URL mappings...');

    const publicationFiles = await glob('content/publications/*.mdx');

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.slug) {
          // Jekyll URL pattern: /publications/[filename]/
          const legacySlug = path.basename(filePath, '.mdx');
          const jekyllUrl = `/publications/${legacySlug}/`;
          const nextUrl = `/publications/${frontmatter.slug}`;

          // Only redirect from Jekyll-style URL (with trailing slash) to Next.js URL
          // Don't create self-referencing redirects
          if (jekyllUrl !== nextUrl + '/') {
            this.addMapping(jekyllUrl, nextUrl, true, 'publications');
          }

          // Also handle without trailing slash, but only if different from destination
          const jekyllUrlNoSlash = `/publications/${legacySlug}`;
          if (jekyllUrlNoSlash !== nextUrl) {
            this.addMapping(jekyllUrlNoSlash, nextUrl, true, 'publications');
          }
        }
      } catch {
        // Skip invalid files
      }
    }
  }

  private async generateNewsMappings(): Promise<void> {
    console.log('📰 Generating news URL mappings...');

    const newsFiles = await glob('content/news/*.mdx');

    for (const filePath of newsFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.slug && frontmatter.date) {
          const legacySlug = path.basename(filePath, '.mdx');
          const nextUrl = `/news/${frontmatter.slug}`;

          // Only create redirects from Jekyll-style URLs that are different from the Next.js URL
          // Extract categories from frontmatter
          const categories = frontmatter.categories || [];

          if (categories.length > 0) {
            // Primary category URL - only if different from destination
            const primaryCategory = Array.isArray(categories) ? categories[0] : categories;
            const categorySlug = this.slugify(primaryCategory.toString());
            const jekyllUrl = `/${categorySlug}/${legacySlug}/`;

            // Only redirect if the Jekyll URL is different from the Next.js URL
            if (jekyllUrl !== nextUrl + '/') {
              this.addMapping(jekyllUrl, nextUrl, true, 'news');
            }
          }

          // Handle date-based URLs that might exist - only if different from destination
          const date = new Date(frontmatter.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');

          const dateUrl = `/${year}/${month}/${day}/${legacySlug}/`;

          // Only redirect if the date URL is different from the Next.js URL
          if (dateUrl !== nextUrl + '/') {
            this.addMapping(dateUrl, nextUrl, true, 'news');
          }
        }
      } catch {
        // Skip invalid files
      }
    }
  }

  private async generatePageMappings(): Promise<void> {
    console.log('📄 Generating page URL mappings...');

    // Common static pages that might need redirects - only from Jekyll-style URLs
    const staticPages = [
      { old: '/teaching/', new: '/teaching', permanent: true },
      { old: '/opportunities/', new: '/opportunities', permanent: true },
      { old: '/research/', new: '/research', permanent: true },
      { old: '/about/', new: '/about', permanent: true },
      { old: '/contact/', new: '/contact', permanent: true },
      // Collection index pages - only from Jekyll-style URLs
      { old: '/people/', new: '/people', permanent: true },
      { old: '/publications/', new: '/publications', permanent: true },
      { old: '/news/', new: '/news', permanent: true },
      { old: '/projects/', new: '/projects', permanent: true },
    ];

    for (const page of staticPages) {
      // Only create redirect if source and destination are different
      if (page.old !== page.new + '/') {
        this.addMapping(page.old, page.new, page.permanent, 'pages');
      }
    }
  }

  private async generateAssetMappings(): Promise<void> {
    console.log('🖼️  Generating asset URL mappings...');

    // Map legacy asset URLs to new structure
    const assetMappings = [
      // Images
      { old: '/assets/images/people/:path*', new: '/images/people/:path*', permanent: true },
      {
        old: '/assets/images/publications/:path*',
        new: '/images/publications/:path*',
        permanent: true,
      },
      { old: '/assets/images/:path*', new: '/images/site/:path*', permanent: true },

      // Files (CVs, PDFs, etc.)
      { old: '/assets/files/:path*', new: '/files/:path*', permanent: true },
      { old: '/uploads/:path*', new: '/files/:path*', permanent: true },

      // Legacy paths that might still be referenced
      { old: '/wp-content/uploads/:path*', new: '/files/:path*', permanent: true },
    ];

    for (const mapping of assetMappings) {
      this.addMapping(mapping.old, mapping.new, mapping.permanent, 'assets');
    }
  }

  private addMapping(
    source: string,
    destination: string,
    permanent: boolean,
    type: URLMapping['type'],
  ): void {
    // Avoid duplicate mappings
    const existing = this.mappings.find((m) => m.source === source);
    if (!existing) {
      this.mappings.push({
        source,
        destination,
        permanent,
        type,
      });
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  private generateReport(): URLMappingReport {
    const mappingsByType = {
      people: this.mappings.filter((m) => m.type === 'people').length,
      publications: this.mappings.filter((m) => m.type === 'publications').length,
      news: this.mappings.filter((m) => m.type === 'news').length,
      pages: this.mappings.filter((m) => m.type === 'pages').length,
      assets: this.mappings.filter((m) => m.type === 'assets').length,
    };

    return {
      timestamp: new Date().toISOString(),
      totalMappings: this.mappings.length,
      mappingsByType,
      mappings: this.mappings,
    };
  }

  private async saveMappings(report: URLMappingReport): Promise<void> {
    // Generate Next.js redirects configuration
    const nextRedirects = this.generateNextRedirects();

    // Generate Apache .htaccess redirects (backup option)
    const htaccessRedirects = this.generateHtaccessRedirects();

    // Generate Nginx redirects (backup option)
    const nginxRedirects = this.generateNginxRedirects();

    // Save all files
    await fs.writeFile('src/lib/redirects.ts', nextRedirects, 'utf-8');

    await fs.writeFile(
      'docs/migration/URL_MAPPING_REPORT.md',
      this.generateMarkdownReport(report),
      'utf-8',
    );

    await fs.writeFile(
      'docs/migration/url-mappings.json',
      JSON.stringify(report, null, 2),
      'utf-8',
    );

    await fs.writeFile('docs/migration/redirects.htaccess', htaccessRedirects, 'utf-8');

    await fs.writeFile('docs/migration/redirects.nginx', nginxRedirects, 'utf-8');

    // Console summary
    console.log('\n📊 URL Mapping Summary:');
    console.log(`🔗 Total mappings: ${report.totalMappings}`);
    console.log(`👥 People: ${report.mappingsByType.people}`);
    console.log(`📚 Publications: ${report.mappingsByType.publications}`);
    console.log(`📰 News: ${report.mappingsByType.news}`);
    console.log(`📄 Pages: ${report.mappingsByType.pages}`);
    console.log(`🖼️  Assets: ${report.mappingsByType.assets}`);

    console.log('\n📄 Files generated:');
    console.log('  - src/lib/redirects.ts (Next.js configuration)');
    console.log('  - docs/migration/URL_MAPPING_REPORT.md');
    console.log('  - docs/migration/url-mappings.json');
    console.log('  - docs/migration/redirects.htaccess');
    console.log('  - docs/migration/redirects.nginx');
  }

  private generateNextRedirects(): string {
    const permanentRedirects = this.mappings.filter((m) => m.permanent);
    const temporaryRedirects = this.mappings.filter((m) => !m.permanent);

    return `// Auto-generated redirects from URL mapping system
// Generated on: ${new Date().toISOString()}

export const redirects = [
  // Permanent redirects (301)
${permanentRedirects
  .map(
    (mapping) => `  {
    source: '${mapping.source}',
    destination: '${mapping.destination}',
    permanent: true,
  },`,
  )
  .join('\n')}

  // Temporary redirects (302)
${temporaryRedirects
  .map(
    (mapping) => `  {
    source: '${mapping.source}',
    destination: '${mapping.destination}',
    permanent: false,
  },`,
  )
  .join('\n')}
];

export default redirects;
`;
  }

  private generateHtaccessRedirects(): string {
    let htaccess = `# Auto-generated redirects from URL mapping system
# Generated on: ${new Date().toISOString()}

RewriteEngine On

# Permanent redirects (301)
`;

    const permanentRedirects = this.mappings.filter((m) => m.permanent);
    for (const mapping of permanentRedirects) {
      if (mapping.source.includes(':path*')) {
        // Handle dynamic paths
        const pattern = mapping.source.replace(':path*', '(.*)');
        const replacement = mapping.destination.replace(':path*', '$1');
        htaccess += `RewriteRule ^${pattern.slice(1)}$ ${replacement} [R=301,L]\n`;
      } else {
        htaccess += `Redirect 301 ${mapping.source} ${mapping.destination}\n`;
      }
    }

    const temporaryRedirects = this.mappings.filter((m) => !m.permanent);
    if (temporaryRedirects.length > 0) {
      htaccess += `\n# Temporary redirects (302)\n`;
      for (const mapping of temporaryRedirects) {
        if (mapping.source.includes(':path*')) {
          const pattern = mapping.source.replace(':path*', '(.*)');
          const replacement = mapping.destination.replace(':path*', '$1');
          htaccess += `RewriteRule ^${pattern.slice(1)}$ ${replacement} [R=302,L]\n`;
        } else {
          htaccess += `Redirect 302 ${mapping.source} ${mapping.destination}\n`;
        }
      }
    }

    return htaccess;
  }

  private generateNginxRedirects(): string {
    let nginx = `# Auto-generated redirects from URL mapping system
# Generated on: ${new Date().toISOString()}

`;

    for (const mapping of this.mappings) {
      const redirectType = mapping.permanent ? '301' : '302';

      if (mapping.source.includes(':path*')) {
        // Handle dynamic paths
        const pattern = mapping.source.replace(':path*', '(.*)');
        const replacement = mapping.destination.replace(':path*', '$1');
        nginx += `rewrite ^${pattern}$ ${replacement} ${redirectType === '301' ? 'permanent' : 'redirect'};\n`;
      } else {
        nginx += `rewrite ^${mapping.source}$ ${mapping.destination} ${redirectType === '301' ? 'permanent' : 'redirect'};\n`;
      }
    }

    return nginx;
  }

  private generateMarkdownReport(report: URLMappingReport): string {
    return `# URL Mapping Report

Generated on: ${report.timestamp}

## Summary

- **Total URL Mappings**: ${report.totalMappings}
- **People Mappings**: ${report.mappingsByType.people}
- **Publication Mappings**: ${report.mappingsByType.publications}
- **News Mappings**: ${report.mappingsByType.news}
- **Page Mappings**: ${report.mappingsByType.pages}
- **Asset Mappings**: ${report.mappingsByType.assets}

## URL Mapping Strategy

This system maintains SEO and user experience by redirecting all legacy Jekyll URLs to their new Next.js equivalents.

### Jekyll URL Patterns → Next.js URLs

#### People Profiles
- **Jekyll**: \`/people/[filename]/\`
- **Next.js**: \`/people/[slug]\`
- **Example**: \`/people/kelly-caylor/\` → \`/people/kelly-caylor\`

#### Publications
- **Jekyll**: \`/publications/[filename]/\`
- **Next.js**: \`/publications/[slug]\`
- **Example**: \`/publications/caylor2023_6934/\` → \`/publications/caylor2023_6934\`

#### News Posts
- **Jekyll**: \`/[category]/[title]/\` or \`/[year]/[month]/[day]/[title]/\`
- **Next.js**: \`/news/[slug]\`
- **Example**: \`/research/new-paper-in-nature/\` → \`/news/new-paper-in-nature\`

#### Static Pages
- **Jekyll**: \`/[page]/\`
- **Next.js**: \`/[page]\`
- **Example**: \`/teaching/\` → \`/teaching\`

#### Assets
- **Jekyll**: \`/assets/images/[path]\`
- **Next.js**: \`/images/[organized-path]\`
- **Example**: \`/assets/images/people/caylor.png\` → \`/images/people/caylor.png\`

## Implementation

### Next.js Configuration

Add to \`next.config.ts\`:

\`\`\`typescript
import { redirects } from './src/lib/redirects';

const nextConfig = {
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
\`\`\`

### Alternative Implementations

- **Apache**: Use \`redirects.htaccess\` file
- **Nginx**: Use \`redirects.nginx\` configuration
- **Cloudflare**: Use Page Rules or Workers

## Detailed Mappings

${this.generateMappingsByType(report)}

## Testing Redirects

### Manual Testing
\`\`\`bash
# Test with curl
curl -I http://localhost:3000/people/kelly-caylor/
curl -I http://localhost:3000/publications/caylor2023_6934/
curl -I http://localhost:3000/research/new-paper-in-nature/
\`\`\`

### Automated Testing
\`\`\`bash
# Run redirect tests
npm run test:redirects
\`\`\`

## Monitoring

- **Google Search Console**: Monitor 404 errors and redirect success
- **Analytics**: Track redirect usage and identify missing mappings
- **Server Logs**: Monitor redirect performance and identify issues

## Maintenance

- **New Content**: Ensure new content follows slug conventions
- **Legacy Links**: Monitor for new legacy links that need mapping
- **Performance**: Regularly review redirect performance impact

---

*This report was generated automatically by the URL mapping system.*
`;
  }

  private generateMappingsByType(report: URLMappingReport): string {
    const sections = [];

    for (const type of ['people', 'publications', 'news', 'pages', 'assets'] as const) {
      const mappings = report.mappings.filter((m) => m.type === type);
      if (mappings.length > 0) {
        sections.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)} Mappings

${mappings
  .slice(0, 10)
  .map((m) => `- \`${m.source}\` → \`${m.destination}\` (${m.permanent ? '301' : '302'})`)
  .join('\n')}
${mappings.length > 10 ? `\n*... and ${mappings.length - 10} more mappings*` : ''}
`);
      }
    }

    return sections.join('\n');
  }
}

// CLI execution
async function main() {
  const generator = new URLMappingGenerator();

  try {
    const report = await generator.generateMappings();
    console.log('\n✅ URL mapping generation completed successfully!');
    console.log(`📊 Generated ${report.totalMappings} URL mappings:`);
    console.log(`   - People: ${report.mappingsByType.people}`);
    console.log(`   - Publications: ${report.mappingsByType.publications}`);
    console.log(`   - News: ${report.mappingsByType.news}`);
    console.log(`   - Pages: ${report.mappingsByType.pages}`);
    console.log(`   - Assets: ${report.mappingsByType.assets}`);
    console.log('💡 Add the redirects to next.config.ts to enable URL redirects');
  } catch (error) {
    console.error('\n❌ URL mapping generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { URLMappingGenerator, type URLMapping, type URLMappingReport };
