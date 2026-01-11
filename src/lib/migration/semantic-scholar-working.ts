import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Prefer .env.local but allow SEMANTIC_SCHOLAR_API_KEY from env
const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

// Rate limiting for unauthenticated requests: 100 requests per 5 minutes (shared pool)
// Using conservative delays to avoid hitting rate limits
const SEARCH_RATE_LIMIT_DELAY = 5000; // 5 seconds for search endpoints
const OTHER_RATE_LIMIT_DELAY = 3000; // 3 seconds for other endpoints

interface SemanticScholarAuthor {
  authorId: string;
  name: string;
  affiliations?: string[];
  homepage?: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
}

interface SemanticScholarPaper {
  paperId: string;
  corpusId?: number;
  url: string;
  title: string;
  externalIds?: {
    DOI?: string;
    PubMed?: string;
    PubMedCentral?: string;
    ArXiv?: string;
    MAG?: string;
    CorpusId?: string;
  };
  abstract?: string;
  venue?: string;
  venueId?: string;
  publicationVenue?: {
    id?: string;
    name?: string;
    type?: string;
    alternate_names?: string[];
    url?: string;
  };
  year?: number;
  referenceCount?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: {
    url: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  s2FieldsOfStudy?: Array<{
    category: string;
    source: string;
  }>;
  publicationTypes?: string[];
  publicationDate?: string;
  journal?: {
    name: string;
    pages?: string;
    volume?: string;
  };
  authors: SemanticScholarAuthor[];
  tldr?: {
    model: string;
    text: string;
  };
}

interface EnhancedPublicationData {
  semanticScholar?: {
    paperId: string;
    url: string;
    doi?: string;
    externalIds?: Record<string, string | number | boolean | null | undefined>;
    abstract?: string;
    citationCount?: number;
    influentialCitationCount?: number;
    referenceCount?: number;
    isOpenAccess?: boolean;
    openAccessPdfUrl?: string;
    fieldsOfStudy?: string[];
    s2FieldsOfStudy?: Array<{ category: string; source: string }>;
    publicationTypes?: string[];
    publicationDate?: string;
    tldr?: string;
    venue?: {
      name: string;
      id?: string;
    };
    enhancedAuthors?: Array<{
      name: string;
      semanticScholarId?: string;
      affiliations?: string[];
      homepage?: string;
      paperCount?: number;
      citationCount?: number;
      hIndex?: number;
    }>;
    lastUpdated: string;
  };
}

class SemanticScholarAPI {
  private lastRequestTime = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async makeRequest(endpoint: string): Promise<any> {
    // Determine rate limit based on endpoint
    const isSearchEndpoint =
      endpoint.includes('/paper/search') ||
      endpoint.includes('/paper/batch') ||
      endpoint.includes('/recommendations');
    const rateLimit = isSearchEndpoint ? SEARCH_RATE_LIMIT_DELAY : OTHER_RATE_LIMIT_DELAY;

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < rateLimit) {
      await new Promise((resolve) => setTimeout(resolve, rateLimit - timeSinceLastRequest));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent':
        process.env.SEMANTIC_SCHOLAR_USER_AGENT || 'waves2025/1.0 (semantic-scholar integration)',
    };

    // Add API key if available
    const disableApiKey = process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY === 'true';
    const canUseApiKey = Boolean(SEMANTIC_SCHOLAR_API_KEY) && !disableApiKey;
    if (canUseApiKey) {
      headers['x-api-key'] = SEMANTIC_SCHOLAR_API_KEY as string;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
    });

