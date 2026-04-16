import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import PWASetup from '@/components/layout/PWASetup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RankForge',
  description:
    'Track your NEET exam preparation with analytics, progress tracking, and AIR estimation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RankForge',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1976d2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RankForge" />
        <meta name="application-name" content="RankForge" />
        <meta name="msapplication-TileColor" content="#1976d2" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <PWASetup />
        {children}
      </body>
    </html>
  );
}
