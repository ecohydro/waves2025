import { describe, it, expect } from 'vitest';
import {
  isWaveslabUrl,
  extractSlugFromWaveslabUrl,
  rebuildPlatformUrl,
  detectAndFixWaveslabUrl,
  classifySocialLink,
} from '../../scripts/social-link-utils';

describe('isWaveslabUrl', () => {
  it('returns true for waveslab.org URLs', () => {
    expect(isWaveslabUrl('https://waveslab.org/people/jane-doe')).toBe(true);
    expect(isWaveslabUrl('https://www.waveslab.org/people/jane-doe')).toBe(true);
    expect(isWaveslabUrl('http://waveslab.org/people/jane-doe')).toBe(true);
  });

  it('returns false for correct platform URLs', () => {
    expect(isWaveslabUrl('https://www.linkedin.com/in/jane-doe')).toBe(false);
    expect(isWaveslabUrl('https://github.com/janedoe')).toBe(false);
    expect(isWaveslabUrl('https://twitter.com/janedoe')).toBe(false);
    expect(isWaveslabUrl('https://www.researchgate.net/profile/Jane-Doe')).toBe(false);
    expect(isWaveslabUrl('https://scholar.google.com/citations?user=abc123')).toBe(false);
  });

  it('returns false for empty/blank values', () => {
    expect(isWaveslabUrl(undefined)).toBe(false);
    expect(isWaveslabUrl('')).toBe(false);
    expect(isWaveslabUrl('  ')).toBe(false);
  });

  it('returns false for bare slugs (no hostname)', () => {
    expect(isWaveslabUrl('jane-doe')).toBe(false);
    expect(isWaveslabUrl('janedoe')).toBe(false);
  });
});

describe('extractSlugFromWaveslabUrl', () => {
  it('extracts slug from /people/ path', () => {
    expect(extractSlugFromWaveslabUrl('https://waveslab.org/people/jane-doe')).toBe('jane-doe');
    expect(extractSlugFromWaveslabUrl('https://www.waveslab.org/people/john-smith')).toBe(
      'john-smith',
    );
  });

  it('extracts slug from /members/ path', () => {
    expect(extractSlugFromWaveslabUrl('https://waveslab.org/members/jane-doe')).toBe('jane-doe');
  });

  it('extracts slug when no known prefix', () => {
    expect(extractSlugFromWaveslabUrl('https://waveslab.org/jane-doe')).toBe('jane-doe');
  });

  it('strips trailing slashes', () => {
    expect(extractSlugFromWaveslabUrl('https://waveslab.org/people/jane-doe/')).toBe('jane-doe');
  });

  it('returns undefined for empty/non-waveslab URLs', () => {
    expect(extractSlugFromWaveslabUrl(undefined)).toBeUndefined();
    expect(extractSlugFromWaveslabUrl('')).toBeUndefined();
    expect(extractSlugFromWaveslabUrl('https://github.com/janedoe')).toBeUndefined();
  });
});

describe('rebuildPlatformUrl', () => {
  it('builds correct LinkedIn URL', () => {
    expect(rebuildPlatformUrl('linkedin', 'jane-doe')).toBe(
      'https://www.linkedin.com/in/jane-doe',
    );
  });

  it('builds correct GitHub URL', () => {
    expect(rebuildPlatformUrl('github', 'janedoe')).toBe('https://github.com/janedoe');
  });

  it('builds correct Twitter URL', () => {
    expect(rebuildPlatformUrl('twitter', 'janedoe')).toBe('https://twitter.com/janedoe');
  });

  it('builds correct ResearchGate URL', () => {
    expect(rebuildPlatformUrl('researchGate', 'Jane-Doe')).toBe(
      'https://www.researchgate.net/profile/Jane-Doe',
    );
  });

  it('builds correct Google Scholar URL', () => {
    expect(rebuildPlatformUrl('googleScholar', 'VGaoB64AAAAJ')).toBe(
      'https://scholar.google.com/citations?user=VGaoB64AAAAJ',
    );
  });

  it('returns undefined for unknown field name', () => {
    expect(rebuildPlatformUrl('unknown', 'slug')).toBeUndefined();
  });

  it('returns undefined for empty slug', () => {
    expect(rebuildPlatformUrl('linkedin', '')).toBeUndefined();
  });
});

