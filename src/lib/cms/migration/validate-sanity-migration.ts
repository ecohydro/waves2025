import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';

// Configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2023-12-19',
  useCdn: false,
});

interface ValidationResult {
  type: 'people' | 'publications' | 'news' | 'relationships' | 'assets';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: {
    expected?: number;
    actual?: number;
    missing?: string[];
    broken?: string[];
    invalid?: string[];
  };
}

export interface MigrationValidationReport {
  timestamp: string;
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  results: ValidationResult[];
  summary: {
    mdxFileCounts: {
      people: number;
      publications: number;
      news: number;
    };
    sanityCounts: {
      people: number;
      publications: number;
      news: number;
    };
    completeness: {
      people: number; // percentage
      publications: number;
      news: number;
    };
    integrityIssues: {
      brokenReferences: number;
      missingAssets: number;
      invalidData: number;
    };
  };
}

/**
 * Count MDX files in content directories
 */
function countMDXFiles(contentDir: string): { people: number; publications: number; news: number } {
  const counts = { people: 0, publications: 0, news: 0 };

  try {
    const peopleDir = path.join(contentDir, 'people');
    const publicationsDir = path.join(contentDir, 'publications');
    const newsDir = path.join(contentDir, 'news');

    if (fs.existsSync(peopleDir)) {
      counts.people = fs.readdirSync(peopleDir).filter(f => f.endsWith('.mdx')).length;
    }

    if (fs.existsSync(publicationsDir)) {
      counts.publications = fs.readdirSync(publicationsDir).filter(f => f.endsWith('.mdx')).length;
    }

    if (fs.existsSync(newsDir)) {
      counts.news = fs.readdirSync(newsDir).filter(f => f.endsWith('.mdx')).length;
    }
  } catch (error) {
    console.warn('Error counting MDX files:', error);
  }

  return counts;
}

/**
 * Count documents in Sanity
 */
async function countSanityDocuments(): Promise<{ people: number; publications: number; news: number }> {
  try {
    const [peopleCount, publicationsCount, newsCount] = await Promise.all([
      client.fetch(`count(*[_type == "person"])`),
      client.fetch(`count(*[_type == "publication"])`),
      client.fetch(`count(*[_type == "news"])`),
    ]);

    return {
      people: peopleCount,
      publications: publicationsCount,
      news: newsCount,
    };
  } catch (error) {
    console.error('Error counting Sanity documents:', error);
    return { people: 0, publications: 0, news: 0 };
  }
}

/**
 * Validate people migration
 */
async function validatePeopleMigration(contentDir: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  try {
    const peopleDir = path.join(contentDir, 'people');
    const mdxFiles = fs.existsSync(peopleDir) 
      ? fs.readdirSync(peopleDir).filter(f => f.endsWith('.mdx'))
      : [];

    // Check if all MDX files have corresponding Sanity documents
    const missingInSanity: string[] = [];
    const invalidData: string[] = [];

    for (const file of mdxFiles) {
      const slug = path.basename(file, '.mdx');
      
      try {
        // Check if document exists in Sanity
        const sanityDoc = await client.fetch(
          `*[_type == "person" && slug.current == $slug][0]`,
          { slug }
        );

        if (!sanityDoc) {
          missingInSanity.push(slug);
          continue;
        }

        // Validate required fields are present
        if (!sanityDoc.name || !sanityDoc.slug?.current) {
          invalidData.push(`${slug}: Missing required fields (name or slug)`);
        }

        // Check user group is valid
        const validGroups = ['current', 'alumni', 'collaborator', 'visitor'];
        if (!validGroups.includes(sanityDoc.userGroup)) {
          invalidData.push(`${slug}: Invalid userGroup "${sanityDoc.userGroup}"`);
        }

        // Validate ORCID format if present
        if (sanityDoc.socialMedia?.orcid) {
          const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
          if (!orcidPattern.test(sanityDoc.socialMedia.orcid)) {
            invalidData.push(`${slug}: Invalid ORCID format`);
          }
        }

      } catch (error) {
        invalidData.push(`${slug}: Error validating document - ${error}`);
      }
    }

    // Add results
    if (missingInSanity.length === 0) {
      results.push({
        type: 'people',
        status: 'success',
        message: `All ${mdxFiles.length} people profiles migrated successfully`,
      });
    } else {
      results.push({
        type: 'people',
        status: 'error',
        message: `${missingInSanity.length} people profiles missing in Sanity`,
        details: { missing: missingInSanity },
      });
    }

    if (invalidData.length > 0) {
      results.push({
        type: 'people',
        status: 'warning',
        message: `${invalidData.length} people profiles have validation issues`,
        details: { invalid: invalidData },
      });
    }

  } catch (error) {
    results.push({
      type: 'people',
      status: 'error',
      message: `Error validating people migration: ${error}`,
    });
  }

  return results;
}

