#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface AuditOptions {
  sourceDir: string;
  writeFlags: boolean;
  reportFile: string;
}

interface PublicationIssue {
  file: string;
  title?: string;
  doi?: string;
  issues: string[];
}

interface AuditReport {
  totalFiles: number;
  issuesFound: number;
  missingSemanticScholarBlock: number;
  missingAbstracts: number;
  placeholderAbstracts: number;
  missingKeywords: number;
  report: PublicationIssue[];
  generatedAt: string;
}

function normalizeDoi(doi?: string): string | undefined {
  if (!doi) return undefined;
  return doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
}

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function auditFile(filePath: string): PublicationIssue | null {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data: frontMatter } = matter(raw);

  const issues: string[] = [];

  if (!frontMatter.semanticScholar) {
    issues.push('Missing semanticScholar block');
  }

  const abstract = frontMatter.abstract as string | undefined;
  if (!abstract) {
    issues.push('Missing abstract');
  } else if (abstract.trim().toLowerCase() === 'none') {
    issues.push('Placeholder abstract ("None")');
  }

  const keywords = frontMatter.keywords as string[] | undefined;
  if (!keywords || keywords.length === 0) {
    issues.push('Missing keywords');
  }

  if (issues.length === 0) return null;

  return {
    file: path.basename(filePath),
    title: frontMatter.title as string | undefined,
    doi: normalizeDoi(frontMatter.doi as string | undefined),
    issues,
  };
}

function writeNeedsAttentionFlag(filePath: string, reasons: string[]): void {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown> & {
    needsSemanticScholarUpdate?: boolean;
    semanticScholarIssues?: string[];
  };

  fm.needsSemanticScholarUpdate = true;
  const existing = Array.isArray(fm.semanticScholarIssues) ? fm.semanticScholarIssues : [];
  fm.semanticScholarIssues = Array.from(new Set([...existing, ...reasons]));

  const updated = matter.stringify(parsed.content, fm);
  fs.writeFileSync(filePath, updated);
}

export async function auditSemanticScholar(
  options: Partial<AuditOptions> = {},
): Promise<AuditReport> {
  const sourceDir = options.sourceDir || 'content/publications';
  const writeFlags = options.writeFlags ?? false;
  const reportFile = options.reportFile || 'publication-semantic-audit.json';

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const files = listMdxFiles(sourceDir);
  let missingSS = 0;
  let missingAbstracts = 0;
  let placeholderAbstracts = 0;
  let missingKeywords = 0;

  const reportItems: PublicationIssue[] = [];

  for (const filePath of files) {
    const issue = auditFile(filePath);
    if (!issue) continue;
    reportItems.push(issue);
    if (issue.issues.includes('Missing semanticScholar block')) missingSS++;
    if (issue.issues.includes('Missing abstract')) missingAbstracts++;
    if (issue.issues.includes('Placeholder abstract ("None")')) placeholderAbstracts++;
    if (issue.issues.includes('Missing keywords')) missingKeywords++;
    if (writeFlags) writeNeedsAttentionFlag(filePath, issue.issues);
  }

  const report: AuditReport = {
    totalFiles: files.length,
    issuesFound: reportItems.length,
    missingSemanticScholarBlock: missingSS,
    missingAbstracts,
    placeholderAbstracts,
    missingKeywords,
    report: reportItems,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  // eslint-disable-next-line no-console
  console.log(`\n📊 Audit complete: ${report.issuesFound}/${report.totalFiles} with issues.`);
  // eslint-disable-next-line no-console
  console.log(`   • Missing semanticScholar: ${report.missingSemanticScholarBlock}`);
  // eslint-disable-next-line no-console
  console.log(
    `   • Missing abstracts: ${report.missingAbstracts} (placeholder: ${report.placeholderAbstracts})`,
  );
  // eslint-disable-next-line no-console
  console.log(`   • Missing keywords: ${report.missingKeywords}`);
  // eslint-disable-next-line no-console
  console.log(`   Report saved to: ${reportFile}`);

  return report;
}

if (require.main === module) {
  // Simple argv parsing
  const args = process.argv.slice(2);
  const getFlagValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const sourceDir = getFlagValue('--sourceDir') || 'content/publications';
  const writeFlags = args.includes('--write');
  const reportFile = getFlagValue('--report') || 'publication-semantic-audit.json';

  auditSemanticScholar({ sourceDir, writeFlags, reportFile }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
