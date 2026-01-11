import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// API version for Sanity queries
const apiVersion = '2023-12-19';

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
// Prefer viewer token for read operations; fallback to editor/legacy token on server
const token =
  process.env.SANITY_API_VIEWER_TOKEN ||
  process.env.SANITY_API_EDITOR_TOKEN ||
  process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  throw new Error('Missing Sanity project configuration. Please check your environment variables.');
}

// Create the client
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'published',
});

// Create client for preview mode (draft content)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'previewDrafts',
});

// Image URL builder
const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlForImage(source: any) {
  return builder.image(source);
}

// Helper function to get client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Types for our content
export interface Person {
  _id: string;
  _type: 'person';
  name: string;
  slug: { current: string };
  title?: string;
  category?:
    | 'principal-investigator'
    | 'graduate-student'
    | 'postdoc'
    | 'research-staff'
    | 'research-intern'
    | 'high-school-student'
    | 'visitor';
  userGroup: 'current' | 'alumni' | 'collaborator' | 'visitor';
  avatar?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
  };
  email?: string;
  website?: string;
  socialMedia?: {
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
  }>;
  researchInterests?: string[];
  bio?: string;
  bioLong?: string;
  joinDate?: string;
  leaveDate?: string;
  currentPosition?: string;
  isActive: boolean;
}

export interface Publication {
  _id: string;
  _type: 'publication';
  title: string;
  slug: { current: string };
  category?: string;
  researchAreas?: string[];
  publicationType:
    | 'journal-article'
    | 'conference-paper'
    | 'abstract'
    | 'book-chapter'
    | 'preprint'
    | 'thesis'
    | 'report'
    | 'book'
    | 'other';
  authors: Array<{
    person?: Person;
    name?: string;
    affiliation?: string;
    email?: string;
    orcid?: string;
    isCorresponding: boolean;
  }>;
  abstract?: string;
  keywords?: string[];
  venue?: {
    name: string;
    shortName?: string;
    location?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
  publishedDate: string;
  submittedDate?: string;
  acceptedDate?: string;
  doi?: string;
  isbn?: string;
  pmid?: string;
  arxivId?: string;
  links?: {
    publisher?: string;
    preprint?: string;
    pdf?: {
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
    supplementary?: string;
    code?: string;
    dataset?: string;
  };
  metrics?: {
    citations?: number;
    altmetricScore?: number;
    impactFactor?: number;
    quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  };
  status:
    | 'published'
    | 'in-press'
    | 'accepted'
    | 'under-review'
    | 'submitted'
    | 'in-preparation'
    | 'preprint';
  isFeatured: boolean;
  isOpenAccess: boolean;
}

export interface Project {
  _id: string;
  _type: 'project';
  title: string;
  slug: { current: string };
  shortDescription: string;
  description?: string;
  featuredImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
    caption?: string;
  };
  status: 'active' | 'completed' | 'on-hold' | 'planning' | 'cancelled';
  startDate?: string;
  endDate?: string;
  researchAreas?: string[];
  tags?: string[];
  participants?: Array<{
    person?: Person;
    externalName?: string;
    role?: string;
    affiliation?: string;
    isPrimaryInvestigator: boolean;
  }>;
  funding?: {
    agency?: string;
    grantNumber?: string;
    amount?: number;
    duration?: string;
  };
  relatedPublications?: Publication[];
  relatedProjects?: Project[];
  links?: {
    website?: string;
    repository?: string;
    documentation?: string;
    demo?: string;
    dataset?: string;
  };
  gallery?: Array<{
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
    caption?: string;
    credit?: string;
  }>;
  technologies?: string[];
  methods?: string[];
  isFeatured: boolean;
  isPublic: boolean;
}

export interface News {
  _id: string;
  _type: 'news';
  title: string;
  slug: { current: string };
  excerpt: string;
  content: string;
  featuredImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
    caption?: string;
    credit?: string;
  };
  publishedAt: string;
  author: Person;
  coAuthors?: Person[];
  category:
    | 'research'
    | 'publication'
    | 'lab-news'
    | 'conference'
    | 'award'
    | 'outreach'
    | 'collaboration'
    | 'event'
    | 'general';
  tags?: string[];
  relatedPublications?: Publication[];
  relatedProjects?: Project[];
  relatedPeople?: Person[];
  externalLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  gallery?: Array<{
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt: string;
    caption?: string;
    credit?: string;
  }>;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  isFeatured: boolean;
  isSticky: boolean;
  socialMedia?: {
    twitterText?: string;
    linkedinText?: string;
    hashtags?: string[];
  };
}

