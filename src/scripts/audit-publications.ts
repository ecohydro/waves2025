#!/usr/bin/env tsx

/**
 * Comprehensive publication metadata audit script
 * Analyzes data quality issues in publication records
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
});

interface PublicationAuditReport {
  totalPublications: number;
  issues: {
    missingAbstracts: number;
    noneAbstracts: number;
    missingDOIs: number;
    invalidDates: number;
    missingVenues: number;
    authorIssues: number;
    statusIssues: number;
  };
  detailedIssues: Array<{
    id: string;
    title: string;
    issues: string[];
  }>;
  recommendations: string[];
}

async function auditPublications(): Promise<PublicationAuditReport> {
  console.log('🔍 Auditing publication metadata quality...\n');

  // Fetch all publications with relevant fields
  const publications = await client.fetch(`
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

  console.log(`Found ${publications.length} publications to audit\n`);

  const report: PublicationAuditReport = {
    totalPublications: publications.length,
    issues: {
      missingAbstracts: 0,
      noneAbstracts: 0,
      missingDOIs: 0,
      invalidDates: 0,
      missingVenues: 0,
      authorIssues: 0,
      statusIssues: 0,
    },
    detailedIssues: [],
    recommendations: [],
  };

  const validStatuses = ['published', 'in-press', 'accepted', 'under-review', 'submitted', 'in-preparation', 'preprint'];
  const validPublicationTypes = ['journal-article', 'conference-paper', 'book-chapter', 'preprint', 'thesis', 'report', 'book', 'other'];

  for (const pub of publications) {
    const pubIssues: string[] = [];

    // Check abstract issues
    if (!pub.abstract) {
      report.issues.missingAbstracts++;
      pubIssues.push('Missing abstract');
    } else if (pub.abstract === 'None' || pub.abstract === 'none' || pub.abstract === 'N/A') {
      report.issues.noneAbstracts++;
      pubIssues.push('Abstract marked as "None" - should be null or proper abstract');
    }

    // Check DOI issues
    if (!pub.doi || pub.doi === 'None' || pub.doi === 'none') {
      report.issues.missingDOIs++;
      pubIssues.push('Missing or invalid DOI');
    }

    // Check date format issues
    if (pub.publishedDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(pub.publishedDate)) {
        report.issues.invalidDates++;
        pubIssues.push(`Invalid publishedDate format: ${pub.publishedDate}`);
      }
    }

    // Check venue issues
    if (!pub.venue?.name || pub.venue.name === 'None' || pub.venue.name === 'none') {
      report.issues.missingVenues++;
      pubIssues.push('Missing or invalid venue');
    }

    // Check author issues
    if (!pub.authors || pub.authors.length === 0) {
      report.issues.authorIssues++;
      pubIssues.push('No authors listed');
    } else {
      // Check for author data quality
      const authorIssues = pub.authors.filter(author => 
        !author.name || author.name === 'None' || author.name === 'none'
      );
      if (authorIssues.length > 0) {
        report.issues.authorIssues++;
        pubIssues.push(`${authorIssues.length} authors with invalid names`);
      }
    }

    // Check status issues
    if (!pub.status || !validStatuses.includes(pub.status)) {
      report.issues.statusIssues++;
      pubIssues.push(`Invalid status: ${pub.status || 'missing'}`);
    }

    // Check publication type
    if (!pub.publicationType || !validPublicationTypes.includes(pub.publicationType)) {
      pubIssues.push(`Invalid publication type: ${pub.publicationType || 'missing'}`);
    }

    // Add to detailed issues if any problems found
    if (pubIssues.length > 0) {
      report.detailedIssues.push({
        id: pub._id,
        title: pub.title || 'Untitled',
        issues: pubIssues,
      });
    }
  }

  // Generate recommendations
  if (report.issues.noneAbstracts > 0) {
    report.recommendations.push(`Clean up ${report.issues.noneAbstracts} publications with "None" abstracts - either add proper abstracts or set to null`);
  }
  
  if (report.issues.missingDOIs > 0) {
    report.recommendations.push(`Research and add DOIs for ${report.issues.missingDOIs} publications where possible`);
  }

  if (report.issues.missingVenues > 0) {
    report.recommendations.push(`Add proper venue information for ${report.issues.missingVenues} publications`);
  }

  if (report.issues.invalidDates > 0) {
    report.recommendations.push(`Fix date format issues for ${report.issues.invalidDates} publications (should be YYYY-MM-DD)`);
  }

  if (report.issues.authorIssues > 0) {
    report.recommendations.push(`Review and fix author data for ${report.issues.authorIssues} publications`);
  }

  return report;
}

function printReport(report: PublicationAuditReport): void {
  console.log('='.repeat(60));
  console.log('📊 PUBLICATION METADATA AUDIT REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n📚 Total Publications: ${report.totalPublications}`);
  
  console.log('\n🚨 Issues Found:');
  console.log(`   • Missing abstracts: ${report.issues.missingAbstracts}`);
  console.log(`   • "None" abstracts: ${report.issues.noneAbstracts}`);
  console.log(`   • Missing DOIs: ${report.issues.missingDOIs}`);
  console.log(`   • Invalid dates: ${report.issues.invalidDates}`);
  console.log(`   • Missing venues: ${report.issues.missingVenues}`);
  console.log(`   • Author issues: ${report.issues.authorIssues}`);
  console.log(`   • Status issues: ${report.issues.statusIssues}`);

  const totalIssues = Object.values(report.issues).reduce((sum, count) => sum + count, 0);
  const healthScore = Math.round(((report.totalPublications - report.detailedIssues.length) / report.totalPublications) * 100);
  
  console.log(`\n📈 Publication Health Score: ${healthScore}% (${report.totalPublications - report.detailedIssues.length}/${report.totalPublications} publications without issues)`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  if (report.detailedIssues.length > 0) {
    console.log(`\n🔍 Publications with Issues (showing first 10 of ${report.detailedIssues.length}):`);
    report.detailedIssues.slice(0, 10).forEach((pub, i) => {
      console.log(`\n${i + 1}. ${pub.title}`);
      console.log(`   ID: ${pub.id}`);
      pub.issues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    });

    if (report.detailedIssues.length > 10) {
      console.log(`\n... and ${report.detailedIssues.length - 10} more publications with issues`);
    }
  }
}

async function main() {
  try {
    const report = await auditPublications();
    printReport(report);

    // Save detailed report to file
    const reportPath = path.join(process.cwd(), 'publication-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: publication-audit-report.json`);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { auditPublications };