// Test setup file for vitest
import { beforeAll } from 'vitest';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Set up environment variables for testing
// Note: NODE_ENV is read-only in some environments, so we'll skip setting it

beforeAll(async () => {
  // Global test setup
  console.log('🧪 Setting up test environment...');
  console.log(`📊 Using Sanity project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`📊 Using Sanity dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
});
