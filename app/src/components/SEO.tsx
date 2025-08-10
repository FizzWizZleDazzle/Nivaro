import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  siteName?: string;
  locale?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}

export function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  siteName,
  locale = 'en_US',
  noindex = false,
  nofollow = false,
  canonicalUrl,
  structuredData
}: SEOProps) {
  // Default values from environment or fallbacks
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nivaro.com';
  const siteTitleDefault = process.env.NEXT_PUBLIC_SITE_NAME || 'Nivaro';
  const siteDescriptionDefault = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A platform for managing clubs and member communities';
  
  // Construct final values
  const finalTitle = title ? `${title} | ${siteTitleDefault}` : siteTitleDefault;
  const finalDescription = description || siteDescriptionDefault;
  const finalUrl = url || siteUrl;
  const finalImage = image || `${siteUrl}/og-image.png`;
  const finalSiteName = siteName || siteTitleDefault;
  
  // Robots meta tag
  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || finalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={finalSiteName} />
      <meta property="og:locale" content={locale} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

// Helper function to generate structured data for different page types
export function generateStructuredData(type: string, data: Record<string, unknown>) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    name: process.env.NEXT_PUBLIC_SITE_NAME,
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION
  };

  switch (type) {
    case 'WebSite':
      return {
        ...baseData,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      };

    case 'Organization':
      return {
        ...baseData,
        '@type': 'Organization',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        sameAs: data.socialLinks || [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'English'
        }
      };

    case 'SoftwareApplication':
      return {
        ...baseData,
        '@type': 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: [
          'Club Management',
          'Meeting Scheduling',
          'Member Communication',
          'Learning Resources',
          'Project Collaboration'
        ]
      };

    case 'Article':
      return {
        ...baseData,
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.author
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime,
        image: data.image,
        publisher: {
          '@type': 'Organization',
          name: process.env.NEXT_PUBLIC_SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
          }
        }
      };

    case 'Event':
      return {
        ...baseData,
        '@type': 'Event',
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        organizer: {
          '@type': 'Organization',
          name: data.organizerName
        },
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: data.isOnline 
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode'
      };

    default:
      return baseData;
  }
}