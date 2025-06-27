import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import pdf from 'pdf-parse';
import { logProgress, logError } from './utils';

interface AuthorObject {
  name: string;
  affiliation?: string;
  corresponding?: boolean;
}

interface PublicationMetadata {
  slug: string;
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  doi?: string;
  filePath: string;
}

interface PDFMetadata {
  filename: string;
  filePath: string;
  extractedText: string;
  title?: string;
  abstract?: string;
  keywords?: string[];
  authors?: string[];
  doi?: string;
  pages?: number;
}

interface PDFMatch {
  publication: PublicationMetadata;
  pdf: PDFMetadata;
  confidence: number;
  matchReason: string;
}

/**
 * Load all publication metadata from MDX files
 */
function loadPublicationMetadata(): PublicationMetadata[] {
  const pubsDir = path.join(process.cwd(), 'content', 'publications');
  const files = fs.readdirSync(pubsDir).filter((f) => f.endsWith('.mdx'));

  return files.map((filename) => {
    const filePath = path.join(pubsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);

    // Handle authors field which can be array of objects or array of strings
    let authors: string[] = [];
    if (Array.isArray(data.authors)) {
      authors = data.authors
        .map((author: string | AuthorObject) => {
          if (typeof author === 'string') {
            return author;
          } else if (author && typeof author === 'object' && author.name) {
            return author.name;
          }
          return '';
        })
        .filter((name: string) => name.length > 0);
    }

    return {
      slug: filename.replace(/\.mdx$/, ''),
      title: data.title || '',
      authors,
      year: data.year || data.publicationDate?.slice(0, 4) || data.date?.slice(0, 4) || '',
      journal: data.journal || '',
      doi: data.doi || '',
      filePath,
    };
  });
}

/**
 * Extract text and metadata from PDF
 */
async function extractPDFMetadata(pdfPath: string): Promise<PDFMetadata> {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);

    const text = pdfData.text;
    const lines = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    // Extract potential title (usually one of the first few lines, often in caps or bold)
    let title = '';
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (line.length > 20 && line.length < 200 && !line.includes('@') && !line.includes('http')) {
        title = line;
        break;
      }
    }

    // Extract abstract (look for "ABSTRACT" or "Abstract" keywords)
    let abstract = '';
    const abstractIndex = lines.findIndex((line: string) =>
      /^(ABSTRACT|Abstract|abstract)$/i.test(line.trim()),
    );
    if (abstractIndex !== -1) {
      // Get next few lines after "ABSTRACT"
      const abstractLines = [];
      for (let i = abstractIndex + 1; i < Math.min(abstractIndex + 20, lines.length); i++) {
        const line = lines[i];
        if (
          line.toLowerCase().includes('keywords') ||
          line.toLowerCase().includes('introduction')
        ) {
          break;
        }
        if (line.length > 10) {
          abstractLines.push(line);
        }
      }
      abstract = abstractLines.join(' ').slice(0, 1000); // Limit abstract length
    }

    // Extract keywords (look for "Keywords:" or "KEYWORDS:")
    const keywords: string[] = [];
    const keywordIndex = lines.findIndex((line: string) =>
      /^(KEYWORDS|Keywords|keywords)[:;]?/i.test(line.trim()),
    );
    if (keywordIndex !== -1) {
      const keywordLine = lines[keywordIndex];
      const keywordText = keywordLine.replace(/^(KEYWORDS|Keywords|keywords)[:;]?\s*/i, '');
      if (keywordText) {
        keywords.push(
          ...keywordText
            .split(/[,;]/)
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0),
        );
      }
      // Check next line too
      if (keywordIndex + 1 < lines.length) {
        const nextLine = lines[keywordIndex + 1];
        if (nextLine && !nextLine.toLowerCase().includes('introduction')) {
          keywords.push(
            ...nextLine
              .split(/[,;]/)
              .map((k: string) => k.trim())
              .filter((k: string) => k.length > 0),
          );
        }
      }
    }

    // Extract DOI (look for DOI patterns)
    let doi = '';
    const doiMatch = text.match(/(?:DOI|doi)[:;\s]*([0-9]+\.[0-9]+\/[^\s]+)/i);
    if (doiMatch) {
      doi = doiMatch[1];
    }

    return {
      filename: path.basename(pdfPath),
      filePath: pdfPath,
      extractedText: text.slice(0, 5000), // First 5000 chars for matching
      title: title || undefined,
      abstract: abstract || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      doi: doi || undefined,
      pages: pdfData.numpages,
    };
  } catch (error) {
    logError(`Failed to extract PDF metadata from ${pdfPath}: ${error}`);
    return {
      filename: path.basename(pdfPath),
      filePath: pdfPath,
      extractedText: '',
    };
  }
}

/**
 * Match PDFs to publications using various strategies
 */
