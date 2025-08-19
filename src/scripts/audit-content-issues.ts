#!/usr/bin/env tsx

/**
 * Comprehensive content audit script to identify and report issues with migrated content
 */

import { createClient } from '@sanity/client';

// Use hardcoded config to avoid env var issues
const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: true,
});
import fs from 'fs';
import path from 'path';

interface AuditReport {
  people: {
    total: number;
    missingAvatars: number;
    brokenImageLinks: string[];
    missingBios: number;
    missingEmailsCurrentMembers: number;
    issues: Array<{ name: string; issues: string[] }>;
  };
  publications: {
    total: number;
    missingDOIs: number;
    missingAbstracts: number;
    brokenPDFLinks: string[];
    missingAuthors: number;
    issues: Array<{ title: string; issues: string[] }>;
  };
  news: {
    total: number;
    missingImages: number;
    brokenImageLinks: string[];
    missingExcerpts: number;
    unpublishedArticles: number;
    issues: Array<{ title: string; issues: string[] }>;
  };
  images: {
    referencedButMissing: string[];
    legacyPathsFound: string[];
    optimizedVersionsAvailable: string[];
  };
}

async function auditPeople() {
  console.log('🧑‍🔬 Auditing People data...');
  
  const people = await client.fetch(`
    *[_type == "person"] {
      _id,
      name,
      slug,
      userGroup,
      avatar,
      email,
      bio,
      bioLong,
      isActive,
      socialMedia
    }
  `);

  const issues: Array<{ name: string; issues: string[] }> = [];
  let missingAvatars = 0;
  let missingBios = 0;
  let missingEmailsCurrentMembers = 0;
  const brokenImageLinks: string[] = [];

  for (const person of people) {
    const personIssues: string[] = [];

    // Check for missing avatar
    if (!person.avatar?.asset?._ref) {
      missingAvatars++;
      personIssues.push('Missing avatar image');
    } else {
      // Check if referenced image exists
      const imageRef = person.avatar.asset._ref;
      if (imageRef.includes('image-') && !imageRef.includes('sanity')) {
        brokenImageLinks.push(`${person.name}: ${imageRef}`);
        personIssues.push('Potentially broken image reference');
      }
    }

    // Check for missing bio
    if (!person.bio && !person.bioLong) {
      missingBios++;
      personIssues.push('Missing bio');
    }

    // Check for missing email in current members
    if (person.userGroup === 'current' && person.isActive && !person.email) {
      missingEmailsCurrentMembers++;
      personIssues.push('Current member missing email');
    }

    if (personIssues.length > 0) {
      issues.push({ name: person.name, issues: personIssues });
    }
  }

  return {
    total: people.length,
    missingAvatars,
    brokenImageLinks,
    missingBios,
    missingEmailsCurrentMembers,
    issues
  };
}

async function auditPublications() {
  console.log('📚 Auditing Publications data...');
  
  const publications = await client.fetch(`
    *[_type == "publication"] {
      _id,
      title,
      slug,
      doi,
      abstract,
      authors,
      links,
      publishedDate,
      status
    }
  `);

  const issues: Array<{ title: string; issues: string[] }> = [];
  let missingDOIs = 0;
  let missingAbstracts = 0;
  let missingAuthors = 0;
  const brokenPDFLinks: string[] = [];

  for (const pub of publications) {
    const pubIssues: string[] = [];

    // Check for missing DOI
    if (!pub.doi && pub.status === 'published') {
      missingDOIs++;
      pubIssues.push('Published paper missing DOI');
    }

    // Check for missing abstract
    if (!pub.abstract) {
      missingAbstracts++;
      pubIssues.push('Missing abstract');
    }

    // Check for missing authors
    if (!pub.authors || pub.authors.length === 0) {
      missingAuthors++;
      pubIssues.push('Missing authors');
    }

    // Check for broken PDF links
    if (pub.links?.pdf?.asset?._ref) {
      const pdfRef = pub.links.pdf.asset._ref;
      if (!pdfRef.includes('sanity')) {
        brokenPDFLinks.push(`${pub.title}: ${pdfRef}`);
        pubIssues.push('Potentially broken PDF reference');
      }
    }

    if (pubIssues.length > 0) {
      issues.push({ title: pub.title, issues: pubIssues });
    }
  }

  return {
    total: publications.length,
    missingDOIs,
    missingAbstracts,
    brokenPDFLinks,
    missingAuthors,
    issues
  };
}

async function auditNews() {
  console.log('📰 Auditing News data...');
  
  const news = await client.fetch(`
    *[_type == "news"] {
      _id,
      title,
      slug,
      excerpt,
      featuredImage,
      status,
      publishedAt
    }
  `);

  const issues: Array<{ title: string; issues: string[] }> = [];
  let missingImages = 0;
  let missingExcerpts = 0;
  let unpublishedArticles = 0;
  const brokenImageLinks: string[] = [];

  for (const article of news) {
    const articleIssues: string[] = [];

    // Check for missing featured image
    if (!article.featuredImage?.asset?._ref) {
      missingImages++;
      articleIssues.push('Missing featured image');
    } else {
      // Check if referenced image exists
      const imageRef = article.featuredImage.asset._ref;
      if (!imageRef.includes('sanity')) {
        brokenImageLinks.push(`${article.title}: ${imageRef}`);
        articleIssues.push('Potentially broken image reference');
      }
    }

    // Check for missing excerpt
    if (!article.excerpt) {
      missingExcerpts++;
      articleIssues.push('Missing excerpt');
    }

    // Check for unpublished articles
    if (article.status !== 'published') {
      unpublishedArticles++;
      articleIssues.push(`Status: ${article.status}`);
    }

    if (articleIssues.length > 0) {
      issues.push({ title: article.title, issues: articleIssues });
    }
  }

  return {
    total: news.length,
    missingImages,
    brokenImageLinks,
    missingExcerpts,
    unpublishedArticles,
    issues
  };
}

