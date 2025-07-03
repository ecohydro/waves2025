'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PreviewBannerProps {
  isPreview: boolean;
}

export default function PreviewBanner({ isPreview }: PreviewBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isPreview || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 border-b border-yellow-500 shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-yellow-800 font-medium text-sm">Preview Mode</span>
            </div>
            <span className="text-yellow-700 text-sm">
              You are viewing draft content that is not published yet.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/api/exit-preview"
              className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-800 text-white text-sm font-medium rounded hover:bg-yellow-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Exit Preview
            </Link>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-yellow-700 hover:text-yellow-800 transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