// GROQ queries
export const queries = {
  // People queries
  getAllPeople: `*[_type == "person" && isActive == true] | order(joinDate desc) {
    _id,
    name,
    slug,
    title,
    category,
    userGroup,
    avatar,
    email,
    website,
    socialMedia,
    researchInterests,
    bio,
    joinDate,
    isActive
  }`,

  getCurrentMembers: `*[_type == "person" && userGroup == "current" && isActive == true] | order(joinDate desc) {
    _id,
    name,
    slug,
    title,
    category,
    userGroup,
    avatar,
    email,
    website,
    socialMedia,
    researchInterests,
    bio,
    joinDate,
    isActive
  }`,

  getAlumni: `*[_type == "person" && userGroup == "alumni" && isActive == true] | order(leaveDate desc) {
    _id,
    name,
    slug,
    title,
    category,
    userGroup,
    avatar,
    email,
    website,
    socialMedia,
    researchInterests,
    bio,
    joinDate,
    leaveDate,
    currentPosition,
    isActive
  }`,

  getPersonBySlug: `*[_type == "person" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    title,
    category,
    userGroup,
    avatar,
    email,
    website,
    socialMedia,
    education,
    researchInterests,
    bio,
    bioLong,
    joinDate,
    leaveDate,
    currentPosition,
    isActive
  }`,

  // Publications queries
  getAllPublications: `*[_type == "publication" && defined(publicationType)] | order(publishedDate desc) {
    _id,
    title,
    slug,
    category,
    researchAreas,
    publicationType,
    authors[] {
      person-> {
        _id,
        name,
        slug
      },
      name,
      affiliation,
      isCorresponding
    },
    abstract,
    keywords,
    venue,
    publishedDate,
    doi,
    links,
    status,
    isFeatured,
    isOpenAccess
  }`,

  getFeaturedPublications: `*[_type == "publication" && isFeatured == true && status == "published"] | order(publishedDate desc) {
    _id,
    title,
    slug,
    category,
    researchAreas,
    publicationType,
    authors[] {
      person-> {
        _id,
        name,
        slug
      },
      name,
      affiliation,
      isCorresponding
    },
    abstract,
    venue,
    publishedDate,
    doi,
    links,
    isFeatured
  }`,

  getPublicationBySlug: `*[_type == "publication" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category,
    researchAreas,
    publicationType,
    authors[] {
      person-> {
        _id,
        name,
        slug,
        socialMedia
      },
      name,
      affiliation,
      email,
      orcid,
      isCorresponding
    },
    abstract,
    keywords,
    venue,
    publishedDate,
    submittedDate,
    acceptedDate,
    doi,
    isbn,
    pmid,
    arxivId,
    links,
    metrics,
    status,
    isFeatured,
    isOpenAccess
  }`,

  // Projects queries
  getAllProjects: `*[_type == "project" && isPublic == true] | order(startDate desc) {
    _id,
    title,
    slug,
    shortDescription,
    featuredImage,
    status,
    startDate,
    endDate,
    researchAreas,
    tags,
    participants[] {
      person-> {
        _id,
        name,
        slug
      },
      externalName,
      role,
      isPrimaryInvestigator
    },
    isFeatured,
    isPublic
  }`,

  getFeaturedProjects: `*[_type == "project" && isFeatured == true && isPublic == true] | order(startDate desc) {
    _id,
    title,
    slug,
    shortDescription,
    featuredImage,
    status,
    startDate,
    endDate,
    researchAreas,
    isFeatured
  }`,

  getProjectBySlug: `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    shortDescription,
    description,
    featuredImage,
    status,
    startDate,
    endDate,
    researchAreas,
    tags,
    participants[] {
      person-> {
        _id,
        name,
        slug,
        title
      },
      externalName,
      role,
      affiliation,
      isPrimaryInvestigator
    },
    funding,
    relatedPublications[]-> {
      _id,
      title,
      slug,
      publicationType,
      publishedDate
    },
    relatedProjects[]-> {
      _id,
      title,
      slug,
      status
    },
    links,
    gallery,
    technologies,
    methods,
    isFeatured,
    isPublic
  }`,

  // News queries
  getAllNews: `*[_type == "news" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    publishedAt,
    author-> {
      _id,
      name,
      slug
    },
    category,
    tags,
    isFeatured,
    isSticky
  }`,

  getFeaturedNews: `*[_type == "news" && isFeatured == true && status == "published"] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    publishedAt,
    author-> {
      _id,
      name,
      slug
    },
    category,
    isFeatured
  }`,

  getNewsBySlug: `*[_type == "news" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    publishedAt,
    author-> {
      _id,
      name,
      slug,
      title,
      avatar
    },
    coAuthors[]-> {
      _id,
      name,
      slug,
      title
    },
    category,
    tags,
    relatedPublications[]-> {
      _id,
      title,
      slug,
      publicationType,
      publishedDate
    },
    relatedProjects[]-> {
      _id,
      title,
      slug,
      status
    },
    relatedPeople[]-> {
      _id,
      name,
      slug,
      title
    },
    externalLinks,
    gallery,
    status,
    isFeatured,
    isSticky,
    socialMedia
  }`,
};

