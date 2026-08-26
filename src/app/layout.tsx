import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { draftMode } from 'next/headers';
import './globals.css';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import PreviewBanner from '../components/preview/PreviewBanner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  // Required for Next.js to resolve canonical and Open Graph URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.waveslab.org'),
  title: {
    default: 'WAVES Lab - Water, Vegetation, and Society',
    template: '%s | WAVES Lab',
  },
  description: 'Research lab focused on water, vegetation, and society at UCSB',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '16x16' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check for preview mode
  const { isEnabled: isPreview } = await draftMode();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <PreviewBanner isPreview={isPreview} />
        <div className={isPreview ? 'pt-16' : ''}>
          <Navigation />
          <div id="main-content">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