describe('detectAndFixWaveslabUrl', () => {
  it('fixes waveslab.org LinkedIn URL', () => {
    expect(detectAndFixWaveslabUrl('linkedin', 'https://waveslab.org/people/jane-doe')).toBe(
      'https://www.linkedin.com/in/jane-doe',
    );
  });

  it('fixes waveslab.org GitHub URL', () => {
    expect(detectAndFixWaveslabUrl('github', 'https://waveslab.org/people/janedoe')).toBe(
      'https://github.com/janedoe',
    );
  });

  it('fixes waveslab.org Twitter URL', () => {
    expect(detectAndFixWaveslabUrl('twitter', 'https://www.waveslab.org/people/janedoe')).toBe(
      'https://twitter.com/janedoe',
    );
  });

  it('fixes waveslab.org ResearchGate URL', () => {
    expect(
      detectAndFixWaveslabUrl('researchGate', 'https://waveslab.org/people/Jane-Doe'),
    ).toBe('https://www.researchgate.net/profile/Jane-Doe');
  });

  it('fixes waveslab.org Google Scholar URL', () => {
    expect(
      detectAndFixWaveslabUrl('googleScholar', 'https://waveslab.org/people/VGaoB64AAAAJ'),
    ).toBe('https://scholar.google.com/citations?user=VGaoB64AAAAJ');
  });

  it('returns undefined for already-correct URLs', () => {
    expect(
      detectAndFixWaveslabUrl('linkedin', 'https://www.linkedin.com/in/jane-doe'),
    ).toBeUndefined();
    expect(detectAndFixWaveslabUrl('github', 'https://github.com/janedoe')).toBeUndefined();
  });

  it('returns undefined for empty values', () => {
    expect(detectAndFixWaveslabUrl('linkedin', undefined)).toBeUndefined();
    expect(detectAndFixWaveslabUrl('linkedin', '')).toBeUndefined();
  });

  it('returns undefined for bare slugs (not waveslab URLs)', () => {
    expect(detectAndFixWaveslabUrl('github', 'janedoe')).toBeUndefined();
  });
});

describe('classifySocialLink', () => {
  it('classifies correct platform URLs as correct', () => {
    expect(classifySocialLink('linkedin', 'https://www.linkedin.com/in/jane-doe')).toBe('correct');
    expect(classifySocialLink('github', 'https://github.com/janedoe')).toBe('correct');
    expect(classifySocialLink('twitter', 'https://twitter.com/janedoe')).toBe('correct');
    expect(classifySocialLink('twitter', 'https://x.com/janedoe')).toBe('correct');
    expect(classifySocialLink('researchGate', 'https://www.researchgate.net/profile/Jane')).toBe('correct');
    expect(classifySocialLink('googleScholar', 'https://scholar.google.com/citations?user=abc')).toBe('correct');
  });

  it('classifies waveslab.org URLs as broken-hostname', () => {
    expect(classifySocialLink('linkedin', 'https://waveslab.org/people/jane-doe')).toBe('broken-hostname');
    expect(classifySocialLink('github', 'https://www.waveslab.org/people/janedoe')).toBe('broken-hostname');
  });

  it('classifies empty values as empty', () => {
    expect(classifySocialLink('linkedin', undefined)).toBe('empty');
    expect(classifySocialLink('linkedin', '')).toBe('empty');
    expect(classifySocialLink('linkedin', '  ')).toBe('empty');
  });

  it('classifies bare handles as bare-slug', () => {
    expect(classifySocialLink('github', 'janedoe')).toBe('bare-slug');
    expect(classifySocialLink('twitter', 'janedoe')).toBe('bare-slug');
  });

  it('classifies correct ORCID IDs as correct', () => {
    expect(classifySocialLink('orcid', '0000-0002-5507-2368')).toBe('correct');
  });

  it('classifies ORCID URLs as broken-hostname', () => {
    expect(classifySocialLink('orcid', 'https://orcid.org/0000-0002-5507-2368')).toBe('broken-hostname');
  });
});
