import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';
const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

export interface AuthorBatchItem {
  authorId: string;
  name?: string;
  url?: string;
  paperCount?: number;
  hIndex?: number;
  // Minimal typing for papers list from batch endpoint
  papers?: Array<{ paperId: string; title?: string | null }>;
}

export interface PaperFields {
  paperId: string;
  url: string;
  title: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  referenceCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: { url?: string } | null;
  fieldsOfStudy?: string[];
  s2FieldsOfStudy?: Array<{ category: string; source: string }>; // if requested
  externalIds?: Record<string, unknown> & { DOI?: string };
  venue?: string;
  publicationDate?: string;
  publicationTypes?: string[];
  authors?: Array<{ authorId: string; name: string }>;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': process.env.SEMANTIC_SCHOLAR_USER_AGENT || 'waves2025/1.0 (utils)',
  };
  const disableApiKey = process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY === 'true';
  if (SEMANTIC_SCHOLAR_API_KEY && !disableApiKey) {
    headers['x-api-key'] = SEMANTIC_SCHOLAR_API_KEY as string;
  }
  return headers;
}

// Retrieve all author information via author/batch for a single authorId
export async function fetchAuthorInfoById(
  authorId: string,
  fields: string = 'name,url,paperCount,hIndex,papers',
): Promise<AuthorBatchItem | null> {
  const params = new URLSearchParams({ fields });
  const endpoint = `${BASE_URL}/author/batch?${params.toString()}`;
  const headers = buildHeaders();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids: [authorId] }),
  });

  if (response.status === 403 && headers['x-api-key']) {
    // Retry once without API key
    const retryHeaders = { ...headers };
    delete (retryHeaders as Record<string, string>)['x-api-key'];
    const retry = await fetch(endpoint, {
      method: 'POST',
      headers: retryHeaders,
      body: JSON.stringify({ ids: [authorId] }),
    });
    if (!retry.ok) return null;
    const arr = (await retry.json()) as AuthorBatchItem[];
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  }

  if (!response.ok) return null;
  const data = (await response.json()) as AuthorBatchItem[];
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// Retrieve a single paper by its Semantic Scholar paperId
export async function fetchPaperById(
  paperId: string,
  fields: string = [
    'paperId',
    'url',
    'title',
    'externalIds',
    'abstract',
    'venue',
    'publicationDate',
    'publicationTypes',
    'year',
    'citationCount',
    'influentialCitationCount',
    'referenceCount',
    'isOpenAccess',
    'openAccessPdf',
    'fieldsOfStudy',
    's2FieldsOfStudy',
    'authors',
  ].join(','),
): Promise<PaperFields | null> {
  const qs = new URLSearchParams({ fields });
  const endpoint = `${BASE_URL}/paper/${encodeURIComponent(paperId)}?${qs.toString()}`;
  const headers = buildHeaders();
  const response = await fetch(endpoint, { headers });

  if (response.status === 403 && headers['x-api-key']) {
    const retryHeaders = { ...headers };
    delete (retryHeaders as Record<string, string>)['x-api-key'];
    const retry = await fetch(endpoint, { headers: retryHeaders });
    if (!retry.ok) return null;
    return (await retry.json()) as PaperFields;
  }

  if (response.status === 404) return null;
  if (!response.ok) return null;
  return (await response.json()) as PaperFields;
}
