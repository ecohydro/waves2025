#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  redirectLoops: string[];
  stats: {
    totalRedirects: number;
    uniqueSources: number;
    uniqueDestinations: number;
  };
}

class RedirectValidator {
  private redirects: Redirect[] = [];

  async loadRedirects(): Promise<void> {
    try {
      const redirectsPath = path.join(process.cwd(), 'src/lib/redirects.ts');
      const content = await fs.readFile(redirectsPath, 'utf-8');

      // Extract redirects from the TypeScript file
      const redirectMatches = content.matchAll(
        /{\s*source:\s*['"`]([^'"`]+)['"`],\s*destination:\s*['"`]([^'"`]+)['"`],\s*permanent:\s*(true|false)/g,
      );

      for (const match of redirectMatches) {
        this.redirects.push({
          source: match[1],
          destination: match[2],
          permanent: match[3] === 'true',
        });
      }
    } catch (error) {
      throw new Error(`Failed to load redirects: ${error}`);
    }
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const redirectLoops: string[] = [];
    const sources = new Set<string>();
    const destinations = new Set<string>();

    // Check for redirect loops
    for (const redirect of this.redirects) {
      sources.add(redirect.source);
      destinations.add(redirect.destination);

      // Check for direct loops (source === destination)
      if (redirect.source === redirect.destination) {
        redirectLoops.push(`Direct loop: ${redirect.source} → ${redirect.destination}`);
        errors.push(`Direct redirect loop detected: ${redirect.source} → ${redirect.destination}`);
      }

      // Check for potential circular redirects
      const circularRedirects = this.findCircularRedirects(redirect.source);
      if (circularRedirects.length > 0) {
        redirectLoops.push(`Circular redirect: ${circularRedirects.join(' → ')}`);
        errors.push(`Circular redirect detected: ${circularRedirects.join(' → ')}`);
      }
    }

    // Check for duplicate sources
    const duplicateSources = this.findDuplicates(this.redirects.map((r) => r.source));
    if (duplicateSources.length > 0) {
      errors.push(`Duplicate source URLs found: ${duplicateSources.join(', ')}`);
    }

    // Check for redirects to non-existent destinations
    const invalidDestinations = this.redirects.filter(
      (r) => !this.isValidDestination(r.destination),
    );
    if (invalidDestinations.length > 0) {
      warnings.push(
        `Redirects to potentially invalid destinations: ${invalidDestinations.map((r) => `${r.source} → ${r.destination}`).join(', ')}`,
      );
    }

    // Check for redirects that might conflict with Next.js routing
    const conflictingRedirects = this.findConflictingRedirects();
    if (conflictingRedirects.length > 0) {
      warnings.push(`Potential routing conflicts: ${conflictingRedirects.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      redirectLoops,
      stats: {
        totalRedirects: this.redirects.length,
        uniqueSources: sources.size,
        uniqueDestinations: destinations.size,
      },
    };
  }

  private findCircularRedirects(
    startSource: string,
    visited: Set<string> = new Set(),
    path: string[] = [],
  ): string[] {
    if (visited.has(startSource)) {
      const loopStart = path.indexOf(startSource);
      return path.slice(loopStart);
    }

    visited.add(startSource);
    path.push(startSource);

    const redirect = this.redirects.find((r) => r.source === startSource);
    if (!redirect) {
      return [];
    }

    return this.findCircularRedirects(redirect.destination, visited, path);
  }

  private findDuplicates(items: string[]): string[] {
    const counts = new Map<string, number>();
    const duplicates: string[] = [];

    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    for (const [item, count] of counts) {
      if (count > 1) {
        duplicates.push(item);
      }
    }

    return duplicates;
  }

  private isValidDestination(destination: string): boolean {
    // Basic validation - destination should be a valid URL path
    return destination.startsWith('/') && !destination.includes('..');
  }

  private findConflictingRedirects(): string[] {
    const conflicts: string[] = [];

    // Check for redirects that might conflict with Next.js dynamic routes
    for (const redirect of this.redirects) {
      if (redirect.source.includes('[') || redirect.source.includes(']')) {
        conflicts.push(`${redirect.source} (contains dynamic route syntax)`);
      }
    }

    return conflicts;
  }

  async generateReport(): Promise<string> {
    const result = this.validate();

    let report = `# Redirect Validation Report\n\n`;
    report += `Generated on: ${new Date().toISOString()}\n\n`;

    report += `## Summary\n\n`;
    report += `- **Status**: ${result.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
    report += `- **Total Redirects**: ${result.stats.totalRedirects}\n`;
    report += `- **Unique Sources**: ${result.stats.uniqueSources}\n`;
    report += `- **Unique Destinations**: ${result.stats.uniqueDestinations}\n\n`;

    if (result.errors.length > 0) {
      report += `## Errors\n\n`;
      for (const error of result.errors) {
        report += `- ❌ ${error}\n`;
      }
      report += `\n`;
    }

    if (result.warnings.length > 0) {
      report += `## Warnings\n\n`;
      for (const warning of result.warnings) {
        report += `- ⚠️ ${warning}\n`;
      }
      report += `\n`;
    }

    if (result.redirectLoops.length > 0) {
      report += `## Redirect Loops\n\n`;
      for (const loop of result.redirectLoops) {
        report += `- 🔄 ${loop}\n`;
      }
      report += `\n`;
    }

    return report;
  }
}

async function main() {
  console.log('🔍 Starting redirect validation...\n');

  try {
    const validator = new RedirectValidator();
    await validator.loadRedirects();

    const result = validator.validate();
    const report = await validator.generateReport();

    // Save report
    const reportPath = path.join(process.cwd(), 'docs/migration/REDIRECT_VALIDATION_REPORT.md');
    await fs.writeFile(reportPath, report);

    console.log(report);

    if (!result.isValid) {
      console.error('\n❌ Redirect validation failed! Please fix the errors above.');
      process.exit(1);
    } else {
      console.log('\n✅ Redirect validation passed!');
    }
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { RedirectValidator };
