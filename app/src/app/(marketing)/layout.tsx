import React from 'react';
import { Metadata } from 'next';
import { generateStructuredData } from '../../components/SEO';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { CookieConsent } from '../../components/CookieConsent';
import ErrorBoundary from '../../components/ErrorBoundary';
import ClientWrapper from '../../components/ClientWrapper';
import { Analytics } from '../../components/Analytics';

export const metadata: Metadata = {
  title: "Nivaro - Complete Club Management Platform",
  description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities.",
  keywords: ["club management", "collaboration", "meetings", "community", "learning platform"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nivaro.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Nivaro - Complete Club Management Platform",
    description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nivaro.com',
    siteName: "Nivaro",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nivaro - Complete Club Management Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nivaro - Complete Club Management Platform",
    description: "Transform your club management with Nivaro. Streamline meetings, boost collaboration, enhance learning experiences, and build stronger communities.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data for the marketing site
  const websiteStructuredData = generateStructuredData('WebSite', {});
  const organizationStructuredData = generateStructuredData('Organization', {
    socialLinks: [], // Add your social media links here
  });
  const softwareApplicationStructuredData = generateStructuredData('SoftwareApplication', {});

  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              websiteStructuredData,
              organizationStructuredData,
              softwareApplicationStructuredData,
            ]),
          }}
        />
        
        {/* Additional Meta Tags for Marketing */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nivaro" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Analytics and Performance Monitoring */}
        <Analytics />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ErrorBoundary>
          <ClientWrapper>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ClientWrapper>
          <CookieConsent />
        </ErrorBoundary>
      </body>
    </html>
  );
}