function matchPDFsToPublications(
  publications: PublicationMetadata[],
  pdfs: PDFMetadata[],
): PDFMatch[] {
  const matches: PDFMatch[] = [];

  for (const pdf of pdfs) {
    let bestMatch: PDFMatch | null = null;

    for (const pub of publications) {
      let confidence = 0;
      const reasons: string[] = [];

      // Strategy 1: Check if filename contains author name and year
      const pubAuthorLastNames = pub.authors
        .map((author) => author.split(' ').pop()?.toLowerCase() || '')
        .filter((name) => name.length > 2);

      const pdfFilename = pdf.filename.toLowerCase();
      const pubYear = pub.year;

      // Check for author name in filename
      for (const lastName of pubAuthorLastNames) {
        if (pdfFilename.includes(lastName)) {
          confidence += 30;
          reasons.push(`author name "${lastName}"`);
          break;
        }
      }

      // Check for year in filename
      if (pubYear && pdfFilename.includes(pubYear)) {
        confidence += 20;
        reasons.push(`year ${pubYear}`);
      }

      // Strategy 2: Check title similarity
      if (pdf.title && pub.title) {
        const pdfTitleWords = pdf.title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const pubTitleWords = pub.title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);

        const commonWords = pdfTitleWords.filter((word) =>
          pubTitleWords.some((pubWord) => pubWord.includes(word) || word.includes(pubWord)),
        );

        if (commonWords.length > 0) {
          const titleSimilarity =
            commonWords.length / Math.max(pdfTitleWords.length, pubTitleWords.length);
          confidence += titleSimilarity * 40;
          reasons.push(`title similarity (${commonWords.length} words)`);
        }
      }

      // Strategy 3: Check DOI match
      if (pdf.doi && pub.doi && pdf.doi === pub.doi) {
        confidence += 50;
        reasons.push('DOI match');
      }

      // Strategy 4: Check if PDF text contains publication title
      if (
        pub.title &&
        pdf.extractedText.toLowerCase().includes(pub.title.toLowerCase().slice(0, 50))
      ) {
        confidence += 25;
        reasons.push('title found in PDF text');
      }

      // Only consider matches with reasonable confidence
      if (confidence > 30 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = {
          publication: pub,
          pdf,
          confidence,
          matchReason: reasons.join(', '),
        };
      }
    }

    if (bestMatch) {
      matches.push(bestMatch);
    }
  }

  return matches;
}

/**
 * Enhance publication frontmatter with PDF metadata
 */
function enhancePublicationWithPDF(match: PDFMatch): void {
  try {
    const { publication, pdf } = match;
    const fileContent = fs.readFileSync(publication.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Add PDF-derived metadata
    const enhanced = { ...data };

    if (pdf.abstract && !enhanced.abstract) {
      enhanced.abstract = pdf.abstract;
    }

    if (pdf.keywords && pdf.keywords.length > 0) {
      enhanced.keywords = pdf.keywords;
    }

    if (pdf.doi && !enhanced.doi) {
      enhanced.doi = pdf.doi;
    }

    if (pdf.pages) {
      enhanced.pages = pdf.pages;
    }

    // Add PDF file reference
    enhanced.pdfFile = `legacy/assets/pdfs/publications/${pdf.filename}`;

    // Add match confidence for debugging
    enhanced.pdfMatchConfidence = match.confidence;
    enhanced.pdfMatchReason = match.matchReason;

    // Write enhanced file
    const enhancedContent = matter.stringify(content, enhanced);
    fs.writeFileSync(publication.filePath, enhancedContent, 'utf8');

    logProgress(
      `✓ Enhanced ${publication.slug} with PDF metadata (confidence: ${match.confidence.toFixed(1)})`,
      true,
    );
  } catch (error) {
    logError(`Failed to enhance ${match.publication.slug}: ${error}`);
  }
}

/**
 * Main function to enhance publications with PDF data
 */
export async function enhancePublicationsWithPDFs(): Promise<void> {
  console.log('🚀 Starting PDF Enhancement for Publications');
  console.log('');

  try {
    // Load publication metadata
    logProgress('Loading publication metadata...', true);
    const publications = loadPublicationMetadata();
    logProgress(`Found ${publications.length} publications`, true);

    // Load PDF files
    const pdfDir = path.join(process.cwd(), 'legacy', 'assets', 'pdfs', 'publications');
    const pdfFiles = fs.readdirSync(pdfDir).filter((f) => f.endsWith('.pdf'));
    logProgress(`Found ${pdfFiles.length} PDF files`, true);

    // Extract metadata from PDFs
    logProgress('Extracting metadata from PDFs...', true);
    const pdfs: PDFMetadata[] = [];
    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      const pdfPath = path.join(pdfDir, pdfFile);
      logProgress(`Processing PDF ${i + 1}/${pdfFiles.length}: ${pdfFile}`, false);

      const pdfMetadata = await extractPDFMetadata(pdfPath);
      pdfs.push(pdfMetadata);
    }

    // Match PDFs to publications
    logProgress('Matching PDFs to publications...', true);
    const matches = matchPDFsToPublications(publications, pdfs);
    logProgress(`Found ${matches.length} potential matches`, true);

    // Show matches for review
    console.log('\n📊 PDF Matches Found:');
    matches.forEach((match) => {
      console.log(`  ${match.publication.slug} ← ${match.pdf.filename}`);
      console.log(`    Confidence: ${match.confidence.toFixed(1)} (${match.matchReason})`);
    });

    // Enhance publications with PDF data
    console.log('\n🔧 Enhancing publications with PDF metadata...');
    for (const match of matches) {
      enhancePublicationWithPDF(match);
    }

    console.log('\n✅ PDF Enhancement Complete!');
    console.log(`📊 Summary:`);
    console.log(`  - ${publications.length} total publications`);
    console.log(`  - ${pdfFiles.length} total PDFs`);
    console.log(`  - ${matches.length} successful matches`);
    console.log(`  - ${((matches.length / publications.length) * 100).toFixed(1)}% match rate`);
  } catch (error) {
    logError(`PDF enhancement failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  enhancePublicationsWithPDFs().catch((error) => {
    console.error('PDF enhancement failed:', error);
    process.exit(1);
  });
}