/**
 * Validate publications migration
 */
async function validatePublicationsMigration(contentDir: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  try {
    const publicationsDir = path.join(contentDir, 'publications');
    const mdxFiles = fs.existsSync(publicationsDir) 
      ? fs.readdirSync(publicationsDir).filter(f => f.endsWith('.mdx'))
      : [];

    const missingInSanity: string[] = [];
    const invalidData: string[] = [];
    const brokenAuthorRefs: string[] = [];

    for (const file of mdxFiles) {
      const slug = path.basename(file, '.mdx');
      
      try {
        // Check if document exists in Sanity
        const sanityDoc = await client.fetch(
          `*[_type == "publication" && slug.current == $slug][0]{
            ...,
            authors[]{
              ...,
              person->
            }
          }`,
          { slug }
        );

        if (!sanityDoc) {
          missingInSanity.push(slug);
          continue;
        }

        // Validate required fields
        if (!sanityDoc.title || !sanityDoc.slug?.current || !sanityDoc.publishedDate) {
          invalidData.push(`${slug}: Missing required fields`);
        }

        // Validate publication type
        const validTypes = ['journal-article', 'conference-paper', 'book-chapter', 'preprint', 'thesis', 'report', 'book', 'other'];
        if (!validTypes.includes(sanityDoc.publicationType)) {
          invalidData.push(`${slug}: Invalid publication type "${sanityDoc.publicationType}"`);
        }

        // Validate DOI format if present
        if (sanityDoc.doi) {
          const doiPattern = /^10\.\d{4,}\/\S+$/;
          if (!doiPattern.test(sanityDoc.doi)) {
            invalidData.push(`${slug}: Invalid DOI format`);
          }
        }

        // Check for broken author references
        if (sanityDoc.authors) {
          for (const author of sanityDoc.authors) {
            if (author.person && !author.person._id) {
              brokenAuthorRefs.push(`${slug}: Broken author reference`);
            }
          }
        }

      } catch (error) {
        invalidData.push(`${slug}: Error validating document - ${error}`);
      }
    }

    // Add results
    if (missingInSanity.length === 0) {
      results.push({
        type: 'publications',
        status: 'success',
        message: `All ${mdxFiles.length} publications migrated successfully`,
      });
    } else {
      results.push({
        type: 'publications',
        status: 'error',
        message: `${missingInSanity.length} publications missing in Sanity`,
        details: { missing: missingInSanity },
      });
    }

    if (invalidData.length > 0) {
      results.push({
        type: 'publications',
        status: 'warning',
        message: `${invalidData.length} publications have validation issues`,
        details: { invalid: invalidData },
      });
    }

    if (brokenAuthorRefs.length > 0) {
      results.push({
        type: 'relationships',
        status: 'error',
        message: `${brokenAuthorRefs.length} broken author references found`,
        details: { broken: brokenAuthorRefs },
      });
    }

  } catch (error) {
    results.push({
      type: 'publications',
      status: 'error',
      message: `Error validating publications migration: ${error}`,
    });
  }

  return results;
}

/**
 * Validate news migration
 */
