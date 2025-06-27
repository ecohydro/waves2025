// Migration Types for Jekyll to Next.js Content Migration

// Jekyll Person Profile Structure
export interface JekyllPersonFrontMatter {
  id?: number;
  title: string;
  role?: string;
  excerpt?: string;
  avatar?: string;
  author?: string;
  'portfolio-item-category'?: string[];
  'portfolio-item-tag'?: string[];
  header?: {
    image?: string;
    caption?: string;
  };
}

// Next.js Person Profile Structure
export interface NextJSPersonFrontMatter {
  title: string;
  role?: string;
  excerpt?: string;
  avatar?: string;
  headerImage?: string;
  headerCaption?: string;
  tags?: string[];
  location?: string;
  email?: string;
  website?: string;
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  cv?: string;
  education?: Education[];
  researchAreas?: string[];
  currentProjects?: string[];
  publications?: string[];
  slug: string;
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  year?: number;
}

// Jekyll Publication Structure
export interface JekyllPublicationFrontMatter {
  author: string;
  date: string;
  id: number;
  year: string;
  title: string;
  doi?: string;
  excerpt?: string;
  header?: {
    teaser?: string;
  };
  'portfolio-item-category'?: string[];
  'portfolio-item-tag'?: string[];
  'author-tags'?: string[];
}

// Next.js Publication Structure
export interface NextJSPublicationFrontMatter {
  title: string;
  authors: Author[];
  publicationDate: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  researchAreas?: string[];
  tags?: string[];
  teaserImage?: string;
  figureImage?: string;
  citationCount?: number;
  altmetricScore?: number;
  slug: string;
}

export interface Author {
  name: string;
  affiliation?: string;
  corresponding?: boolean;
}

// Jekyll Post Structure
export interface JekyllPostFrontMatter {
  id?: number;
  title: string;
  date: string;
  author?: string;
  guid?: string;
  permalink?: string;
  categories?: string[];
  tags?: string[];
  excerpt?: string;
  header?: {
    image?: string;
  };
}

// Next.js News Post Structure
export interface NextJSPostFrontMatter {
  title: string;
  date: string;
  author?: string;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
  headerImage?: string;
  featured?: boolean;
  draft?: boolean;
  slug: string;
}

// Migration Configuration
export interface MigrationConfig {
  sourceDir: string;
  targetDir: string;
  assetsSourceDir: string;
  assetsTargetDir: string;
  dryRun?: boolean;
  verbose?: boolean;
}

// Migration Result
export interface MigrationResult {
  success: boolean;
  filesProcessed: number;
  filesSkipped: number;
  errors: string[];
  warnings: string[];
}

// File Processing Result
export interface FileProcessingResult {
  success: boolean;
  sourceFile: string;
  targetFile?: string;
  error?: string;
  warnings?: string[];
}