// Helper functions for fetching data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchData<T>(
  query: string,
  params: Record<string, any> = {},
  preview = false,
): Promise<T> {
  const selectedClient = getClient(preview);
  return selectedClient.fetch(query, params);
}

export async function fetchPeople(preview = false): Promise<Person[]> {
  return fetchData<Person[]>(queries.getAllPeople, {}, preview);
}

export async function fetchCurrentMembers(preview = false): Promise<Person[]> {
  return fetchData<Person[]>(queries.getCurrentMembers, {}, preview);
}

export async function fetchAlumni(preview = false): Promise<Person[]> {
  return fetchData<Person[]>(queries.getAlumni, {}, preview);
}

export async function fetchPersonBySlug(slug: string, preview = false): Promise<Person | null> {
  return fetchData<Person | null>(queries.getPersonBySlug, { slug }, preview);
}

export async function fetchPublications(preview = false): Promise<Publication[]> {
  return fetchData<Publication[]>(queries.getAllPublications, {}, preview);
}

export async function fetchFeaturedPublications(preview = false): Promise<Publication[]> {
  return fetchData<Publication[]>(queries.getFeaturedPublications, {}, preview);
}

export async function fetchPublicationBySlug(
  slug: string,
  preview = false,
): Promise<Publication | null> {
  return fetchData<Publication | null>(queries.getPublicationBySlug, { slug }, preview);
}

export async function fetchProjects(preview = false): Promise<Project[]> {
  return fetchData<Project[]>(queries.getAllProjects, {}, preview);
}

export async function fetchFeaturedProjects(preview = false): Promise<Project[]> {
  return fetchData<Project[]>(queries.getFeaturedProjects, {}, preview);
}

export async function fetchProjectBySlug(slug: string, preview = false): Promise<Project | null> {
  return fetchData<Project | null>(queries.getProjectBySlug, { slug }, preview);
}

export async function fetchNews(preview = false): Promise<News[]> {
  return fetchData<News[]>(queries.getAllNews, {}, preview);
}

export async function fetchFeaturedNews(preview = false): Promise<News[]> {
  return fetchData<News[]>(queries.getFeaturedNews, {}, preview);
}

export async function fetchNewsBySlug(slug: string, preview = false): Promise<News | null> {
  return fetchData<News | null>(queries.getNewsBySlug, { slug }, preview);
}