async function validateNewsMigration(contentDir: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  try {
    const newsDir = path.join(contentDir, 'news');
    const mdxFiles = fs.existsSync(newsDir) 
      ? fs.readdirSync(newsDir).filter(f => f.endsWith('.mdx'))
      : [];

    const missingInSanity: string[] = [];
    const invalidData: string[] = [];
    const brokenRefs: string[] = [];

    for (const file of mdxFiles) {
      const slug = path.basename(file, '.mdx');
      
      try {
        // Check if document exists in Sanity
        const sanityDoc = await client.fetch(
          `*[_type == "news" && slug.current == $slug][0]{
            ...,
            author->,
            coAuthors[]->
          }`,
          { slug }
        );

        if (!sanityDoc) {
          missingInSanity.push(slug);
          continue;
        }

        // Validate required fields
        if (!sanityDoc.title || !sanityDoc.slug?.current || !sanityDoc.publishedAt) {
          invalidData.push(`${slug}: Missing required fields`);
        }

        // Validate category
        const validCategories = ['research', 'publication', 'lab-news', 'conference', 'award', 'outreach', 'collaboration', 'event', 'general'];
        if (!validCategories.includes(sanityDoc.category)) {
          invalidData.push(`${slug}: Invalid category "${sanityDoc.category}"`);
        }

        // Check for broken author references
        if (!sanityDoc.author?._id) {
          brokenRefs.push(`${slug}: Broken author reference`);
        }

        if (sanityDoc.coAuthors) {
          for (const coAuthor of sanityDoc.coAuthors) {
            if (!coAuthor._id) {
              brokenRefs.push(`${slug}: Broken co-author reference`);
            }
          }
        }

      } catch (error) {
        invalidData.push(`${slug}: Error validating document - ${error}`);
      }
    }

    // Add results
    if (missingInSanity.length === 0) {
      results.push({
        type: 'news',
        status: 'success',
        message: `All ${mdxFiles.length} news posts migrated successfully`,
      });
    } else {
      results.push({
        type: 'news',
        status: 'error',
        message: `${missingInSanity.length} news posts missing in Sanity`,
        details: { missing: missingInSanity },
      });
    }

    if (invalidData.length > 0) {
      results.push({
        type: 'news',
        status: 'warning',
        message: `${invalidData.length} news posts have validation issues`,
        details: { invalid: invalidData },
      });
    }

    if (brokenRefs.length > 0) {
      results.push({
        type: 'relationships',
        status: 'error',
        message: `${brokenRefs.length} broken references in news posts`,
        details: { broken: brokenRefs },
      });
    }

  } catch (error) {
    results.push({
      type: 'news',
      status: 'error',
      message: `Error validating news migration: ${error}`,
    });
  }

  return results;
}

/**
 * Validate asset integrity
 */
