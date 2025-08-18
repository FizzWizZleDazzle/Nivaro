import { render } from '@testing-library/react';
import { Analytics, trackEvent, trackPageView, grantAnalyticsConsent, revokeAnalyticsConsent, getConsentStatus } from '@/components/Analytics';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_ANALYTICS_PROVIDER: 'none',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123',
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'test.com',
  NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT: 'true',
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: 'false'
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock performance observer
global.PerformanceObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as any;
(global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'measure'];

interface WindowWithAnalytics extends Window {
  gtag: (...args: unknown[]) => void;
  dataLayer: unknown[];
  plausible: ((...args: unknown[]) => void) & { q?: unknown[][]; };
}

describe('Analytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    Object.assign(process.env, mockEnv);
    
    // Reset window objects
    delete (window as any).gtag;
    delete (window as any).dataLayer;
    delete (window as any).plausible;
  });

  it('renders without crashing when analytics disabled', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'none';
    
    render(<Analytics />);
    // Component should render without errors
  });

  it('does not initialize analytics when consent is required but not granted', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'google';
    process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT = 'true';
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<Analytics />);
    
    expect((window as WindowWithAnalytics).gtag).toBeUndefined();
  });

  it('initializes Google Analytics when consent is granted', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'google';
    process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT = 'true';
    mockLocalStorage.getItem.mockReturnValue('true');
    
    // Mock document.createElement and head.appendChild
    const mockScript = document.createElement('script');
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockScript);
    const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation();
    
    render(<Analytics />);
    
    expect(createElementSpy).toHaveBeenCalledWith('script');
    expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
    
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });
});

describe('Analytics functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('true'); // Default to consent granted
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'google';
    process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT = 'false';
  });

  describe('trackEvent', () => {
    it('calls gtag when Google Analytics is configured', () => {
      const mockGtag = jest.fn();
      (window as WindowWithAnalytics).gtag = mockGtag;
      
      trackEvent('test_event', { property: 'value' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { property: 'value' });
    });

    it('does not track when consent is required but not granted', () => {
      process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT = 'true';
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const mockGtag = jest.fn();
      (window as WindowWithAnalytics).gtag = mockGtag;
      
      trackEvent('test_event');
      
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('calls plausible when Plausible is configured', () => {
      process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'plausible';
      const mockPlausible = jest.fn();
      (window as WindowWithAnalytics).plausible = mockPlausible;
      
      trackEvent('test_event', { property: 'value' });
      
      expect(mockPlausible).toHaveBeenCalledWith('test_event', { props: { property: 'value' } });
    });
  });

  describe('trackPageView', () => {
    it('calls gtag config when Google Analytics is configured', () => {
      const mockGtag = jest.fn();
      (window as WindowWithAnalytics).gtag = mockGtag;
      
      trackPageView('https://example.com/page', 'Test Page');
      
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_location: 'https://example.com/page',
        page_title: 'Test Page'
      });
    });
  });

  describe('consent management', () => {
    it('grants consent and sets localStorage', () => {
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });
      
      grantAnalyticsConsent();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('analytics-consent', 'true');
      expect(mockReload).toHaveBeenCalled();
    });

    it('revokes consent and clears localStorage', () => {
      revokeAnalyticsConsent();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('analytics-consent', 'false');
    });

    it('returns correct consent status', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      expect(getConsentStatus()).toBe(true);
      
      mockLocalStorage.getItem.mockReturnValue('false');
      expect(getConsentStatus()).toBe(false);
      
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getConsentStatus()).toBe(false);
    });
  });
});