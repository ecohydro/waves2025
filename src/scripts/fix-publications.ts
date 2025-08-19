#!/usr/bin/env tsx

/**
 * Publication metadata cleanup script
 * Fixes common data quality issues in publication records
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const readOnlyClient = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
});

interface FixReport {
  totalPublications: number;
  fixed: {
    abstracts: number;
    authors: number;
    venues: number;
    dois: number;
  };
  errors: number;
  details: Array<{
    id: string;
    title: string;
    fixes: string[];
    errors?: string[];
  }>;
}

/**
 * Clean up "None" values and replace with null
 */
function cleanNoneValues(value: any): any {
  if (typeof value === 'string' && (value === 'None' || value === 'none' || value === 'N/A' || value === 'n/a')) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map(cleanNoneValues).filter(v => v !== null);
  }
  if (value && typeof value === 'object') {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(value)) {
      const cleanedVal = cleanNoneValues(val);
      if (cleanedVal !== null) {
        cleaned[key] = cleanedVal;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
  return value;
}

/**
 * Fix author data issues
 */
function fixAuthors(authors: any[]): any[] {
  if (!authors) return [];
  
  return authors
    .filter(author => author.name && author.name !== 'None' && author.name !== 'none')
    .map(author => ({
      ...author,
      name: author.name?.trim(),
      affiliation: cleanNoneValues(author.affiliation),
      email: cleanNoneValues(author.email),
    }));
}

/**
 * Fix publication metadata
 */
async function fixPublications(dryRun: boolean = true): Promise<FixReport> {
  console.log('🔧 Starting publication metadata fixes...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}\n`);

  if (!dryRun && !process.env.SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN required for live updates');
  }

  // Fetch all publications
  const publications = await readOnlyClient.fetch(`
    *[_type == "publication"] {
      _id,
      title,
      slug,
      publicationType,
      authors,
      abstract,
      keywords,
      venue,
      publishedDate,
      submittedDate,
      acceptedDate,
      doi,
      isbn,
      pmid,
      arxivId,
      status,
      isFeatured,
      isOpenAccess
    }
  `);

  const report: FixReport = {
    totalPublications: publications.length,
    fixed: {
      abstracts: 0,
      authors: 0,
      venues: 0,
      dois: 0,
    },
    errors: 0,
    details: [],
  };

  for (const pub of publications) {
    const fixes: string[] = [];
    const errors: string[] = [];

    try {
      const updates: any = {};
      let needsUpdate = false;

      // Fix abstract
      if (pub.abstract === 'None' || pub.abstract === 'none' || pub.abstract === 'N/A') {
        updates.abstract = null;
        fixes.push('Cleaned abstract: removed "None" value');
        report.fixed.abstracts++;
        needsUpdate = true;
      }

      // Fix DOI
      if (pub.doi === 'None' || pub.doi === 'none' || pub.doi === 'N/A') {
        updates.doi = null;
        fixes.push('Cleaned DOI: removed "None" value');
        report.fixed.dois++;
        needsUpdate = true;
      }

      // Fix venue
      if (pub.venue?.name === 'None' || pub.venue?.name === 'none' || pub.venue?.name === 'N/A') {
        updates.venue = null;
        fixes.push('Cleaned venue: removed "None" value');
        report.fixed.venues++;
        needsUpdate = true;
      }

      // Fix authors
      if (pub.authors && pub.authors.length > 0) {
        const originalCount = pub.authors.length;
        const fixedAuthors = fixAuthors(pub.authors);
        
        if (fixedAuthors.length !== originalCount || 
            JSON.stringify(fixedAuthors) !== JSON.stringify(pub.authors)) {
          updates.authors = fixedAuthors;
          fixes.push(`Fixed authors: cleaned ${originalCount - fixedAuthors.length} invalid entries`);
          report.fixed.authors++;
          needsUpdate = true;
        }
      }

      // Apply updates
      if (needsUpdate && !dryRun) {
        await client
          .patch(pub._id)
          .set(updates)
          .commit();
      }

      if (fixes.length > 0) {
        report.details.push({
          id: pub._id,
          title: pub.title || 'Untitled',
          fixes,
          errors: errors.length > 0 ? errors : undefined,
        });
      }

    } catch (error) {
      report.errors++;
      errors.push(`Update failed: ${error}`);
      report.details.push({
        id: pub._id,
        title: pub.title || 'Untitled',
        fixes,
        errors,
      });
      console.error(`❌ Error fixing ${pub.title}:`, error);
    }
  }

  return report;
}

function printReport(report: FixReport, dryRun: boolean): void {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 PUBLICATION CLEANUP REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n📚 Total Publications: ${report.totalPublications}`);
  console.log(`🎯 Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
  
  console.log('\n✅ Fixes Applied:');
  console.log(`   • Abstracts cleaned: ${report.fixed.abstracts}`);
  console.log(`   • Authors fixed: ${report.fixed.authors}`);
  console.log(`   • Venues cleaned: ${report.fixed.venues}`);
  console.log(`   • DOIs cleaned: ${report.fixed.dois}`);
  
  const totalFixes = Object.values(report.fixed).reduce((sum, count) => sum + count, 0);
  console.log(`   • Total fixes: ${totalFixes}`);
  
  if (report.errors > 0) {
    console.log(`\n❌ Errors: ${report.errors}`);
  }

  if (report.details.length > 0) {
    console.log(`\n📝 Publications Modified (showing first 10 of ${report.details.length}):`);
    report.details.slice(0, 10).forEach((pub, i) => {
      console.log(`\n${i + 1}. ${pub.title}`);
      pub.fixes.forEach(fix => {
        console.log(`   ✅ ${fix}`);
      });
      if (pub.errors) {
        pub.errors.forEach(error => {
          console.log(`   ❌ ${error}`);
        });
      }
    });

    if (report.details.length > 10) {
      console.log(`\n... and ${report.details.length - 10} more publications modified`);
    }
  }

  if (dryRun && totalFixes > 0) {
    console.log('\n💡 This was a dry run. Use --live to apply changes.');
  } else if (!dryRun && totalFixes > 0) {
    console.log('\n✅ Publication fixes applied successfully!');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--live');

  try {
    const report = await fixPublications(dryRun);
    printReport(report, dryRun);

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'publication-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: publication-fix-report.json`);

  } catch (error) {
    console.error('❌ Publication fix failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { fixPublications };