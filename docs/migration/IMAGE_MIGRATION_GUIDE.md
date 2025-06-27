# Image Migration Guide

This guide covers the image migration and optimization system for the WAVES Lab website migration from Jekyll to Next.js.

## Overview

The image migration system automatically:

- Copies images from `legacy/assets/images/` to organized directories in `public/images/`
- Optimizes images for web delivery with multiple formats (WebP, AVIF, JPEG/PNG)
- Generates multiple sizes for responsive design
- Provides detailed migration reports

## Directory Structure

### Source (Legacy)

```
legacy/assets/images/
├── people/          # People profile photos
├── publications/    # Publication figures and thumbnails
└── *.{jpg,png,svg}  # General site images
```

### Target (New)

```
public/images/
├── people/          # People profile photos
├── publications/    # Publication figures and thumbnails
├── news/            # News/blog post images
├── projects/        # Project images
└── site/            # General site images (logos, banners, etc.)
```

## Image Processing

### Formats Generated

- **WebP**: Modern format with excellent compression (85% quality)
- **AVIF**: Next-generation format with superior compression (80% quality)
- **JPEG/PNG**: Original formats for compatibility (85%/90% quality)

### Sizes Generated

- **thumbnail**: 150px width
- **small**: 300px width
- **medium**: 600px width
- **large**: 1200px width
- **original**: Full-size optimized version

### Naming Convention

```
filename-size.format
Examples:
- caylor-thumbnail.webp
- caylor-medium.jpg
- caylor.png (original optimized)
```

## Usage

### Quick Start

```bash
# Run the complete migration
./scripts/migrate-images.sh
```

### Advanced Usage

```typescript
import { ImageMigrator } from './src/lib/migration/migrate-images';

const customConfig = {
  sourceDir: 'legacy/assets/images',
  targetDir: 'public/images',
  formats: {
    webp: true,
    avif: false, // Disable AVIF if not supported
    keepOriginal: true,
  },
  sizes: {
    thumbnail: 100,
    small: 400,
    medium: 800,
    large: 1600,
  },
  quality: {
    webp: 90,
    avif: 85,
    jpeg: 90,
    png: 95,
  },
};

const migrator = new ImageMigrator(customConfig);
await migrator.migrate();
```

## Integration with Components

### Basic Image Component

```tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority }: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={`${src}-large.avif`} type="image/avif" media="(min-width: 1024px)" />
      <source srcSet={`${src}-medium.avif`} type="image/avif" media="(min-width: 768px)" />
      <source srcSet={`${src}-small.avif`} type="image/avif" />
      <source srcSet={`${src}-large.webp`} type="image/webp" media="(min-width: 1024px)" />
      <source srcSet={`${src}-medium.webp`} type="image/webp" media="(min-width: 768px)" />
      <source srcSet={`${src}-small.webp`} type="image/webp" />
      <Image
        src={`${src}.jpg`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="object-cover"
      />
    </picture>
  );
}
```

### Person Profile Image

```tsx
import { OptimizedImage } from './OptimizedImage';

interface PersonImageProps {
  slug: string;
  name: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large';
}

export function PersonImage({ slug, name, size = 'medium' }: PersonImageProps) {
  const imagePath = `/images/people/${slug}`;

  return (
    <OptimizedImage
      src={imagePath}
      alt={`Photo of ${name}`}
      width={size === 'thumbnail' ? 150 : size === 'small' ? 300 : size === 'medium' ? 600 : 1200}
      height={size === 'thumbnail' ? 150 : size === 'small' ? 300 : size === 'medium' ? 600 : 1200}
    />
  );
}
```

## Performance Benefits

### File Size Reduction

- **WebP**: ~25-35% smaller than JPEG
- **AVIF**: ~50% smaller than JPEG
- **Responsive sizes**: Serve appropriate size for device

### Loading Performance

- **Lazy loading** with Next.js Image component
- **Priority loading** for above-the-fold images
- **Proper aspect ratios** prevent layout shift

## Migration Reports

After migration, detailed reports are generated:

### Markdown Report (`IMAGE_MIGRATION_REPORT.md`)

- Summary statistics
- Format distribution
- Size distribution
- Individual file processing results
- Error details

### JSON Report (`image-migration-results.json`)

- Machine-readable data
- Integration with build systems
- Programmatic access to results

## Troubleshooting

### Common Issues

#### AVIF Generation Fails

```
AVIF generation failed for filename.jpg: Error: VipsOperation: no such operation avif
```

**Solution**: AVIF support requires libvips with AVIF support. Disable AVIF in config:

```typescript
formats: { webp: true, avif: false, keepOriginal: true }
```

#### Memory Issues with Large Images

```
Error: Input buffer contains unsupported image format
```

**Solution**: Reduce batch size or implement streaming:

```typescript
const batchSize = 3; // Reduce from default 5
```

#### Permission Errors

```
Error: EACCES: permission denied, mkdir 'public/images'
```

**Solution**: Check directory permissions:

```bash
chmod -R 755 public/images
```

### Performance Optimization

#### For Large Image Collections

1. **Increase batch size** for faster processing (if memory allows)
2. **Disable AVIF** if not needed (reduces processing time)
3. **Skip larger sizes** for thumbnails-only use cases
4. **Use streaming** for very large files

#### For CI/CD Integration

1. **Cache processed images** between builds
2. **Only process changed images** using file hashes
3. **Parallel processing** across multiple workers
4. **CDN integration** for delivery optimization

## Next Steps

1. **Implement responsive image components** using the generated variants
2. **Add lazy loading** for better performance
3. **Set up CDN** for optimized delivery
4. **Automate in CI/CD** for continuous optimization
5. **Monitor performance** with Web Vitals

## Configuration Reference

### ImageMigrationConfig

```typescript
interface ImageMigrationConfig {
  sourceDir: string; // Source directory path
  targetDir: string; // Target directory path
  formats: {
    webp: boolean; // Generate WebP variants
    avif: boolean; // Generate AVIF variants
    keepOriginal: boolean; // Keep JPEG/PNG variants
  };
  sizes: {
    thumbnail: number; // Thumbnail width (px)
    small: number; // Small width (px)
    medium: number; // Medium width (px)
    large: number; // Large width (px)
  };
  quality: {
    webp: number; // WebP quality (0-100)
    avif: number; // AVIF quality (0-100)
    jpeg: number; // JPEG quality (0-100)
    png: number; // PNG quality (0-100)
  };
}
```

### Default Configuration

```typescript
const defaultConfig = {
  sourceDir: 'legacy/assets/images',
  targetDir: 'public/images',
  formats: { webp: true, avif: true, keepOriginal: true },
  sizes: { thumbnail: 150, small: 300, medium: 600, large: 1200 },
  quality: { webp: 85, avif: 80, jpeg: 85, png: 90 },
};
```
