import { render } from '@testing-library/react';
import { SEO, generateStructuredData } from '@/components/SEO';

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('SEO Component', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.nivaro.com';
    process.env.NEXT_PUBLIC_SITE_NAME = 'Test Nivaro';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Test description';
  });

  it('renders with default props', () => {
    const { container } = render(<SEO />);
    
    // Check if title tag is rendered
    const titleTag = container.querySelector('title');
    expect(titleTag).toBeInTheDocument();
    expect(titleTag?.textContent).toBe('Test Nivaro');
  });

  it('renders with custom title and description', () => {
    const { container } = render(
      <SEO 
        title="Custom Page" 
        description="Custom description"
      />
    );
    
    const titleTag = container.querySelector('title');
    const descriptionTag = container.querySelector('meta[name="description"]');
    
    expect(titleTag?.textContent).toBe('Custom Page | Test Nivaro');
    expect(descriptionTag?.getAttribute('content')).toBe('Custom description');
  });

  it('renders Open Graph meta tags', () => {
    const { container } = render(
      <SEO 
        title="Test Page"
        description="Test description"
        image="/test-image.png"
      />
    );
    
    const ogTitle = container.querySelector('meta[property="og:title"]');
    const ogDescription = container.querySelector('meta[property="og:description"]');
    const ogImage = container.querySelector('meta[property="og:image"]');
    
    expect(ogTitle?.getAttribute('content')).toBe('Test Page | Test Nivaro');
    expect(ogDescription?.getAttribute('content')).toBe('Test description');
    expect(ogImage?.getAttribute('content')).toBe('/test-image.png');
  });

  it('renders Twitter Card meta tags', () => {
    const { container } = render(
      <SEO 
        title="Test Page"
        description="Test description"
      />
    );
    
    const twitterCard = container.querySelector('meta[name="twitter:card"]');
    const twitterTitle = container.querySelector('meta[name="twitter:title"]');
    
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
    expect(twitterTitle?.getAttribute('content')).toBe('Test Page | Test Nivaro');
  });

  it('sets noindex when specified', () => {
    const { container } = render(<SEO noindex={true} />);
    
    const robotsTag = container.querySelector('meta[name="robots"]');
    expect(robotsTag?.getAttribute('content')).toBe('noindex,follow');
  });

  it('renders structured data when provided', () => {
    const structuredData = { '@type': 'Article', name: 'Test Article' };
    const { container } = render(<SEO structuredData={structuredData} />);
    
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeInTheDocument();
    expect(scriptTag?.textContent).toContain('"@type":"Article"');
  });
});

describe('generateStructuredData', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.nivaro.com';
    process.env.NEXT_PUBLIC_SITE_NAME = 'Test Nivaro';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Test description';
  });

  it('generates WebSite structured data', () => {
    const data = generateStructuredData('WebSite', {});
    
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('Test Nivaro');
    expect(data.potentialAction).toBeDefined();
  });

  it('generates Organization structured data', () => {
    const data = generateStructuredData('Organization', {
      socialLinks: ['https://twitter.com/nivaro']
    });
    
    expect(data['@type']).toBe('Organization');
    expect(data.sameAs).toEqual(['https://twitter.com/nivaro']);
    expect(data.contactPoint).toBeDefined();
  });

  it('generates Article structured data', () => {
    const articleData = {
      title: 'Test Article',
      description: 'Test description',
      author: 'Test Author',
      publishedTime: '2023-01-01',
      image: '/test-image.png'
    };
    
    const data = generateStructuredData('Article', articleData);
    
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test Article');
    expect(data.author.name).toBe('Test Author');
    expect(data.datePublished).toBe('2023-01-01');
  });

  it('generates Event structured data', () => {
    const eventData = {
      name: 'Test Meeting',
      description: 'Test meeting description',
      startDate: '2023-12-01T10:00:00Z',
      endDate: '2023-12-01T11:00:00Z',
      location: 'Online',
      organizerName: 'Test Club',
      isOnline: true
    };
    
    const data = generateStructuredData('Event', eventData);
    
    expect(data['@type']).toBe('Event');
    expect(data.name).toBe('Test Meeting');
    expect(data.startDate).toBe('2023-12-01T10:00:00Z');
    expect(data.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
  });

  it('generates SoftwareApplication structured data', () => {
    const data = generateStructuredData('SoftwareApplication', {});
    
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.applicationCategory).toBe('BusinessApplication');
    expect(data.featureList).toContain('Club Management');
    expect(data.offers.price).toBe('0');
  });
});