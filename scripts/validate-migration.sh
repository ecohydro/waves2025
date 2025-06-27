#!/bin/bash

# Migration Validation Script
# Validates completeness and accuracy of migrated content

set -e  # Exit on any error

echo "🔍 Starting WAVES Lab Migration Validation..."
echo ""

# Create docs/migration directory if it doesn't exist
mkdir -p docs/migration

echo "📦 Compiling TypeScript validation script..."
npx tsx src/lib/migration/validate-migration.ts

echo ""
echo "📄 Check the validation reports at:"
echo "  - docs/migration/VALIDATION_REPORT.md"
echo "  - docs/migration/validation-results.json" 