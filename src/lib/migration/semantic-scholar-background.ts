import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  enhancePublicationWithSemanticScholar,
  SemanticScholarAPI,
} from './semantic-scholar-working';
// import type { EnhancedPublicationData } from './semantic-scholar-working';

interface BackgroundProcessOptions {
  sourceDir: string;
  targetDir: string;
  progressFile: string;
  delayBetweenRequests: number;
  maxRetries: number;
  skipExisting: boolean;
  batchSize: number;
}

interface ProcessState {
  totalFiles: number;
  processedFiles: number;
  enhancedFiles: number;
  failedFiles: number;
  skippedFiles: number;
  currentFile: string;
  startTime: string;
  lastUpdateTime: string;
  errors: Array<{
    file: string;
    error: string;
    timestamp: string;
  }>;
  completedFiles: string[];
}

class SemanticScholarBackgroundProcessor {
  private options: BackgroundProcessOptions;
  private state: ProcessState;
  private api: SemanticScholarAPI;
  private isRunning = false;
  private shouldStop = false;

  constructor(options: Partial<BackgroundProcessOptions> = {}) {
    this.options = {
      sourceDir: options.sourceDir || 'content/publications',
      targetDir: options.targetDir || 'content/publications',
      progressFile: options.progressFile || 'semantic-scholar-progress.json',
      delayBetweenRequests: options.delayBetweenRequests || 6000, // 6 seconds for unauthenticated requests
      maxRetries: options.maxRetries || 3,
      skipExisting: options.skipExisting || true,
      batchSize: options.batchSize || 10,
    };

    this.api = new SemanticScholarAPI();
    this.state = this.loadState();
    this.setupSignalHandlers();
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT (Ctrl+C). Gracefully shutting down...');
      this.shouldStop = true;
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
      this.shouldStop = true;
    });

    // Save progress periodically
    setInterval(() => {
      if (this.isRunning) {
        this.saveState();
      }
    }, 30000); // Save every 30 seconds
  }

  private loadState(): ProcessState {
    const progressPath = this.options.progressFile;

    if (fs.existsSync(progressPath)) {
      try {
        const data = fs.readFileSync(progressPath, 'utf-8');
        const state = JSON.parse(data) as ProcessState;
        console.log(`📊 Resuming from previous session...`);
        console.log(`   Processed: ${state.processedFiles}/${state.totalFiles}`);
        console.log(`   Enhanced: ${state.enhancedFiles}`);
        console.log(`   Failed: ${state.failedFiles}`);
        console.log(`   Skipped: ${state.skippedFiles}`);
        return state;
      } catch (error) {
        console.warn(`⚠️ Could not load progress file: ${error}`);
      }
    }

    return {
      totalFiles: 0,
      processedFiles: 0,
      enhancedFiles: 0,
      failedFiles: 0,
      skippedFiles: 0,
      currentFile: '',
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString(),
      errors: [],
      completedFiles: [],
    };
  }

  private saveState(): void {
    try {
      this.state.lastUpdateTime = new Date().toISOString();
      fs.writeFileSync(this.options.progressFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save progress: ${error}`);
    }
  }

  private getPublicationFiles(): string[] {
    const sourceDir = this.options.sourceDir;

    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory does not exist: ${sourceDir}`);
    }

    const allFiles = fs
      .readdirSync(sourceDir)
      .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
      .map((file) => path.join(sourceDir, file));

    // Filter out already completed files if resuming
    const remainingFiles = allFiles.filter((file) => {
      const relativePath = path.relative(sourceDir, file);
      return !this.state.completedFiles.includes(relativePath);
    });

    return remainingFiles;
  }

  private async processFile(filePath: string): Promise<boolean> {
    const relativePath = path.relative(this.options.sourceDir, filePath);
    this.state.currentFile = relativePath;

    try {
      // Read current file
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontMatter, content: mdxContent } = matter(content);

      // Skip if already has Semantic Scholar data and skipExisting is true
      if (this.options.skipExisting && frontMatter.semanticScholar) {
        console.log(`⏭️  Skipping ${relativePath} (already has Semantic Scholar data)`);
        this.state.skippedFiles++;
        this.state.completedFiles.push(relativePath);
        return true;
      }

      // Validate required fields
      if (!frontMatter.title) {
        console.log(`⚠️  Skipping ${relativePath} (no title)`);
        this.state.skippedFiles++;
        this.state.completedFiles.push(relativePath);
        return true;
      }

      console.log(`🔍 Processing: ${relativePath}`);
      console.log(`   Title: ${frontMatter.title}`);
      if (frontMatter.doi) {
        console.log(`   DOI: ${frontMatter.doi}`);
      }

      // Enhance with Semantic Scholar
      const enhancement = await enhancePublicationWithSemanticScholar(frontMatter, this.api);

      if (enhancement.semanticScholar) {
        // Update frontmatter
        const updatedFrontMatter = {
          ...frontMatter,
          semanticScholar: enhancement.semanticScholar,
        };

        // Write updated file
        const updatedContent = matter.stringify(mdxContent, updatedFrontMatter);
        fs.writeFileSync(filePath, updatedContent);

        console.log(`✅ Enhanced ${relativePath}`);
        console.log(`   Citations: ${enhancement.semanticScholar.citationCount || 'N/A'}`);
        console.log(`   Authors: ${enhancement.semanticScholar.enhancedAuthors?.length || 0}`);

        this.state.enhancedFiles++;
      } else {
        console.log(`ℹ️  No Semantic Scholar data found for ${relativePath}`);
      }

      this.state.completedFiles.push(relativePath);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to process ${relativePath}: ${errorMessage}`);

      this.state.errors.push({
        file: relativePath,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      this.state.failedFiles++;
      this.state.completedFiles.push(relativePath); // Mark as completed to avoid retry loops
      return false;
    }
  }

  private printProgress(): void {
    const { processedFiles, totalFiles, enhancedFiles, failedFiles, skippedFiles } = this.state;
    const percentage = totalFiles > 0 ? ((processedFiles / totalFiles) * 100).toFixed(1) : '0.0';
    const enhancementRate =
      processedFiles > 0 ? ((enhancedFiles / processedFiles) * 100).toFixed(1) : '0.0';

    const startTime = new Date(this.state.startTime);
    const currentTime = new Date();
    const elapsedMs = currentTime.getTime() - startTime.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

    const remainingFiles = totalFiles - processedFiles;
    const avgTimePerFile = processedFiles > 0 ? elapsedMs / processedFiles : 0;
    const estimatedRemainingMs = remainingFiles * avgTimePerFile;
    const estimatedRemainingMinutes = Math.floor(estimatedRemainingMs / 60000);

    console.log('\n📊 Progress Report:');
    console.log(`   Progress: ${processedFiles}/${totalFiles} (${percentage}%)`);
    console.log(`   Enhanced: ${enhancedFiles} (${enhancementRate}% success rate)`);
    console.log(`   Skipped: ${skippedFiles}`);
    console.log(`   Failed: ${failedFiles}`);
    console.log(`   Elapsed: ${elapsedMinutes}m ${elapsedSeconds}s`);
    if (estimatedRemainingMinutes > 0) {
      console.log(`   Estimated remaining: ~${estimatedRemainingMinutes}m`);
    }
    console.log('');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Background processor is already running');
      return;
    }

    console.log('🚀 Starting Semantic Scholar Background Processor');
    console.log(`📁 Source: ${this.options.sourceDir}`);
    console.log(`📁 Target: ${this.options.targetDir}`);
    console.log(`⏱️  Delay: ${this.options.delayBetweenRequests}ms between requests`);
    console.log(`🔄 Skip existing: ${this.options.skipExisting}`);
    console.log('');

    this.isRunning = true;
    this.shouldStop = false;

    try {
      const files = this.getPublicationFiles();

      // Initialize state if starting fresh
      if (this.state.totalFiles === 0) {
        this.state.totalFiles = files.length;
        this.state.startTime = new Date().toISOString();
      }

      console.log(`📚 Found ${files.length} files to process`);

      if (files.length === 0) {
        console.log('✅ All publications have been processed!');
        return;
      }

      let batchCount = 0;
      for (const filePath of files) {
        if (this.shouldStop) {
          console.log('\n🛑 Stopping gracefully...');
          break;
        }

        await this.processFile(filePath);
        this.state.processedFiles++;

        // Print progress every batch
        batchCount++;
        if (batchCount >= this.options.batchSize) {
          this.printProgress();
          this.saveState();
          batchCount = 0;
        }

        // Rate limiting delay
        if (!this.shouldStop) {
          console.log(
            `⏳ Waiting ${this.options.delayBetweenRequests / 1000}s before next request...`,
          );
          await new Promise((resolve) => setTimeout(resolve, this.options.delayBetweenRequests));
        }
      }

      // Final progress report
      this.printProgress();
      this.saveState();

      if (!this.shouldStop) {
        console.log('🎉 Background processing completed!');
        console.log(
          `📊 Final stats: ${this.state.enhancedFiles} enhanced, ${this.state.skippedFiles} skipped, ${this.state.failedFiles} failed`,
        );

        // Clean up progress file if completed successfully
        if (this.state.processedFiles >= this.state.totalFiles) {
          fs.unlinkSync(this.options.progressFile);
          console.log('🧹 Cleaned up progress file');
        }
      }
    } catch (error) {
      console.error(`💥 Background processor failed: ${error}`);
      this.saveState();
    } finally {
      this.isRunning = false;
    }
  }

  stop(): void {
    this.shouldStop = true;
  }

  getStatus(): ProcessState {
    return { ...this.state };
  }
}

// CLI usage
if (require.main === module) {
  const sourceDir = process.argv[2] || 'content/publications';
  const targetDir = process.argv[3] || 'content/publications';

  const options: Partial<BackgroundProcessOptions> = {
    sourceDir,
    targetDir,
  };

  // Parse command line options
  if (process.argv.includes('--delay')) {
    const delayIndex = process.argv.indexOf('--delay');
    const delayValue = parseInt(process.argv[delayIndex + 1]);
    if (!isNaN(delayValue)) {
      options.delayBetweenRequests = delayValue * 1000; // Convert to ms
    }
  }

  if (process.argv.includes('--no-skip-existing')) {
    options.skipExisting = false;
  }

  if (process.argv.includes('--batch-size')) {
    const batchIndex = process.argv.indexOf('--batch-size');
    const batchValue = parseInt(process.argv[batchIndex + 1]);
    if (!isNaN(batchValue)) {
      options.batchSize = batchValue;
    }
  }

  const processor = new SemanticScholarBackgroundProcessor(options);

  console.log('🎯 Semantic Scholar Background Processor');
  console.log('Press Ctrl+C to stop gracefully');
  console.log('Progress will be saved and can be resumed later');
  console.log('');

  processor.start().catch((error) => {
    console.error('Failed to start background processor:', error);
    process.exit(1);
  });
}

export { SemanticScholarBackgroundProcessor };
export type { BackgroundProcessOptions, ProcessState };
