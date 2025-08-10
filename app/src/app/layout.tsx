import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { generateStructuredData } from "@/components/SEO";

export const metadata: Metadata = {
  title: "Nivaro - Club Management Platform",
  description: "A platform for managing clubs and member communities. Create clubs, schedule meetings, collaborate on projects, and build learning communities.",
  keywords: ["club management", "community platform", "meeting scheduler", "project collaboration", "learning platform"],
  authors: [{ name: "Nivaro Team" }],
  creator: "Nivaro",
  publisher: "Nivaro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nivaro.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Nivaro - Club Management Platform",
    description: "A platform for managing clubs and member communities. Create clubs, schedule meetings, collaborate on projects, and build learning communities.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nivaro.com',
    siteName: "Nivaro",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nivaro - Club Management Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nivaro - Club Management Platform",
    description: "A platform for managing clubs and member communities",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here when available
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
    // bing: 'your-bing-verification-token',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data for the website
  const websiteStructuredData = generateStructuredData('WebSite', {});
  const organizationStructuredData = generateStructuredData('Organization', {
    socialLinks: [], // Add your social media links here
  });
  const softwareApplicationStructuredData = generateStructuredData('SoftwareApplication', {});

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
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
        
        {/* Additional Meta Tags */}
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
      <body className="font-sans antialiased">
        <Navigation />
        <main>{children}</main>
        <CookieConsent />
      </body>
    </html>
  );
}
