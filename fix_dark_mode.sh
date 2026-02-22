#!/bin/bash

# Replace hard-coded text colors with dark mode variants
find src -name "*.tsx" -type f -exec sed -i 's/text-gray-900/text-gray-900 dark:text-gray-50/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-gray-600/text-gray-600 dark:text-gray-300/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-gray-500/text-gray-500 dark:text-gray-400/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/text-gray-700/text-gray-700 dark:text-gray-200/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/bg-white/bg-white dark:bg-slate-950/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/bg-gray-50/bg-gray-50 dark:bg-slate-900/g' {} \;

echo "Dark mode fixes applied"
