#!/bin/bash

# Replace dark mode text colors with better contrast
# For dark backgrounds, we need much lighter text
find src -name "*.tsx" -type f -exec sed -i 's/dark:text-gray-50/dark:text-white/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/dark:text-gray-200/dark:text-gray-100/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/dark:text-gray-300/dark:text-gray-200/g' {} \;

echo "Dark mode contrast improved"
