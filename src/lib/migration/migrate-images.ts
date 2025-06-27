#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';

interface ImageMigrationConfig {
  sourceDir: string;
  targetDir: string;
  formats: {
    webp: boolean;
    avif: boolean;
    keepOriginal: boolean;
  };
  sizes: {
    thumbnail: number;
    small: number;
    medium: number;
    large: number;
  };
  quality: {
    webp: number;
    avif: number;
    jpeg: number;
    png: number;
  };
}

interface ImageProcessingResult {
  originalPath: string;
  targetPath: string;
  formats: string[];
  sizes: { [key: string]: number };
  originalSize: number;
  optimizedSizes: { [key: string]: number };
  compressionRatio: number;
}

class ImageMigrator {
  private config: ImageMigrationConfig;
  private results: ImageProcessingResult[] = [];
  private errors: { path: string; error: string }[] = [];

  constructor(config: ImageMigrationConfig) {
    this.config = config;
  }

  async migrate(): Promise<void> {
    console.log('🖼️  Starting image migration and optimization...\n');

    try {
      // Ensure target directories exist
      await this.ensureDirectories();

      // Find all images in legacy directory
      const imageFiles = await this.findImages();
      console.log(`Found ${imageFiles.length} images to process\n`);

      // Process images in batches to avoid memory issues
      const batchSize = 5;
      for (let i = 0; i < imageFiles.length; i += batchSize) {
        const batch = imageFiles.slice(i, i + batchSize);
        await Promise.all(batch.map((file) => this.processImage(file)));

        const progress = Math.round(((i + batch.length) / imageFiles.length) * 100);
        console.log(`Progress: ${progress}% (${i + batch.length}/${imageFiles.length})`);
      }

      // Generate report
      await this.generateReport();
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private async ensureDirectories(): Promise<void> {
    const directories = [
      'public/images/people',
      'public/images/publications',
      'public/images/news',
      'public/images/projects',
      'public/images/site',
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async findImages(): Promise<string[]> {
    const patterns = [
      'legacy/assets/images/**/*.{jpg,jpeg,png,gif,webp,svg}',
      'legacy/assets/images/*.{jpg,jpeg,png,gif,webp,svg}',
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { ignore: ['**/.DS_Store'] });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async processImage(imagePath: string): Promise<void> {
    try {
      console.log(`Processing: ${imagePath}`);

      // Determine target directory and filename
      const { targetDir, filename } = this.determineTarget(imagePath);

      // Get original file stats
      const stats = await fs.stat(imagePath);
      const originalSize = stats.size;

      // Process the image
      const result: ImageProcessingResult = {
        originalPath: imagePath,
        targetPath: path.join(targetDir, filename),
        formats: [],
        sizes: {},
        originalSize,
        optimizedSizes: {},
        compressionRatio: 0,
      };

      // Handle SVG files separately (no processing needed)
      if (path.extname(imagePath).toLowerCase() === '.svg') {
        await this.copySvg(imagePath, targetDir, filename);
        result.formats.push('svg');
        result.optimizedSizes['original'] = originalSize;
        result.compressionRatio = 1;
        this.results.push(result);
        return;
      }

      // Load image with Sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }

      // Generate different sizes and formats
      await this.generateImageVariants(image, metadata, targetDir, filename, result);

      this.results.push(result);
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error);
      this.errors.push({
        path: imagePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private determineTarget(imagePath: string): { targetDir: string; filename: string } {
    const relativePath = imagePath.replace('legacy/assets/images/', '');
    const filename = path.basename(imagePath);

    // Determine target directory based on source path
    if (relativePath.startsWith('people/')) {
      return { targetDir: 'public/images/people', filename };
    } else if (relativePath.startsWith('publications/')) {
      return { targetDir: 'public/images/publications', filename };
    } else {
      // General images go to site directory
      return { targetDir: 'public/images/site', filename };
    }
  }

  private async copySvg(sourcePath: string, targetDir: string, filename: string): Promise<void> {
    const targetPath = path.join(targetDir, filename);
    await fs.copyFile(sourcePath, targetPath);
  }

  private async generateImageVariants(
    image: sharp.Sharp,
    metadata: sharp.Metadata,
    targetDir: string,
    originalFilename: string,
    result: ImageProcessingResult,
  ): Promise<void> {
    const baseName = path.parse(originalFilename).name;
    const originalWidth = metadata.width!;
    const originalHeight = metadata.height!;

    // Generate different sizes
    for (const [sizeName, targetWidth] of Object.entries(this.config.sizes)) {
      // Skip if target size is larger than original
      if (targetWidth >= originalWidth) continue;

      const targetHeight = Math.round((originalHeight * targetWidth) / originalWidth);
      result.sizes[sizeName] = targetWidth;

      // Generate WebP format
      if (this.config.formats.webp) {
        const webpPath = path.join(targetDir, `${baseName}-${sizeName}.webp`);
        const webpBuffer = await image
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: this.config.quality.webp })
          .toBuffer();

        await fs.writeFile(webpPath, webpBuffer);
        result.optimizedSizes[`${sizeName}-webp`] = webpBuffer.length;
        if (!result.formats.includes('webp')) result.formats.push('webp');
      }

      // Generate AVIF format
      if (this.config.formats.avif) {
        const avifPath = path.join(targetDir, `${baseName}-${sizeName}.avif`);
        try {
          const avifBuffer = await image
            .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
            .avif({ quality: this.config.quality.avif })
            .toBuffer();

          await fs.writeFile(avifPath, avifBuffer);
          result.optimizedSizes[`${sizeName}-avif`] = avifBuffer.length;
          if (!result.formats.includes('avif')) result.formats.push('avif');
        } catch (error) {
          // AVIF might not be supported, skip silently
          console.warn(`AVIF generation failed for ${originalFilename}: ${error}`);
        }
      }

      // Generate original format (JPEG/PNG)
      if (this.config.formats.keepOriginal) {
        const ext = metadata.format === 'png' ? 'png' : 'jpg';
        const originalPath = path.join(targetDir, `${baseName}-${sizeName}.${ext}`);

        let processedImage = image.resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });

        if (metadata.format === 'png') {
          processedImage = processedImage.png({ quality: this.config.quality.png });
        } else {
          processedImage = processedImage.jpeg({ quality: this.config.quality.jpeg });
        }

        const buffer = await processedImage.toBuffer();
        await fs.writeFile(originalPath, buffer);
        result.optimizedSizes[`${sizeName}-${ext}`] = buffer.length;
        if (!result.formats.includes(ext)) result.formats.push(ext);
      }
    }

    // Always keep one full-size optimized version
    const ext = metadata.format === 'png' ? 'png' : 'jpg';
    const fullSizePath = path.join(targetDir, `${baseName}.${ext}`);

    let fullSizeImage = image.clone();
    if (metadata.format === 'png') {
      fullSizeImage = fullSizeImage.png({ quality: this.config.quality.png });
    } else {
      fullSizeImage = fullSizeImage.jpeg({ quality: this.config.quality.jpeg });
    }

    const fullSizeBuffer = await fullSizeImage.toBuffer();
    await fs.writeFile(fullSizePath, fullSizeBuffer);
    result.optimizedSizes[`original-${ext}`] = fullSizeBuffer.length;
    if (!result.formats.includes(ext)) result.formats.push(ext);

    // Calculate compression ratio
    const totalOptimizedSize = Object.values(result.optimizedSizes).reduce(
      (sum, size) => sum + size,
      0,
    );
    result.compressionRatio = result.originalSize / totalOptimizedSize;
  }

  private async generateReport(): Promise<void> {
    const report = {
      summary: {
        totalImages: this.results.length,
        totalErrors: this.errors.length,
        totalOriginalSize: this.results.reduce((sum, r) => sum + r.originalSize, 0),
        totalOptimizedSize: this.results.reduce(
          (sum, r) => sum + Object.values(r.optimizedSizes).reduce((s, size) => s + size, 0),
          0,
        ),
        averageCompressionRatio:
          this.results.reduce((sum, r) => sum + r.compressionRatio, 0) / this.results.length,
        formatDistribution: this.getFormatDistribution(),
        sizeDistribution: this.getSizeDistribution(),
      },
      results: this.results,
      errors: this.errors,
    };

    // Write detailed report
    await fs.writeFile(
      'docs/migration/IMAGE_MIGRATION_REPORT.md',
      this.generateMarkdownReport(report),
      'utf-8',
    );

    // Write JSON report for programmatic access
    await fs.writeFile(
      'docs/migration/image-migration-results.json',
      JSON.stringify(report, null, 2),
      'utf-8',
    );

    // Console summary
    console.log('\n📊 Image Migration Summary:');
    console.log(`✅ Successfully processed: ${report.summary.totalImages} images`);
    console.log(`❌ Errors: ${report.summary.totalErrors}`);
    console.log(`💾 Original size: ${this.formatBytes(report.summary.totalOriginalSize)}`);
    console.log(`🗜️  Optimized size: ${this.formatBytes(report.summary.totalOptimizedSize)}`);
    console.log(`📉 Average compression: ${report.summary.averageCompressionRatio.toFixed(2)}x`);
    console.log(
      `💾 Space saved: ${this.formatBytes(report.summary.totalOriginalSize - report.summary.totalOptimizedSize)}`,
    );

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach((error) => {
        console.log(`  - ${error.path}: ${error.error}`);
      });
    }

    console.log('\n📄 Detailed reports saved to:');
    console.log('  - docs/migration/IMAGE_MIGRATION_REPORT.md');
    console.log('  - docs/migration/image-migration-results.json');
  }

  private getFormatDistribution(): { [format: string]: number } {
    const distribution: { [format: string]: number } = {};
    this.results.forEach((result) => {
      result.formats.forEach((format) => {
        distribution[format] = (distribution[format] || 0) + 1;
      });
    });
    return distribution;
  }

  private getSizeDistribution(): { [size: string]: number } {
    const distribution: { [size: string]: number } = {};
    this.results.forEach((result) => {
      Object.keys(result.sizes).forEach((size) => {
        distribution[size] = (distribution[size] || 0) + 1;
      });
    });
    return distribution;
  }

  private generateMarkdownReport(report: {
    summary: {
      totalImages: number;
      totalErrors: number;
      totalOriginalSize: number;
      totalOptimizedSize: number;
      averageCompressionRatio: number;
      formatDistribution: { [format: string]: number };
      sizeDistribution: { [size: string]: number };
    };
    results: ImageProcessingResult[];
    errors: { path: string; error: string }[];
  }): string {
    return `# Image Migration Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Images Processed**: ${report.summary.totalImages}
- **Errors**: ${report.summary.totalErrors}
- **Original Total Size**: ${this.formatBytes(report.summary.totalOriginalSize)}
- **Optimized Total Size**: ${this.formatBytes(report.summary.totalOptimizedSize)}
- **Average Compression Ratio**: ${report.summary.averageCompressionRatio.toFixed(2)}x
- **Total Space Saved**: ${this.formatBytes(report.summary.totalOriginalSize - report.summary.totalOptimizedSize)}

## Format Distribution

${Object.entries(report.summary.formatDistribution)
  .map(([format, count]) => `- **${format.toUpperCase()}**: ${count} images`)
  .join('\n')}

## Size Distribution

${Object.entries(report.summary.sizeDistribution)
  .map(([size, count]) => `- **${size}**: ${count} images`)
  .join('\n')}

## Processing Results

${report.results
  .map(
    (result: ImageProcessingResult) => `
### ${path.basename(result.originalPath)}

- **Source**: \`${result.originalPath}\`
- **Target**: \`${result.targetPath}\`
- **Original Size**: ${this.formatBytes(result.originalSize)}
- **Formats Generated**: ${result.formats.join(', ')}
- **Sizes Generated**: ${Object.entries(result.sizes)
      .map(([name, size]) => `${name} (${size}px)`)
      .join(', ')}
- **Compression Ratio**: ${result.compressionRatio.toFixed(2)}x
- **Optimized Sizes**: 
${Object.entries(result.optimizedSizes)
  .map(([variant, size]) => `  - ${variant}: ${this.formatBytes(size)}`)
  .join('\n')}
`,
  )
  .join('\n')}

${
  report.errors.length > 0
    ? `
## Errors

${report.errors
  .map(
    (error: { path: string; error: string }) => `
### ${path.basename(error.path)}

- **Path**: \`${error.path}\`
- **Error**: ${error.error}
`,
  )
  .join('\n')}
`
    : ''
}

## Next Steps

1. Update component imports to use optimized images
2. Implement responsive image components with srcset
3. Add lazy loading for better performance
4. Consider implementing a CDN for image delivery
5. Set up automated image optimization in CI/CD pipeline
`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Default configuration
const defaultConfig: ImageMigrationConfig = {
  sourceDir: 'legacy/assets/images',
  targetDir: 'public/images',
  formats: {
    webp: true,
    avif: true,
    keepOriginal: true,
  },
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
  },
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 90,
  },
};

// CLI execution
async function main() {
  const migrator = new ImageMigrator(defaultConfig);

  try {
    await migrator.migrate();
    console.log('\n✅ Image migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Image migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ImageMigrator, type ImageMigrationConfig, type ImageProcessingResult };