async function auditImages() {
  console.log('🖼️ Auditing Image references...');
  
  // Get all image references from Sanity
  const imageRefs = await client.fetch(`
    *[_type in ["person", "publication", "news", "project"]] {
      "avatarRef": avatar.asset._ref,
      "featuredImageRef": featuredImage.asset._ref,
      "pdfRef": links.pdf.asset._ref,
      "galleryRefs": gallery[].asset._ref
    }
  `);

  const referencedImages = new Set<string>();
  const legacyPaths: string[] = [];
  
  imageRefs.forEach((item: any) => {
    [item.avatarRef, item.featuredImageRef, item.pdfRef, ...(item.galleryRefs || [])].forEach((ref: string) => {
      if (ref) {
        referencedImages.add(ref);
        
        // Check for legacy path patterns
        if (ref.includes('/images/') || ref.includes('/assets/') || ref.includes('/files/')) {
          legacyPaths.push(ref);
        }
      }
    });
  });

  // Check public directory for available images
  const publicDir = path.join(process.cwd(), 'public');
  const optimizedVersionsAvailable: string[] = [];
  
  try {
    // Check for optimized image versions (webp, avif)
    const walkDir = (dir: string, fileList: string[] = []): string[] => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkDir(filePath, fileList);
        } else if (file.match(/\.(webp|avif)$/)) {
          fileList.push(filePath.replace(publicDir, ''));
        }
      });
      return fileList;
    };

    const optimizedImages = walkDir(path.join(publicDir, 'images'));
    optimizedVersionsAvailable.push(...optimizedImages);
  } catch (error) {
    console.warn('Could not scan public directory for optimized images');
  }

  return {
    referencedButMissing: [],
    legacyPathsFound: legacyPaths,
    optimizedVersionsAvailable
  };
}

async function generateReport(): Promise<AuditReport> {
  console.log('🔍 Starting comprehensive content audit...\n');

  const [peopleReport, publicationsReport, newsReport, imagesReport] = await Promise.all([
    auditPeople(),
    auditPublications(),
    auditNews(),
    auditImages()
  ]);

  return {
    people: peopleReport,
    publications: publicationsReport,
    news: newsReport,
    images: imagesReport
  };
}

function printReport(report: AuditReport) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONTENT AUDIT REPORT');
  console.log('='.repeat(60));

  // People Summary
  console.log(`\n👥 PEOPLE (${report.people.total} total):`);
  console.log(`   • Missing avatars: ${report.people.missingAvatars}`);
  console.log(`   • Missing bios: ${report.people.missingBios}`);
  console.log(`   • Current members without email: ${report.people.missingEmailsCurrentMembers}`);
  console.log(`   • Broken image links: ${report.people.brokenImageLinks.length}`);

  // Publications Summary
  console.log(`\n📚 PUBLICATIONS (${report.publications.total} total):`);
  console.log(`   • Missing DOIs: ${report.publications.missingDOIs}`);
  console.log(`   • Missing abstracts: ${report.publications.missingAbstracts}`);
  console.log(`   • Missing authors: ${report.publications.missingAuthors}`);
  console.log(`   • Broken PDF links: ${report.publications.brokenPDFLinks.length}`);

  // News Summary
  console.log(`\n📰 NEWS (${report.news.total} total):`);
  console.log(`   • Missing images: ${report.news.missingImages}`);
  console.log(`   • Missing excerpts: ${report.news.missingExcerpts}`);
  console.log(`   • Unpublished articles: ${report.news.unpublishedArticles}`);
  console.log(`   • Broken image links: ${report.news.brokenImageLinks.length}`);

  // Images Summary
  console.log(`\n🖼️ IMAGES:`);
  console.log(`   • Legacy path references: ${report.images.legacyPathsFound.length}`);
  console.log(`   • Optimized versions available: ${report.images.optimizedVersionsAvailable.length}`);

  // Priority Issues
  console.log('\n🚨 HIGH PRIORITY FIXES:');
  const highPriorityCount = 
    report.people.missingEmailsCurrentMembers +
    report.people.brokenImageLinks.length +
    report.publications.brokenPDFLinks.length +
    report.news.brokenImageLinks.length +
    report.images.legacyPathsFound.length;

  if (highPriorityCount > 0) {
    console.log(`   • ${report.people.missingEmailsCurrentMembers} current members need email addresses`);
    console.log(`   • ${report.people.brokenImageLinks.length + report.news.brokenImageLinks.length} broken image references`);
    console.log(`   • ${report.publications.brokenPDFLinks.length} broken PDF references`);
    console.log(`   • ${report.images.legacyPathsFound.length} legacy path references to update`);
  } else {
    console.log('   ✅ No critical issues found!');
  }

  console.log('\n📝 Detailed issues saved to: content-audit-report.json');
}

async function main() {
  try {
    const report = await generateReport();
    
    printReport(report);
    
    // Save detailed report to file
    const reportPath = path.join(process.cwd(), 'content-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n✅ Content audit completed successfully!');
    
    // Return summary for further processing
    return report;
  } catch (error) {
    console.error('❌ Content audit failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as auditContent };