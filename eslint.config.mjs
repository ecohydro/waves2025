import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Global ignores
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '.env*',
      '*.log',
      '.DS_Store',
      '*.tgz',
      '.cache/**',
      '.parcel-cache/**',
    ],
  },
  {
    // Override rules for test files
    files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*', '**/tests/**/*'],
    rules: {
      // Disable TypeScript rules that are problematic in tests
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Disable import rules for test files
      'import/no-unresolved': 'off',

      // Allow any types in test files (common for mocking)
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Allow console.log in tests
      'no-console': 'off',

      // Allow empty functions in tests (for mocking)
      '@typescript-eslint/no-empty-function': 'off',

      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Override rules for migration and validation scripts
    files: ['**/migration/**/*', '**/scripts/**/*', '**/*.script.*'],
    rules: {
      // Allow console.log in scripts
      'no-console': 'off',

      // Allow process.exit in CLI scripts
      'no-process-exit': 'off',

      // Allow any types in migration scripts (dealing with legacy data)
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