async function validateAssetIntegrity(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  try {
    // Check for missing asset references
    const documentsWithAssets = await client.fetch(`
      *[_type in ["person", "publication", "news"] && defined(avatar) || defined(featuredImage) || defined(links.pdf)]{
        _type,
        _id,
        slug,
        avatar,
        featuredImage,
        "pdfAsset": links.pdf.asset
      }
    `);

    const missingAssets: string[] = [];

    for (const doc of documentsWithAssets) {
      // Check avatar assets
      if (doc.avatar?.asset?._ref) {
        try {
          const asset = await client.fetch(`*[_id == $ref][0]`, { ref: doc.avatar.asset._ref });
          if (!asset) {
            missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Missing avatar asset`);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Error checking avatar asset`);
        }
      }

      // Check featured image assets
      if (doc.featuredImage?.asset?._ref) {
        try {
          const asset = await client.fetch(`*[_id == $ref][0]`, { ref: doc.featuredImage.asset._ref });
          if (!asset) {
            missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Missing featured image asset`);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Error checking featured image asset`);
        }
      }

      // Check PDF assets
      if (doc.pdfAsset?._ref) {
        try {
          const asset = await client.fetch(`*[_id == $ref][0]`, { ref: doc.pdfAsset._ref });
          if (!asset) {
            missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Missing PDF asset`);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          missingAssets.push(`${doc._type}/${doc.slug?.current || doc._id}: Error checking PDF asset`);
        }
      }
    }

    if (missingAssets.length === 0) {
      results.push({
        type: 'assets',
        status: 'success',
        message: `All asset references are valid`,
      });
    } else {
      results.push({
        type: 'assets',
        status: 'error',
        message: `${missingAssets.length} missing asset references found`,
        details: { missing: missingAssets },
      });
    }

  } catch (error) {
    results.push({
      type: 'assets',
      status: 'error',
      message: `Error validating asset integrity: ${error}`,
    });
  }

  return results;
}

/**
 * Validate content relationships
 */
async function validateContentRelationships(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  try {
    // Check publication → person relationships
    const pubRelationships = await client.fetch(`
      *[_type == "publication"]{
        _id,
        slug,
        "authorRefs": authors[defined(person)].person._ref
      }[defined(authorRefs) && count(authorRefs) > 0]
    `);

    const brokenPubRefs: string[] = [];

          for (const pub of pubRelationships) {
        for (const authorRef of pub.authorRefs) {
          try {
            const person = await client.fetch(`*[_id == $ref][0]`, { ref: authorRef });
            if (!person) {
              brokenPubRefs.push(`${pub.slug?.current || pub._id}: Broken author reference ${authorRef}`);
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            brokenPubRefs.push(`${pub.slug?.current || pub._id}: Error checking author reference`);
          }
        }
      }

    // Check news → person/publication relationships  
    const newsRelationships = await client.fetch(`
      *[_type == "news"]{
        _id,
        slug,
        "authorRef": author._ref,
        "coAuthorRefs": coAuthors[]._ref,
        "relatedPubRefs": relatedPublications[]._ref,
        "relatedPersonRefs": relatedPeople[]._ref
      }
    `);

    const brokenNewsRefs: string[] = [];

    for (const news of newsRelationships) {
      // Check main author
      if (news.authorRef) {
        try {
          const author = await client.fetch(`*[_id == $ref][0]`, { ref: news.authorRef });
          if (!author) {
            brokenNewsRefs.push(`${news.slug?.current || news._id}: Broken author reference`);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          brokenNewsRefs.push(`${news.slug?.current || news._id}: Error checking author reference`);
        }
      }

      // Check co-authors
      if (news.coAuthorRefs) {
        for (const coAuthorRef of news.coAuthorRefs) {
          try {
            const coAuthor = await client.fetch(`*[_id == $ref][0]`, { ref: coAuthorRef });
            if (!coAuthor) {
              brokenNewsRefs.push(`${news.slug?.current || news._id}: Broken co-author reference`);
            }
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      } catch (_error) {
              brokenNewsRefs.push(`${news.slug?.current || news._id}: Error checking co-author reference`);
            }
        }
      }

      // Check related publications
      if (news.relatedPubRefs) {
        for (const pubRef of news.relatedPubRefs) {
          try {
            const pub = await client.fetch(`*[_id == $ref][0]`, { ref: pubRef });
            if (!pub) {
              brokenNewsRefs.push(`${news.slug?.current || news._id}: Broken publication reference`);
            }
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      } catch (_error) {
              brokenNewsRefs.push(`${news.slug?.current || news._id}: Error checking publication reference`);
            }
        }
      }
    }

    // Add results
    const totalBrokenRefs = brokenPubRefs.length + brokenNewsRefs.length;

    if (totalBrokenRefs === 0) {
      results.push({
        type: 'relationships',
        status: 'success',
        message: 'All content relationships are valid',
      });
    } else {
      results.push({
        type: 'relationships',
        status: 'error',
        message: `${totalBrokenRefs} broken content relationships found`,
        details: { broken: [...brokenPubRefs, ...brokenNewsRefs] },
      });
    }

  } catch (error) {
    results.push({
      type: 'relationships',
      status: 'error',
      message: `Error validating content relationships: ${error}`,
    });
  }

  return results;
}

/**
 * Generate migration validation report
 */
export async function validateSanityMigration(options: {
  contentDir?: string;
  outputFile?: string;
} = {}): Promise<MigrationValidationReport> {
  const contentDir = options.contentDir || path.join(process.cwd(), 'content');
  
  console.log('🔍 Starting Sanity Migration Validation');
  console.log(`Content directory: ${contentDir}`);
  console.log('');

  // Validate environment
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    throw new Error('Missing required Sanity environment variables');
  }

  const allResults: ValidationResult[] = [];

  // Get file counts
  console.log('📊 Counting source files and Sanity documents...');
  const mdxCounts = countMDXFiles(contentDir);
  const sanityCounts = await countSanityDocuments();

  console.log(`MDX files: ${mdxCounts.people} people, ${mdxCounts.publications} publications, ${mdxCounts.news} news`);
  console.log(`Sanity docs: ${sanityCounts.people} people, ${sanityCounts.publications} publications, ${sanityCounts.news} news`);
  console.log('');

  // Run validations
  console.log('🔍 Validating people migration...');
  const peopleResults = await validatePeopleMigration(contentDir);
  allResults.push(...peopleResults);

  console.log('🔍 Validating publications migration...');
  const publicationResults = await validatePublicationsMigration(contentDir);
  allResults.push(...publicationResults);

  console.log('🔍 Validating news migration...');
  const newsResults = await validateNewsMigration(contentDir);
  allResults.push(...newsResults);

  console.log('🔍 Validating asset integrity...');
  const assetResults = await validateAssetIntegrity();
  allResults.push(...assetResults);

  console.log('🔍 Validating content relationships...');
  const relationshipResults = await validateContentRelationships();
  allResults.push(...relationshipResults);

  // Generate summary
  const passed = allResults.filter(r => r.status === 'success').length;
  const warnings = allResults.filter(r => r.status === 'warning').length;
  const errors = allResults.filter(r => r.status === 'error').length;

  const report: MigrationValidationReport = {
    timestamp: new Date().toISOString(),
    totalChecks: allResults.length,
    passed,
    warnings,
    errors,
    results: allResults,
    summary: {
      mdxFileCounts: mdxCounts,
      sanityCounts,
      completeness: {
        people: mdxCounts.people > 0 ? (sanityCounts.people / mdxCounts.people) * 100 : 100,
        publications: mdxCounts.publications > 0 ? (sanityCounts.publications / mdxCounts.publications) * 100 : 100,
        news: mdxCounts.news > 0 ? (sanityCounts.news / mdxCounts.news) * 100 : 100,
      },
      integrityIssues: {
        brokenReferences: allResults.filter(r => r.type === 'relationships' && r.status === 'error').length,
        missingAssets: allResults.filter(r => r.type === 'assets' && r.status === 'error').length,
        invalidData: allResults.filter(r => r.status === 'warning').length,
      },
    },
  };

  // Save report to file if specified
  if (options.outputFile) {
    fs.writeFileSync(options.outputFile, JSON.stringify(report, null, 2));
    console.log(`📝 Report saved to ${options.outputFile}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SANITY MIGRATION VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(`Total checks: ${report.totalChecks}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('');
  console.log('Migration Completeness:');
  console.log(`  People: ${report.summary.completeness.people.toFixed(1)}% (${sanityCounts.people}/${mdxCounts.people})`);
  console.log(`  Publications: ${report.summary.completeness.publications.toFixed(1)}% (${sanityCounts.publications}/${mdxCounts.publications})`);
  console.log(`  News: ${report.summary.completeness.news.toFixed(1)}% (${sanityCounts.news}/${mdxCounts.news})`);
  console.log('');
  console.log('Integrity Issues:');
  console.log(`  Broken references: ${report.summary.integrityIssues.brokenReferences}`);
  console.log(`  Missing assets: ${report.summary.integrityIssues.missingAssets}`);
  console.log(`  Invalid data: ${report.summary.integrityIssues.invalidData}`);

  // Print detailed results for errors and warnings
  const significantResults = allResults.filter(r => r.status !== 'success');
  if (significantResults.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('DETAILED ISSUES');
    console.log('='.repeat(60));
    
    for (const result of significantResults) {
      const icon = result.status === 'error' ? '❌' : '⚠️';
      console.log(`${icon} ${result.message}`);
      
      if (result.details?.missing?.length) {
        console.log(`   Missing: ${result.details.missing.slice(0, 5).join(', ')}${result.details.missing.length > 5 ? ` (+${result.details.missing.length - 5} more)` : ''}`);
      }
      
      if (result.details?.broken?.length) {
        console.log(`   Broken: ${result.details.broken.slice(0, 5).join(', ')}${result.details.broken.length > 5 ? ` (+${result.details.broken.length - 5} more)` : ''}`);
      }
      
      if (result.details?.invalid?.length) {
        console.log(`   Invalid: ${result.details.invalid.slice(0, 5).join(', ')}${result.details.invalid.length > 5 ? ` (+${result.details.invalid.length - 5} more)` : ''}`);
      }
      
      console.log('');
    }
  }

  return report;
}

// CLI support
if (require.main === module) {
  const outputFile = process.argv.includes('--output')
    ? process.argv[process.argv.indexOf('--output') + 1]
    : path.join(process.cwd(), 'migration-validation-report.json');

  validateSanityMigration({ outputFile })
    .then((report) => {
      console.log('\n✅ Validation completed!');
      
      if (report.errors > 0) {
        console.log('❌ Migration has errors that should be addressed.');
        process.exit(1);
      } else if (report.warnings > 0) {
        console.log('⚠️  Migration has warnings but is functional.');
        process.exit(0);
      } else {
        console.log('🎉 Migration validation passed completely!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}