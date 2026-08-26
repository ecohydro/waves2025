import type { Metadata } from 'next';

/**
 * Page metadata helpers.
 *
 * Every page that sets its own metadata goes through `buildMetadata`, so a
 * shared link previews the same way whatever it points at: a real title, a
 * description that is not the site-wide boilerplate, a canonical URL, and an
 * image. Values written by hand into a document's `seo` object in the Studio
 * are passed in by the caller and win over anything derived.
 */

export const SITE_NAME = 'WAVES Lab';
export const SITE_TAGLINE = 'Water, Vegetation, and Society';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.waveslab.org').replace(
  /\/+$/,
  '',
);

/** Used when a page has no image of its own. Roughly square, so it pairs with a summary card. */
export const DEFAULT_OG_IMAGE: MetaImage = {
  url: '/waves_logo_high_res.png',
  width: 766,
  height: 684,
  alt: 'WAVES Lab logo',
};

export type MetaImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type BuildMetadataInput = {
  /** Page title, without the site name. The root layout appends that. */
  title: string;
  /** Longer text is fine; it is stripped of markup and trimmed. */
  description: string;
  /** Site-relative path, such as `/news/agu-fall-meeting-2026`. */
  path: string;
  /** Overrides the canonical URL derived from `path`. */
  canonical?: string;
  /** A content image. Omit to fall back to the site logo. */
  image?: MetaImage | null;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  keywords?: string[];
  /** Overrides the description on the Twitter card only. */
  twitterDescription?: string;
  noIndex?: boolean;
};

/** Strip the markdown and HTML that bios, abstracts, and descriptions carry. */
export function plainText(input: string): string {
  return String(input || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`#>]+/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Search engines truncate around 160 characters, so cut on a word boundary. */
export function trimForMeta(text: string, max = 160): string {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max);
  const lastSpace = clipped.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.replace(/[\s,;:.]+$/, '')}…`;
}

/**
 * Drop the site name when a title already carries it.
 *
 * Historic `seo.metaTitle` values in the Studio were generated with
 * " - WAVES Research Lab" baked in. The root layout now appends the site
 * name through a title template, so leaving the stored suffix in place
 * renders it twice ("… - WAVES Research Lab | WAVES Lab").
 */
export function stripBrandSuffix(title: string): string {
  return String(title || '')
    .replace(/\s*[-–—|]\s*WAVES(\s+Research)?\s+Lab\s*$/i, '')
    .trim();
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** A wide image earns a large Twitter card; a square logo does not. */
function isWide(image: MetaImage): boolean {
  return Boolean(image.width && image.height && image.width / image.height >= 1.5);
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const image = input.image || DEFAULT_OG_IMAGE;
  const title = stripBrandSuffix(input.title) || input.title;
  const description = trimForMeta(input.description);
  const url = input.canonical?.trim() || absoluteUrl(input.path);
  const images = [
    {
      url: absoluteUrl(image.url),
      width: image.width,
      height: image.height,
      alt: image.alt || title,
    },
  ];

  const common = {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: 'en_US',
    images,
  };

  const openGraph =
    input.type === 'article'
      ? {
          ...common,
          type: 'article' as const,
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
          authors: input.authors,
          tags: input.tags,
        }
      : input.type === 'profile'
        ? { ...common, type: 'profile' as const }
        : { ...common, type: 'website' as const };

  return {
    title,
    description,
    keywords: input.keywords?.length ? input.keywords : undefined,
    authors: input.authors?.length ? input.authors.map((name) => ({ name })) : undefined,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: isWide(image) ? 'summary_large_image' : 'summary',
      title,
      description: input.twitterDescription?.trim() || description,
      images: [absoluteUrl(image.url)],
    },
    ...(input.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** For a slug that resolves to nothing. Better than a 200 with a generic title. */
export function missingMetadata(what: string): Metadata {
  return {
    title: `${what} not found`,
    description: `This ${what.toLowerCase()} is not available.`,
    robots: { index: false, follow: true },
  };
}
