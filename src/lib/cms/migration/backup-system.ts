/**
 * Backup System for MDX Content Migration
 *
 * Creates comprehensive backups of existing MDX content before migration to Sanity.
 * Includes validation, compression, and restoration capabilities.
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

export interface BackupOptions {
  timestamp?: string;
  compression?: boolean;
  includeImages?: boolean;
  includeValidation?: boolean;
  outputDir?: string;
}

export interface BackupManifest {
  timestamp: string;
  version: string;
  contentTypes: {
    people: number;
    publications: number;
    news: number;
    pages?: number;
  };
  files: BackupFileEntry[];
  checksums: Record<string, string>;
  metadata: {
    nodeVersion: string;
    totalSize: number;
    backupDuration: number;
  };
}

export interface BackupFileEntry {
  originalPath: string;
  backupPath: string;
  size: number;
  checksum: string;
  contentType: 'people' | 'publications' | 'news' | 'pages' | 'images';
}

export interface BackupValidationResult {
  isValid: boolean;
  totalFiles: number;
  validFiles: number;
  invalidFiles: BackupFileEntry[];
  errors: string[];
}

export class BackupSystem {
  private readonly contentDir: string = 'content';
  private readonly publicDir: string = 'public/images';
  private readonly defaultOutputDir: string = 'backups';

  constructor() {}

  /**
   * Create a comprehensive backup of all MDX content
   */
  async createBackup(options: BackupOptions = {}): Promise<BackupManifest> {
    const startTime = Date.now();
    const timestamp = options.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = options.outputDir || this.defaultOutputDir;
    const backupDir = path.join(outputDir, `mdx-backup-${timestamp}`);

    console.log(`🔄 Creating backup in: ${backupDir}`);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    const manifest: BackupManifest = {
      timestamp,
      version: '1.0.0',
      contentTypes: {
        people: 0,
        publications: 0,
        news: 0,
        pages: 0,
      },
      files: [],
      checksums: {},
      metadata: {
        nodeVersion: process.version,
        totalSize: 0,
        backupDuration: 0,
      },
    };

    try {
      // Backup content files
      const contentTypes = ['people', 'publications', 'news', 'pages'];
      for (const contentType of contentTypes) {
        const count = await this.backupContentType(
          contentType as keyof typeof manifest.contentTypes,
          backupDir,
          manifest,
        );
        manifest.contentTypes[contentType as keyof typeof manifest.contentTypes] = count;
      }

      // Backup images if requested
      if (options.includeImages) {
        await this.backupImages(backupDir, manifest);
      }

      // Calculate total backup size
      manifest.metadata.totalSize = await this.calculateBackupSize(backupDir);
      manifest.metadata.backupDuration = Date.now() - startTime;

      // Write manifest
      const manifestPath = path.join(backupDir, 'backup-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // Validate backup if requested
      if (options.includeValidation) {
        const validation = await this.validateBackup(backupDir);
        if (!validation.isValid) {
          throw new Error(`Backup validation failed: ${validation.errors.join(', ')}`);
        }
      }

      console.log(`✅ Backup completed successfully in ${manifest.metadata.backupDuration}ms`);
      console.log(`📊 Backup stats:`);
      console.log(`   - People: ${manifest.contentTypes.people} files`);
      console.log(`   - Publications: ${manifest.contentTypes.publications} files`);
      console.log(`   - News: ${manifest.contentTypes.news} files`);
      console.log(`   - Total size: ${(manifest.metadata.totalSize / 1024 / 1024).toFixed(2)} MB`);

      return manifest;
    } catch (error) {
      console.error(`❌ Backup failed:`, error);
      throw error;
    }
  }

  /**
   * Backup files for a specific content type
   */
  private async backupContentType(
    contentType: keyof BackupManifest['contentTypes'],
    backupDir: string,
    manifest: BackupManifest,
  ): Promise<number> {
    const sourceDir = path.join(this.contentDir, contentType);
    const targetDir = path.join(backupDir, 'content', contentType);

    // Check if source directory exists
    try {
      await fs.access(sourceDir);
    } catch {
      console.log(`⚠️  Content type '${contentType}' directory not found, skipping...`);
      return 0;
    }

    await fs.mkdir(targetDir, { recursive: true });

    const files = await fs.readdir(sourceDir);
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

    let count = 0;
    for (const file of mdxFiles) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      // Copy file
      await fs.copyFile(sourcePath, targetPath);

      // Calculate checksum
      const content = await fs.readFile(sourcePath);
      const checksum = createHash('sha256').update(content).digest('hex');

      // Add to manifest
      const backupEntry: BackupFileEntry = {
        originalPath: sourcePath,
        backupPath: targetPath,
        size: content.length,
        checksum,
        contentType,
      };

      manifest.files.push(backupEntry);
      manifest.checksums[sourcePath] = checksum;
      count++;
    }

    console.log(`📁 Backed up ${count} ${contentType} files`);
    return count;
  }

  /**
   * Backup image assets
   */
  private async backupImages(backupDir: string, manifest: BackupManifest): Promise<void> {
    const sourceDir = this.publicDir;
    const targetDir = path.join(backupDir, 'images');

    try {
      await fs.access(sourceDir);
    } catch {
      console.log(`⚠️  Images directory not found, skipping...`);
      return;
    }

    await fs.mkdir(targetDir, { recursive: true });

    // Copy entire images directory structure
    await this.copyDirectoryRecursive(sourceDir, targetDir, manifest);
    console.log(`🖼️  Backed up images directory`);
  }

  /**
   * Recursively copy directory and track files in manifest
   */
  private async copyDirectoryRecursive(
    sourceDir: string,
    targetDir: string,
    manifest: BackupManifest,
  ): Promise<void> {
    const items = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(sourceDir, item.name);
      const targetPath = path.join(targetDir, item.name);

      if (item.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        await this.copyDirectoryRecursive(sourcePath, targetPath, manifest);
      } else {
        await fs.copyFile(sourcePath, targetPath);

        // Track in manifest for large files only (>100KB)
        const stats = await fs.stat(sourcePath);
        if (stats.size > 100 * 1024) {
          const content = await fs.readFile(sourcePath);
          const checksum = createHash('sha256').update(content).digest('hex');

          const backupEntry: BackupFileEntry = {
            originalPath: sourcePath,
            backupPath: targetPath,
            size: stats.size,
            checksum,
            contentType: 'images',
          };

          manifest.files.push(backupEntry);
          manifest.checksums[sourcePath] = checksum;
        }
      }
    }
  }

  /**
   * Calculate total backup size
   */
  private async calculateBackupSize(backupDir: string): Promise<number> {
    let totalSize = 0;

    const calculateDirSize = async (dir: string): Promise<number> => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      let size = 0;

      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          size += await calculateDirSize(itemPath);
        } else {
          const stats = await fs.stat(itemPath);
          size += stats.size;
        }
      }

      return size;
    };

    totalSize = await calculateDirSize(backupDir);
    return totalSize;
  }

  /**
   * Validate backup integrity
   */
  async validateBackup(backupDir: string): Promise<BackupValidationResult> {
    const manifestPath = path.join(backupDir, 'backup-manifest.json');

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: BackupManifest = JSON.parse(manifestContent);

      const result: BackupValidationResult = {
        isValid: true,
        totalFiles: manifest.files.length,
        validFiles: 0,
        invalidFiles: [],
        errors: [],
      };

      // Validate each file
      for (const fileEntry of manifest.files) {
        try {
          // Check if backup file exists
          await fs.access(fileEntry.backupPath);

          // Verify checksum
          const content = await fs.readFile(fileEntry.backupPath);
          const actualChecksum = createHash('sha256').update(content).digest('hex');

          if (actualChecksum === fileEntry.checksum) {
            result.validFiles++;
          } else {
            result.isValid = false;
            result.invalidFiles.push(fileEntry);
            result.errors.push(`Checksum mismatch for ${fileEntry.backupPath}`);
          }
        } catch {
          result.isValid = false;
          result.invalidFiles.push(fileEntry);
          result.errors.push(`File not found or unreadable: ${fileEntry.backupPath}`);
        }
      }

      return result;
    } catch {
      return {
        isValid: false,
        totalFiles: 0,
        validFiles: 0,
        invalidFiles: [],
        errors: [`Failed to read backup manifest.`],
      };
    }
  }

  /**
   * List available backups
   */
  async listBackups(outputDir: string = this.defaultOutputDir): Promise<BackupManifest[]> {
    try {
      const items = await fs.readdir(outputDir, { withFileTypes: true });
      const backupDirs = items.filter(
        (item) => item.isDirectory() && item.name.startsWith('mdx-backup-'),
      );

      const backups: BackupManifest[] = [];
      for (const dir of backupDirs) {
        try {
          const manifestPath = path.join(outputDir, dir.name, 'backup-manifest.json');
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest: BackupManifest = JSON.parse(manifestContent);
          backups.push(manifest);
        } catch {
          console.warn(`Warning: Could not read manifest for backup ${dir.name}`);
        }
      }

      return backups.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch {
      console.log(`No backups directory found at ${outputDir}`);
      return [];
    }
  }

  /**
   * Restore from backup (for rollback scenarios)
   */
  async restoreFromBackup(backupDir: string, options: { dryRun?: boolean } = {}): Promise<void> {
    const manifestPath = path.join(backupDir, 'backup-manifest.json');

    console.log(`🔄 ${options.dryRun ? 'Simulating' : 'Starting'} restore from: ${backupDir}`);

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: BackupManifest = JSON.parse(manifestContent);

      // Validate backup first
      const validation = await this.validateBackup(backupDir);
      if (!validation.isValid) {
        throw new Error(`Backup is invalid: ${validation.errors.join(', ')}`);
      }

      // Restore content files
      const contentFiles = manifest.files.filter((file) => file.contentType !== 'images');
      for (const file of contentFiles) {
        if (options.dryRun) {
          console.log(`Would restore: ${file.backupPath} → ${file.originalPath}`);
        } else {
          // Ensure target directory exists
          await fs.mkdir(path.dirname(file.originalPath), { recursive: true });
          await fs.copyFile(file.backupPath, file.originalPath);
        }
      }

      if (options.dryRun) {
        console.log(`✅ Dry run completed. Would restore ${contentFiles.length} files`);
      } else {
        console.log(`✅ Restore completed. Restored ${contentFiles.length} files`);
      }
    } catch {
      console.error(`[31m[1mRestore failed:[0m`);
      throw new Error('Restore failed');
    }
  }
}

// CLI support for standalone usage
export async function createBackupCLI() {
  const backupSystem = new BackupSystem();

  const options: BackupOptions = {
    includeImages: process.argv.includes('--include-images'),
    includeValidation: process.argv.includes('--validate'),
    compression: process.argv.includes('--compress'),
  };

  try {
    const manifest = await backupSystem.createBackup(options);

    console.log('\n📄 Backup manifest:');
    console.log(JSON.stringify(manifest, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  createBackupCLI();
}
