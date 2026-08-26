import { describe, expect, it } from 'vitest';

import { buildMetadata, stripBrandSuffix, trimForMeta } from '@/lib/seo/metadata';

describe('stripBrandSuffix', () => {
  it('drops the legacy suffix stored in Studio metaTitles', () => {
    expect(stripBrandSuffix('Abinash Bhattachan - WAVES Research Lab')).toBe('Abinash Bhattachan');
  });

  it('drops the current site name too, however it is separated', () => {
    expect(stripBrandSuffix('Some Title | WAVES Lab')).toBe('Some Title');
    expect(stripBrandSuffix('Some Title – WAVES Research Lab')).toBe('Some Title');
  });

  it('leaves a title that only mentions the lab mid-string alone', () => {
    expect(stripBrandSuffix('WAVES Lab joins a new consortium')).toBe(
      'WAVES Lab joins a new consortium',
    );
  });

  it('keeps a leading site name, which the home page relies on', () => {
    expect(stripBrandSuffix('WAVES Lab - Water, Vegetation, and Society')).toBe(
      'WAVES Lab - Water, Vegetation, and Society',
    );
  });
});

describe('buildMetadata', () => {
  it('does not let the title template double the branding', () => {
    const meta = buildMetadata({
      title: 'A Convolutional Neural Network Approach - WAVES Research Lab',
      description: 'An abstract.',
      path: '/publications/cnn',
    });
    expect(meta.title).toBe('A Convolutional Neural Network Approach');
  });

  it('derives a canonical URL from the path', () => {
    const meta = buildMetadata({ title: 'Search', description: 'x', path: '/search' });
    expect(meta.alternates?.canonical).toBe('https://www.waveslab.org/search');
  });
});

describe('trimForMeta', () => {
  it('strips markup and cuts on a word boundary', () => {
    const long = `${'word '.repeat(60)}end`;
    const out = trimForMeta(long);
    expect(out.length).toBeLessThanOrEqual(161);
    expect(out.endsWith('…')).toBe(true);
  });
});
