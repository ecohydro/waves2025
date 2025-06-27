#!/bin/bash

# Comprehensive Migration Validation Script
# Runs both migration validation and data integrity checks

set -e  # Exit on any error

echo "🔍 Starting Comprehensive WAVES Lab Migration Validation..."
echo ""

# Create docs/migration directory if it doesn't exist
mkdir -p docs/migration

echo "📊 Step 1: Validating migration completeness and structure..."
npx tsx src/lib/migration/validate-migration.ts

echo ""
echo "🔍 Step 2: Validating data integrity..."
npx tsx src/lib/migration/validate-data-integrity.ts

echo ""
echo "✅ Comprehensive validation completed!"
echo ""
echo "📄 Check all validation reports at:"
echo "  - docs/migration/VALIDATION_REPORT.md"
echo "  - docs/migration/validation-results.json"
echo "  - docs/migration/DATA_INTEGRITY_REPORT.md"
echo "  - docs/migration/data-integrity-results.json" 