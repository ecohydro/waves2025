'use client';

import { useEffect } from 'react';

interface PublicationBadgesProps {
  doi?: string | null;
  className?: string;
}

/**
 * Renders Altmetric and Dimensions badges for a given DOI.
 * Loads external embed scripts once per page and re-initializes on mount.
 */
export function PublicationBadges({ doi, className }: PublicationBadgesProps) {
  useEffect(() => {
    if (!doi) return;

    const ensureScript = (id: string, src: string, onLoad?: () => void) => {
      if (document.getElementById(id)) {
        if (onLoad) onLoad();
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.async = true;
      script.src = src;
      script.onload = () => onLoad && onLoad();
      document.head.appendChild(script);
    };

    // Altmetric embed
    ensureScript(
      'altmetric-embed-script',
      'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
      () => {
        // @ts-expect-error altmetric global
        if (typeof window !== 'undefined' && window._altmetric_embed_init) {
          // @ts-expect-error altmetric global
          window._altmetric_embed_init();
        }
      },
    );

    // Dimensions embed
    ensureScript('dimensions-badge-script', 'https://badge.dimensions.ai/badge.js', () => {
      // @ts-expect-error dimensions global
      if (typeof window !== 'undefined' && window.__dimensions_embed) {
        // @ts-expect-error dimensions global
        window.__dimensions_embed.addBadges();
      }
    });
  }, [doi]);

  if (!doi) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {/* Altmetric donut */}
        <span
          className="altmetric-embed"
          data-badge-type="donut"
          data-badge-popover="left"
          data-hide-less-than="1"
          data-doi={doi}
        />

        {/* Dimensions small circle */}
        <span
          className="__dimensions_badge_embed__"
          data-doi={doi}
          data-hide-zero-citations="true"
          data-style="small_circle"
        />
      </div>
    </div>
  );
}

export default PublicationBadges;
