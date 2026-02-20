// Test setup file for vitest
import '@testing-library/jest-dom/vitest';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Global setup currently only loads environment and jest-dom matchers.
