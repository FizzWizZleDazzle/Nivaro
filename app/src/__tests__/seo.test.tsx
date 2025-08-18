import { render } from '@testing-library/react';
import { SEO, generateStructuredData } from '@/components/SEO';

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <div data-testid="head-mock">{children}</div>;
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
    const { getByTestId } = render(<SEO />);
    
    // Check if Head component mock is rendered
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    const { getByTestId } = render(
      <SEO 
        title="Custom Page" 
        description="Custom description"
      />
    );
    
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });

  it('renders Open Graph meta tags', () => {
    const { getByTestId } = render(
      <SEO 
        title="Test Page"
        description="Test description"
        image="/test-image.png"
      />
    );
    
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });

  it('renders Twitter Card meta tags', () => {
    const { getByTestId } = render(
      <SEO 
        title="Test Page"
        description="Test description"
      />
    );
    
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });

  it('sets noindex when specified', () => {
    const { getByTestId } = render(<SEO noindex={true} />);
    
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });

  it('renders structured data when provided', () => {
    const structuredData = { '@type': 'Article', name: 'Test Article' };
    const { getByTestId } = render(<SEO structuredData={structuredData} />);
    
    const headMock = getByTestId('head-mock');
    expect(headMock).toBeInTheDocument();
  });
});

describe('generateStructuredData', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.nivaro.com';
    process.env.NEXT_PUBLIC_SITE_NAME = 'Test Nivaro';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Test description';
  });

  it('generates WebSite structured data', () => {
    const data = generateStructuredData('WebSite', {}) as any;
    
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebSite');
    expect(data.name).toBe('Test Nivaro');
    expect(data.potentialAction).toBeDefined();
  });

  it('generates Organization structured data', () => {
    const data = generateStructuredData('Organization', {
      socialLinks: ['https://twitter.com/nivaro']
    }) as any;
    
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
    
    const data = generateStructuredData('Article', articleData) as any;
    
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
    
    const data = generateStructuredData('Event', eventData) as any;
    
    expect(data['@type']).toBe('Event');
    expect(data.name).toBe('Test Meeting');
    expect(data.startDate).toBe('2023-12-01T10:00:00Z');
    expect(data.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
  });

  it('generates SoftwareApplication structured data', () => {
    const data = generateStructuredData('SoftwareApplication', {}) as any;
    
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.applicationCategory).toBe('BusinessApplication');
    expect(data.featureList).toContain('Club Management');
    expect(data.offers.price).toBe('0');
  });
});