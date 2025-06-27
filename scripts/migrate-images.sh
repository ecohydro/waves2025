#!/bin/bash

# Image Migration Script
# Migrates and optimizes images from legacy/assets/images to public/images

set -e  # Exit on any error

echo "🖼️  Starting WAVES Lab Image Migration..."
echo ""

# Check if legacy directory exists
if [ ! -d "legacy/assets/images" ]; then
    echo "❌ Legacy images directory not found: legacy/assets/images"
    echo "Please ensure the legacy Jekyll site is available in the legacy/ directory"
    exit 1
fi

# Create docs/migration directory if it doesn't exist
mkdir -p docs/migration

echo "📦 Compiling TypeScript migration script..."
npx tsx src/lib/migration/migrate-images.ts

echo ""
echo "✅ Image migration completed!"
echo ""
echo "📄 Check the migration reports at:"
echo "  - docs/migration/IMAGE_MIGRATION_REPORT.md"
echo "  - docs/migration/image-migration-results.json"
echo ""
echo "📁 Optimized images are now available in:"
echo "  - public/images/people/"
echo "  - public/images/publications/"
echo "  - public/images/site/" 