    this.lastRequestTime = Date.now();

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit exceeded, waiting 60 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return this.makeRequest(endpoint);
      }
      if (response.status === 403 && headers['x-api-key']) {
        // Retry once without API key if present (some keys may be invalid/inactive)
        console.warn('Received 403 with API key; retrying once without authentication...');
        const headersNoKey = { ...headers };
        delete (headersNoKey as Record<string, string>)['x-api-key'];
        const retry = await fetch(`${BASE_URL}${endpoint}`, { headers: headersNoKey });
        this.lastRequestTime = Date.now();
        if (retry.ok) {
          return retry.json();
        }
        const body = await retry.text();
        throw new Error(
          `Semantic Scholar API error after retry: ${retry.status} ${retry.statusText} - ${body}`,
        );
      }
      if (response.status === 404) {
        // Not found is not an error for our purposes
        return null;
      }
      if (response.status === 400) {
        // Log the bad request for debugging
        const errorText = await response.text();
        console.error(`Bad request to ${endpoint}: ${errorText}`);
        return null;
      }
      throw new Error(`Semantic Scholar API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search authors by name
  async searchAuthorsByName(
    name: string,
    options: { limit?: number; fields?: string } = {},
  ): Promise<Array<{ authorId: string; name: string; hIndex?: number; paperCount?: number }>> {
    try {
      const clean = name.trim();
      if (!clean) return [];
      const params = new URLSearchParams();
      params.set('query', clean);
      if (options.limit) params.set('limit', String(options.limit));
      const fields = options.fields || 'authorId,name,hIndex,paperCount';
      params.set('fields', fields);
      const endpoint = `/author/search?${params.toString()}`;
      const data = await this.makeRequest(endpoint);
      if (!data || !Array.isArray(data.data)) return [];
      // Normalize a subset of fields
      return (data.data as Array<any>).map((a) => ({
        authorId: String(a.authorId),
        name: String(a.name),
        hIndex: typeof a.hIndex === 'number' ? a.hIndex : undefined,
        paperCount: typeof a.paperCount === 'number' ? a.paperCount : undefined,
      }));
    } catch (error) {
      console.error(`Error searching authors by name "${name}":`, error);
      return [];
    }
  }

  async searchByTitle(title: string): Promise<SemanticScholarPaper | null> {
    try {
      // Clean and prepare title for search - be more conservative
      const cleanTitle = title
        .replace(/[^\w\s\-]/g, ' ') // Keep hyphens, replace other special chars
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      // Skip very short or very long titles
      if (cleanTitle.length < 10 || cleanTitle.length > 200) {
        console.log(`  Skipping title search (length: ${cleanTitle.length})`);
        return null;
      }

      // Use a targeted set of fields to reduce request complexity
      const fields = [
        'paperId',
        'url',
        'title',
        'externalIds',
        'abstract',
        'venue',
        'publicationVenue',
        'year',
        'citationCount',
        'influentialCitationCount',
        'isOpenAccess',
        'openAccessPdf',
        'fieldsOfStudy',
        's2FieldsOfStudy',
        'authors',
        'tldr',
        'publicationDate',
        'publicationTypes',
        'journal',
      ].join(',');

      // Use the title match endpoint for a single best match
      const queryParams = new URLSearchParams({
        query: cleanTitle,
        fields: fields,
      });

      const endpoint = `/paper/search/match?${queryParams.toString()}`;
      const data = await this.makeRequest(endpoint);

      if (data && data.data && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    } catch (error) {
      console.error(`Error searching for paper "${title}":`, error);
      return null;
    }
  }

  async searchByDOI(doi: string): Promise<SemanticScholarPaper | null> {
    try {
      // Clean and validate DOI format
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();

      // Basic DOI validation - should match pattern like 10.xxxx/xxxx
      if (!/^10\.\d{4,}\/\S+/.test(cleanDoi)) {
        console.log(`  Invalid DOI format: ${doi}`);
        return null;
      }

      // Use a targeted set of fields to reduce request complexity
      const fields = [
        'paperId',
        'url',
        'title',
        'externalIds',
        'abstract',
        'venue',
        'publicationVenue',
        'year',
        'citationCount',
        'influentialCitationCount',
        'isOpenAccess',
        'openAccessPdf',
        'fieldsOfStudy',
        's2FieldsOfStudy',
        'authors',
        'tldr',
        'publicationDate',
        'publicationTypes',
        'journal',
      ].join(',');

      // Properly encode the DOI for URL
      const encodedDoi = encodeURIComponent(cleanDoi);
      const endpoint = `/paper/DOI:${encodedDoi}?fields=${fields}`;
      const data = await this.makeRequest(endpoint);
      return data;
    } catch (error) {
      console.error(`Error searching for DOI "${doi}":`, error);
      return null;
    }
  }

  // Fetch author by Semantic Scholar author ID
  // Fields example: 'name,url,affiliations,homepage,paperCount,citationCount,hIndex'
  async getAuthorById(authorId: string, fields?: string): Promise<unknown | null> {
    try {
      const encoded = encodeURIComponent(authorId);
      const params = new URLSearchParams();
      if (fields && fields.trim().length > 0) {
        params.set('fields', fields.trim());
      }
      const endpoint = `/author/${encoded}${params.toString() ? `?${params.toString()}` : ''}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error(`Error fetching author "${authorId}":`, error);
      return null;
    }
  }

  // Fetch author's papers with optional pagination
  async getAuthorPapers(
    authorId: string,
    options: {
      fields?: string;
      limit?: number;
      offset?: number;
      publicationDateOrYear?: string;
    } = {},
  ): Promise<unknown | null> {
    try {
      const encoded = encodeURIComponent(authorId);
      const params = new URLSearchParams();
      if (options.fields && options.fields.trim().length > 0) params.set('fields', options.fields);
      if (typeof options.limit === 'number') params.set('limit', String(options.limit));
      if (typeof options.offset === 'number') params.set('offset', String(options.offset));
      if (options.publicationDateOrYear)
        params.set('publicationDateOrYear', options.publicationDateOrYear);
      const qs = params.toString();
      const endpoint = `/author/${encoded}/papers${qs ? `?${qs}` : ''}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error(`Error fetching papers for author "${authorId}":`, error);
      return null;
    }
  }
}

export async function enhancePublicationWithSemanticScholar(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publication: any,
  api: SemanticScholarAPI = new SemanticScholarAPI(),
): Promise<EnhancedPublicationData> {
  console.log(`Enhancing publication: ${publication.title}`);

  let semanticScholarData: SemanticScholarPaper | null = null;

  // First try DOI if available
  if (publication.doi) {
    console.log(`  Searching by DOI: ${publication.doi}`);
    semanticScholarData = await api.searchByDOI(publication.doi);
  }

  // If no DOI result, try title search
  if (!semanticScholarData && publication.title) {
    console.log(`  Searching by title: ${publication.title}`);
    semanticScholarData = await api.searchByTitle(publication.title);
  }

  if (!semanticScholarData) {
    console.log(`  No Semantic Scholar data found for: ${publication.title}`);
    return {};
  }

  console.log(`  Found Semantic Scholar data (ID: ${semanticScholarData.paperId})`);

  // Create enhanced author data (simplified version without additional API calls)
  const enhancedAuthors: Array<{
    name: string;
    semanticScholarId?: string;
    affiliations?: string[];
    homepage?: string;
    paperCount?: number;
    citationCount?: number;
    hIndex?: number;
  }> = [];

  if (semanticScholarData.authors) {
    for (const author of semanticScholarData.authors) {
      enhancedAuthors.push({
        name: author.name,
        semanticScholarId: author.authorId,
        affiliations: author.affiliations,
        homepage: author.homepage,
        paperCount: author.paperCount,
        citationCount: author.citationCount,
        hIndex: author.hIndex,
      });
    }
  }

  const enhancement: EnhancedPublicationData = {
    semanticScholar: {
      paperId: semanticScholarData.paperId,
      url: semanticScholarData.url,
      doi: semanticScholarData.externalIds?.DOI,
      externalIds: semanticScholarData.externalIds,
      abstract: semanticScholarData.abstract,
      citationCount: semanticScholarData.citationCount,
      influentialCitationCount: semanticScholarData.influentialCitationCount,
      referenceCount: semanticScholarData.referenceCount,
      isOpenAccess: semanticScholarData.isOpenAccess,
      openAccessPdfUrl: semanticScholarData.openAccessPdf?.url,
      fieldsOfStudy: semanticScholarData.fieldsOfStudy,
      s2FieldsOfStudy: semanticScholarData.s2FieldsOfStudy,
      publicationTypes: semanticScholarData.publicationTypes,
      publicationDate: semanticScholarData.publicationDate,
      tldr: semanticScholarData.tldr?.text,
      venue: semanticScholarData.venue
        ? {
            name: semanticScholarData.venue,
            id: semanticScholarData.venueId,
          }
        : undefined,
      enhancedAuthors,
      lastUpdated: new Date().toISOString(),
    },
  };

  return enhancement;
}

export { SemanticScholarAPI };
export type { SemanticScholarPaper, SemanticScholarAuthor, EnhancedPublicationData };
