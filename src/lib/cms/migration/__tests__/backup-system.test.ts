/**
 * Unit tests for BackupSystem
 *
 * Tests backup creation, validation, and restoration functionality
 * following the project's TDD patterns.
 */

import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { BackupSystem, BackupOptions, BackupManifest } from '../backup-system';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('BackupSystem', () => {
  let backupSystem: BackupSystem;
  const mockTimestamp = '2024-12-19T10-00-00-000Z';

  beforeEach(() => {
    backupSystem = new BackupSystem();
    jest.clearAllMocks();

    // Mock Date to return consistent timestamp
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-12-19T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(1703073600000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createBackup', () => {
    it('should create a comprehensive backup with all content types', async () => {
      // Mock file system structure
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockImplementation(async (dir: string) => {
        if (dir.includes('people')) return ['kelly-caylor.mdx', 'jane-doe.mdx'] as any;
        if (dir.includes('publications')) return ['pub1.mdx', 'pub2.mdx', 'pub3.mdx'] as any;
        if (dir.includes('news')) return ['news1.mdx'] as any;
        if (dir.includes('pages')) return [] as any;
        return [] as any;
      });

      mockFs.access.mockImplementation(async (path: string) => {
        if (path.includes('pages')) throw new Error('Not found');
        return undefined;
      });

      mockFs.copyFile.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(Buffer.from('mock content'));
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as any);

      const options: BackupOptions = {
        timestamp: mockTimestamp,
        includeValidation: false, // Skip validation to avoid circular dependency
      };

      const result = await backupSystem.createBackup(options);

      // Verify backup structure
      expect(result.timestamp).toBe(mockTimestamp);
      expect(result.contentTypes.people).toBe(2);
      expect(result.contentTypes.publications).toBe(3);
      expect(result.contentTypes.news).toBe(1);
      expect(result.contentTypes.pages).toBe(0);

      // Verify file operations
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining(`mdx-backup-${mockTimestamp}`),
        { recursive: true },
      );
      expect(mockFs.copyFile).toHaveBeenCalledTimes(6); // 2 + 3 + 1 files
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('backup-manifest.json'),
        expect.any(String),
      );
    });

    it('should handle missing content directories gracefully', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockRejectedValue(new Error('Directory not found'));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await backupSystem.createBackup({
        timestamp: mockTimestamp,
        includeValidation: false,
      });

      expect(result.contentTypes.people).toBe(0);
      expect(result.contentTypes.publications).toBe(0);
      expect(result.contentTypes.news).toBe(0);
      expect(result.files).toHaveLength(0);
    });

    it('should include images when requested', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockImplementation(async (path: string) => {
        if (path.includes('content')) throw new Error('Not found');
        return undefined; // Images directory exists
      });

      mockFs.readdir.mockImplementation(async (dir: string, options?: any) => {
        if (options?.withFileTypes) {
          return [
            { name: 'image1.jpg', isDirectory: () => false },
            { name: 'subfolder', isDirectory: () => true },
          ] as any;
        }
        return ['image1.jpg'] as any;
      });

      mockFs.copyFile.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(Buffer.from('image content'));
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 200 * 1024 } as any); // Large file

      const result = await backupSystem.createBackup({
        timestamp: mockTimestamp,
        includeImages: true,
        includeValidation: false,
      });

      expect(mockFs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('image1.jpg'),
        expect.stringContaining('image1.jpg'),
      );
      expect(result.files.some((f) => f.contentType === 'images')).toBe(true);
    });

    it('should validate backup when requested', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['test.mdx'] as any);
      mockFs.copyFile.mockResolvedValue(undefined);

      const mockContent = Buffer.from('test content');
      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify({
            files: [
              {
                backupPath: 'test-backup-path',
                checksum: createHash('sha256').update(mockContent).digest('hex'),
              },
            ],
          });
        }
        return mockContent;
      });

      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as any);

      const result = await backupSystem.createBackup({
        timestamp: mockTimestamp,
        includeValidation: true,
      });

      expect(result.files).toBeDefined();
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('backup-manifest.json'),
        'utf-8',
      );
    });

    it('should handle backup creation errors', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(backupSystem.createBackup({ timestamp: mockTimestamp })).rejects.toThrow(
        'Permission denied',
      );
    });
  });

  describe('validateBackup', () => {
    it('should validate a good backup successfully', async () => {
      const mockManifest = {
        files: [
          {
            backupPath: '/backup/test.mdx',
            checksum: createHash('sha256').update('test content').digest('hex'),
          },
        ],
      };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify(mockManifest);
        }
        return 'test content';
      });

      mockFs.access.mockResolvedValue(undefined);

      const result = await backupSystem.validateBackup('/backup/dir');

      expect(result.isValid).toBe(true);
      expect(result.validFiles).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect checksum mismatches', async () => {
      const mockManifest = {
        files: [
          {
            backupPath: '/backup/test.mdx',
            checksum: 'wrong-checksum',
          },
        ],
      };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify(mockManifest);
        }
        return 'test content';
      });

      mockFs.access.mockResolvedValue(undefined);

      const result = await backupSystem.validateBackup('/backup/dir');

      expect(result.isValid).toBe(false);
      expect(result.validFiles).toBe(0);
      expect(result.errors).toContain(expect.stringContaining('Checksum mismatch'));
    });

    it('should detect missing backup files', async () => {
      const mockManifest = {
        files: [
          {
            backupPath: '/backup/missing.mdx',
            checksum: 'some-checksum',
          },
        ],
      };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify(mockManifest);
        }
        throw new Error('File not found');
      });

      mockFs.access.mockRejectedValue(new Error('File not found'));

      const result = await backupSystem.validateBackup('/backup/dir');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('File not found'));
    });
  });

  describe('listBackups', () => {
    it('should list available backups sorted by timestamp', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'mdx-backup-2024-12-19T10-00-00-000Z', isDirectory: () => true },
        { name: 'mdx-backup-2024-12-18T10-00-00-000Z', isDirectory: () => true },
        { name: 'other-folder', isDirectory: () => true },
      ] as any);

      const manifest1 = { timestamp: '2024-12-19T10:00:00.000Z' };
      const manifest2 = { timestamp: '2024-12-18T10:00:00.000Z' };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('2024-12-19')) return JSON.stringify(manifest1);
        if (path.includes('2024-12-18')) return JSON.stringify(manifest2);
        throw new Error('Not found');
      });

      const backups = await backupSystem.listBackups('test-dir');

      expect(backups).toHaveLength(2);
      expect(backups[0].timestamp).toBe('2024-12-19T10:00:00.000Z'); // Most recent first
      expect(backups[1].timestamp).toBe('2024-12-18T10:00:00.000Z');
    });

    it('should handle missing backup directory', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      const backups = await backupSystem.listBackups('nonexistent');

      expect(backups).toHaveLength(0);
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore content files from backup', async () => {
      const mockManifest: BackupManifest = {
        timestamp: mockTimestamp,
        version: '1.0.0',
        contentTypes: { people: 1, publications: 1, news: 1 },
        files: [
          {
            originalPath: '/content/people/test.mdx',
            backupPath: '/backup/content/people/test.mdx',
            size: 1024,
            checksum: createHash('sha256').update('test').digest('hex'),
            contentType: 'people',
          },
          {
            originalPath: '/images/test.jpg',
            backupPath: '/backup/images/test.jpg',
            size: 2048,
            checksum: 'image-checksum',
            contentType: 'images',
          },
        ],
        checksums: {},
        metadata: { nodeVersion: 'v18.0.0', totalSize: 3072, backupDuration: 1000 },
      };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify(mockManifest);
        }
        return 'test';
      });

      mockFs.access.mockResolvedValue(undefined);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await backupSystem.restoreFromBackup('/backup/dir');

      // Should only restore content files, not images
      expect(mockFs.copyFile).toHaveBeenCalledTimes(1);
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        '/backup/content/people/test.mdx',
        '/content/people/test.mdx',
      );
    });

    it('should perform dry run without actual file operations', async () => {
      const mockManifest: BackupManifest = {
        timestamp: mockTimestamp,
        version: '1.0.0',
        contentTypes: { people: 1, publications: 0, news: 0 },
        files: [
          {
            originalPath: '/content/people/test.mdx',
            backupPath: '/backup/content/people/test.mdx',
            size: 1024,
            checksum: 'test-checksum',
            contentType: 'people',
          },
        ],
        checksums: {},
        metadata: { nodeVersion: 'v18.0.0', totalSize: 1024, backupDuration: 500 },
      };

      mockFs.readFile.mockImplementation(async (path: string) => {
        if (path.includes('manifest')) {
          return JSON.stringify(mockManifest);
        }
        return 'test';
      });

      mockFs.access.mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await backupSystem.restoreFromBackup('/backup/dir', { dryRun: true });

      expect(mockFs.copyFile).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Would restore'));

      consoleSpy.mockRestore();
    });
  });
});
