#!/usr/bin/env node

import fs from 'fs/promises';

class NextConfigUpdater {
  private configPath = 'next.config.ts';

  async updateConfig(): Promise<void> {
    console.log('⚙️  Updating Next.js configuration with redirects...\n');

    try {
      // Check if redirects file exists
      const redirectsPath = 'src/lib/redirects.ts';
      try {
        await fs.access(redirectsPath);
      } catch {
        throw new Error(
          `Redirects file not found: ${redirectsPath}. Run URL mapping generation first.`,
        );
      }

      // Read current config
      const currentConfig = await this.readCurrentConfig();

      // Update config with redirects
      const updatedConfig = this.addRedirectsToConfig(currentConfig);

      // Write updated config
      await fs.writeFile(this.configPath, updatedConfig, 'utf-8');

      console.log('✅ Next.js configuration updated successfully!');
      console.log(`📄 Updated file: ${this.configPath}`);
      console.log('💡 Restart your development server to apply redirects');
    } catch (error) {
      console.error('Failed to update Next.js configuration:', error);
      throw error;
    }
  }

  private async readCurrentConfig(): Promise<string> {
    try {
      return await fs.readFile(this.configPath, 'utf-8');
    } catch {
      // If config doesn't exist, create a basic one
      return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Add other Next.js configuration options here
};

export default nextConfig;
`;
    }
  }

  private addRedirectsToConfig(currentConfig: string): string {
    // Check if redirects are already imported
    const hasRedirectsImport = currentConfig.includes("from './src/lib/redirects'");

    // Check if redirects function already exists
    const hasRedirectsFunction = currentConfig.includes('async redirects()');

    let updatedConfig = currentConfig;

    // Add import if not present
    if (!hasRedirectsImport) {
      // Find the last import statement or add at the top
      const importRegex = /^import.*?;$/g;
      const imports = currentConfig.match(importRegex) || [];

      if (imports.length > 0) {
        // Add after the last import
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = currentConfig.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;

        updatedConfig =
          currentConfig.slice(0, insertIndex) +
          "\nimport { redirects } from './src/lib/redirects';" +
          currentConfig.slice(insertIndex);
      } else {
        // Add at the beginning
        updatedConfig = "import { redirects } from './src/lib/redirects';\n" + currentConfig;
      }
    }

    // Add redirects function if not present
    if (!hasRedirectsFunction) {
      // Find the nextConfig object
      const configObjectRegex = /const nextConfig[^=]*=\s*{([^}]*)}/;
      const match = updatedConfig.match(configObjectRegex);

      if (match) {
        const configContent = match[1];
        const newConfigContent =
          configContent.trim() +
          (configContent.trim() ? ',\n' : '') +
          '  async redirects() {\n    return redirects;\n  },';

        updatedConfig = updatedConfig.replace(
          configObjectRegex,
          `const nextConfig: NextConfig = {\n${newConfigContent}\n}`,
        );
      } else {
        // If we can't find the config object, add a warning comment
        updatedConfig +=
          '\n\n// TODO: Add redirects function to nextConfig object:\n// async redirects() {\n//   return redirects;\n// },\n';
      }
    }

    return updatedConfig;
  }
}

// CLI execution
async function main() {
  const updater = new NextConfigUpdater();

  try {
    await updater.updateConfig();
  } catch (error) {
    console.error('\n❌ Next.js configuration update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { NextConfigUpdater };
