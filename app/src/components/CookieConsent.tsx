'use client';

import { useState, useEffect } from 'react';
import { grantAnalyticsConsent, revokeAnalyticsConsent, getConsentStatus } from './Analytics';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [consentStatus, setConsentStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if consent is required
    const requireConsent = process.env.NEXT_PUBLIC_REQUIRE_COOKIE_CONSENT === 'true';
    if (!requireConsent) return;

    // Check existing consent status
    const hasConsent = getConsentStatus();
    const hasDeclined = localStorage.getItem('analytics-consent') === 'false';
    
    setConsentStatus(hasConsent);
    
    // Show banner if no decision has been made
    if (!hasConsent && !hasDeclined) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    grantAnalyticsConsent();
    setConsentStatus(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    revokeAnalyticsConsent();
    setConsentStatus(false);
    setShowBanner(false);
  };

  const handleToggleConsent = () => {
    if (consentStatus) {
      revokeAnalyticsConsent();
      setConsentStatus(false);
    } else {
      grantAnalyticsConsent();
      setConsentStatus(true);
    }
  };

  if (!showBanner && consentStatus === null) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm">
                We use cookies and analytics to improve your experience and understand how our platform is used. 
                Your privacy is important to us - we only collect anonymized data.{' '}
                <a 
                  href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy-policy'} 
                  className="underline hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm border border-gray-500 rounded hover:bg-gray-800 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Controls (always visible in footer or settings) */}
      {consentStatus !== null && (
        <div className="text-sm text-gray-600">
          <button
            onClick={handleToggleConsent}
            className="underline hover:text-blue-600"
          >
            Analytics: {consentStatus ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      )}
    </>
  );
}

// Privacy settings component for settings pages
export function PrivacySettings() {
  const [consentStatus, setConsentStatus] = useState<boolean | null>(null);

  useEffect(() => {
    setConsentStatus(getConsentStatus());
  }, []);

  const handleToggleConsent = () => {
    if (consentStatus) {
      revokeAnalyticsConsent();
      setConsentStatus(false);
    } else {
      grantAnalyticsConsent();
      setConsentStatus(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Analytics & Cookies</h4>
            <p className="text-sm text-gray-600">
              Allow anonymous usage analytics to help improve the platform
            </p>
          </div>
          <button
            onClick={handleToggleConsent}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${consentStatus ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${consentStatus ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            Current status: {consentStatus ? 'Analytics enabled' : 'Analytics disabled'}
          </p>
          <p className="mt-2">
            <a 
              href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy-policy'}
              className="text-blue-600 hover:underline"
            >
              View our Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}