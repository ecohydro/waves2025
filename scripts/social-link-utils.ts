/**
 * Pure utility functions for social link URL detection, extraction, and normalization.
 * Shared between the fix script, audit script, and tests.
 */

type SocialFieldName =
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'researchGate'
  | 'googleScholar'
  | 'orcid';

const PLATFORM_URL_PATTERNS: Record<string, (slug: string) => string> = {
  linkedin: (slug) => `https://www.linkedin.com/in/${slug}`,
  github: (slug) => `https://github.com/${slug}`,
  twitter: (slug) => `https://twitter.com/${slug}`,
  researchGate: (slug) => `https://www.researchgate.net/profile/${slug}`,
  googleScholar: (slug) => `https://scholar.google.com/citations?user=${slug}`,
};

/**
 * Returns true if the value is a URL with waveslab.org or www.waveslab.org hostname.
 */
export function isWaveslabUrl(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return host === 'waveslab.org' || host === 'www.waveslab.org';
  } catch {
    return false;
  }
}

/**
 * Extracts the profile slug from a waveslab.org URL by stripping known path prefixes
 * (/people/, /members/) and leading/trailing slashes.
 * Returns undefined if the value is not a waveslab.org URL or has no extractable slug.
 */
export function extractSlugFromWaveslabUrl(value: string | undefined | null): string | undefined {
  if (!isWaveslabUrl(value)) return undefined;
  try {
    const url = new URL(value!.trim());
    let pathname = url.pathname;
    // Strip known prefixes
    pathname = pathname.replace(/^\/(people|members)\//, '/');
    // Strip leading and trailing slashes
    pathname = pathname.replace(/^\/+|\/+$/g, '');
    return pathname || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Builds the correct platform URL for a given field name and profile slug.
 * Returns undefined if the field name is unknown or the slug is empty.
 */
export function rebuildPlatformUrl(
  fieldName: string,
  slug: string | undefined | null,
): string | undefined {
  if (!slug || !slug.trim()) return undefined;
  const builder = PLATFORM_URL_PATTERNS[fieldName];
  if (!builder) return undefined;
  return builder(slug.trim());
}

/**
 * If the value is a waveslab.org URL, extracts the slug and rebuilds
 * the correct platform URL for the given field. Returns undefined if
 * the value is not a waveslab.org URL.
 */
export function detectAndFixWaveslabUrl(
  fieldName: string,
  value: string | undefined | null,
): string | undefined {
  if (!isWaveslabUrl(value)) return undefined;
  const slug = extractSlugFromWaveslabUrl(value);
  if (!slug) return undefined;
  return rebuildPlatformUrl(fieldName, slug);
}

/**
 * Valid hostnames for each social media field.
 * Used by the audit script to classify stored values.
 */
export const VALID_HOSTNAMES: Record<string, string[]> = {
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  github: ['github.com'],
  twitter: ['twitter.com', 'x.com'],
  researchGate: ['researchgate.net', 'www.researchgate.net'],
  googleScholar: ['scholar.google.com'],
};

export type LinkClassification =
  | 'correct'
  | 'broken-hostname'
  | 'bare-slug'
  | 'empty'
  | 'manual-review';

/**
 * Classifies a social link value for audit purposes.
 */
export function classifySocialLink(fieldName: string, value: string | undefined | null): LinkClassification {
  if (!value || (typeof value === 'string' && !value.trim())) return 'empty';

  const v = value.trim();

  // ORCID is stored as bare ID
  if (fieldName === 'orcid') {
    if (/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/i.test(v)) return 'correct';
    if (/orcid\.org/i.test(v)) return 'broken-hostname'; // Should be bare ID
    return 'bare-slug';
  }

  // Check if it's a URL
  try {
    const url = new URL(v);
    const host = url.hostname.toLowerCase();

    // Check for waveslab.org
    if (host === 'waveslab.org' || host === 'www.waveslab.org') return 'broken-hostname';

    // Check if hostname matches expected platform
    const validHosts = VALID_HOSTNAMES[fieldName];
    if (validHosts && validHosts.some((h) => host === h || host.endsWith('.' + h))) {
      return 'correct';
    }

    // URL with wrong hostname
    return 'broken-hostname';
  } catch {
    // Not a valid URL — it's a bare slug/handle
    return 'bare-slug';
  }
}
