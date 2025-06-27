# Images Directory Structure

This directory contains all optimized images migrated from the legacy Jekyll site.

## Directory Structure

```
public/images/
├── people/           # Profile photos and header images
├── publications/     # Publication figures, teasers, and diagrams
├── news/            # News post header images and illustrations
├── projects/        # Research project images and diagrams
└── site/            # Site-wide images (logos, headers, backgrounds)
```

## Image Optimization

All images are optimized using Next.js Image component with:

- Automatic format conversion (WebP, AVIF)
- Responsive sizing
- Lazy loading
- Proper alt text for accessibility

## Naming Conventions

- **People**: `[lastname].png` or `[lastname]_header.jpg`
- **Publications**: `[author][year]_[id].png` or `[author][year]_[id]_figure.png`
- **News**: Descriptive names like `zoom_lab_photo.jpg`
- **Projects**: Descriptive names related to research areas
- **Site**: Descriptive names like `logo.png`, `hero_background.jpg`

## Migration Process

1. Copy images from `legacy/assets/images/` to appropriate subdirectories
2. Optimize image sizes and formats
3. Update image paths in migrated content
4. Add proper alt text and metadata
5. Generate responsive image variants

## File Types Supported

- **Photos**: JPG, PNG, WebP
- **Graphics**: SVG, PNG
- **Diagrams**: PNG, SVG
- **Icons**: SVG, PNG

## Performance Considerations

- Use appropriate image sizes for different contexts
- Implement lazy loading for images below the fold
- Provide fallback images for older browsers
- Optimize for Core Web Vitals (LCP, CLS)
