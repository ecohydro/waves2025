#!/bin/bash

# Semantic Scholar Background Processor Starter Script
# This script starts the background processor to enhance publications with Semantic Scholar data

echo "🎯 Starting Semantic Scholar Background Processor"
echo "================================================="
echo ""

# Check if content/publications directory exists
if [ ! -d "content/publications" ]; then
    echo "❌ Error: content/publications directory not found"
    echo "   Please run the publications migration first:"
    echo "   npx tsx src/lib/migration/migrate-publications-semantic.ts legacy/_publications content/publications"
    exit 1
fi

# Count existing publications
PUB_COUNT=$(find content/publications -name "*.mdx" | wc -l)
echo "📚 Found $PUB_COUNT publications to process"

# Check if already enhanced
ENHANCED_COUNT=$(grep -l "semanticScholar:" content/publications/*.mdx 2>/dev/null | wc -l)
echo "✨ $ENHANCED_COUNT publications already have Semantic Scholar data"

REMAINING=$((PUB_COUNT - ENHANCED_COUNT))
echo "🔄 $REMAINING publications need enhancement"
echo ""

if [ $REMAINING -eq 0 ]; then
    echo "✅ All publications are already enhanced!"
    echo "   Use --no-skip-existing to re-process them"
    exit 0
fi

# Estimate time (6 seconds per request + processing time without API key)
ESTIMATED_MINUTES=$((REMAINING * 8 / 60))
echo "⏱️  Estimated time: ~$ESTIMATED_MINUTES minutes"
echo ""

echo "🚀 Starting background processor..."
echo "   Pass --no-skip-existing to re-process already enhanced files"
echo "   Pass --delay <seconds> to change delay between requests"
echo "   Pass --batch-size <n> to change progress print frequency"
echo "   Pass --dry-run to simulate updates without modifying files"
echo "   Pass --no-auth to disable API key usage (unauthenticated requests)"
echo "   Press Ctrl+C to stop gracefully (progress will be saved)"
echo "   You can resume later by running this script again"
echo ""

# Start the background processor
cd "$(dirname "$0")/.." || exit 1
npx tsx src/lib/migration/semantic-scholar-background.ts content/publications "$@"