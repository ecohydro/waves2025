#!/bin/bash

# URL Mapping Generation Script
# Generates comprehensive URL mappings and updates Next.js configuration

set -e  # Exit on any error

echo "🔗 Starting WAVES Lab URL Mapping Generation..."
echo ""

# Create docs/migration directory if it doesn't exist
mkdir -p docs/migration

echo "📊 Step 1: Generating URL mappings from migrated content..."
npx tsx src/lib/migration/generate-url-mappings.ts

echo ""
echo "⚙️  Step 2: Updating Next.js configuration with redirects..."
npx tsx src/lib/migration/update-next-config.ts

echo ""
echo "✅ URL mapping generation completed!"
echo ""
echo "📄 Check the generated files at:"
echo "  - src/lib/redirects.ts (Next.js redirects)"
echo "  - docs/migration/URL_MAPPING_REPORT.md"
echo "  - docs/migration/url-mappings.json"
echo "  - docs/migration/redirects.htaccess (Apache)"
echo "  - docs/migration/redirects.nginx (Nginx)"
echo ""
echo "💡 Restart your development server to apply redirects" 