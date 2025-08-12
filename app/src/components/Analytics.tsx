'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    plausible: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

interface AnalyticsConfig {
  provider: 'google' | 'plausible' | 'both' | 'none';
  gaMeasurementId?: string;
  plausibleDomain?: string;
  plausibleCustomDomain?: string;
  requireConsent?: boolean;
}

interface PerformanceMetrics {
  name: string;
  value: number;
  delta?: number;
  entries?: PerformanceEntry[];
}

export function Analytics() {
  const config: AnalyticsConfig = {
    provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsConfig['provider']) || 'none',
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    plausibleCustomDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_DOMAIN,
    requireConsent: process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT === 'true'
  };

  useEffect(() => {
    if (config.provider === 'none') return;

    // Check consent if required
    if (config.requireConsent && !hasConsent()) {
      return;
    }

    // Initialize analytics providers
    if (config.provider === 'google' || config.provider === 'both') {
      initializeGoogleAnalytics(config.gaMeasurementId!);
    }

    if (config.provider === 'plausible' || config.provider === 'both') {
      initializePlausible(config.plausibleDomain!, config.plausibleCustomDomain);
    }

    // Initialize performance monitoring if enabled
    if (process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      initializePerformanceMonitoring();
    }
  }, [config.provider, config.requireConsent, config.gaMeasurementId, config.plausibleDomain, config.plausibleCustomDomain]);

  return null;
}

function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('analytics-consent') === 'true';
}

function initializeGoogleAnalytics(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
}

function initializePlausible(domain: string, customDomain?: string) {
  if (!domain || typeof window === 'undefined') return;

  const scriptSrc = customDomain 
    ? `https://${customDomain}/js/script.js`
    : 'https://plausible.io/js/script.js';

  const script = document.createElement('script');
  script.src = scriptSrc;
  script.defer = true;
  script.setAttribute('data-domain', domain);
  document.head.appendChild(script);

  // Initialize plausible function for custom events
  window.plausible = window.plausible || function(...args: unknown[]) {
    (window.plausible.q = window.plausible.q || []).push(args);
  };
}

function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Web Vitals monitoring
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const metric: PerformanceMetrics = {
        name: entry.name,
        value: entry.startTime,
        entries: [entry]
      };

      // Send to analytics
      trackPerformanceMetric(metric);
    }
  });

  // Observe various performance metrics
  try {
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  } catch (e) {
    // Some browsers don't support all entry types
    console.warn('Performance monitoring partially supported:', e);
  }
}

// Utility functions for tracking events
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const config: AnalyticsConfig = {
    provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsConfig['provider']) || 'none',
    requireConsent: process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT === 'true'
  };

  if (config.requireConsent && !hasConsent()) return;

  // Google Analytics
  if ((config.provider === 'google' || config.provider === 'both') && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Plausible
  if ((config.provider === 'plausible' || config.provider === 'both') && window.plausible) {
    window.plausible(eventName, { props: properties });
  }
}

export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined') return;

  const config: AnalyticsConfig = {
    provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsConfig['provider']) || 'none',
    requireConsent: process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT === 'true'
  };

  if (config.requireConsent && !hasConsent()) return;

  // Google Analytics
  if ((config.provider === 'google' || config.provider === 'both') && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_location: url,
      page_title: title
    });
  }

  // Plausible automatically tracks page views
}

function trackPerformanceMetric(metric: PerformanceMetrics) {
  trackEvent('performance_metric', {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_delta: metric.delta
  });
}

// Consent management
export function grantAnalyticsConsent() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('analytics-consent', 'true');
    // Reload analytics after consent
    window.location.reload();
  }
}

export function revokeAnalyticsConsent() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('analytics-consent', 'false');
    // Clear any existing analytics data
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      if (name.trim().startsWith('_ga') || name.trim().startsWith('_gid')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  }
}

export function getConsentStatus(): boolean {
  return hasConsent();
}