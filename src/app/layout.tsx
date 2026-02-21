import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
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
  title: 'WAVES Lab - Water, Vegetation, and Society',
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
  const cookieStore = await cookies();
  const isPreview = cookieStore.has('__prerender_bypass') && cookieStore.has('__next_preview_data');

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <PreviewBanner isPreview={isPreview} />
        <div className={isPreview ? 'pt-16' : ''}>
          <Navigation />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
