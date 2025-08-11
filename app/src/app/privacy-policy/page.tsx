import { Metadata } from 'next';
import { PrivacySettings } from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Nivaro privacy policy and data protection information',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                Nivaro is a club management platform that helps organize communities. We collect information to provide and improve our services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Account information (name, email) when you create an account</li>
                <li>Club and meeting data you create or participate in</li>
                <li>Usage data to improve the platform (anonymized)</li>
                <li>Technical information (browser type, IP address) for security and functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide club management and communication features</li>
                <li>Send notifications about meetings and club activities</li>
                <li>Improve platform performance and user experience</li>
                <li>Ensure security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics and Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use analytics to understand how our platform is used and to improve the user experience. Our analytics are:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Anonymized and privacy-focused</li>
                <li>Optional - you can opt out at any time</li>
                <li>Used only for improving the platform</li>
                <li>Not used for advertising or tracking across other sites</li>
              </ul>
              
              <div className="mt-6">
                <PrivacySettings />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share information in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>With club members as part of normal platform functionality</li>
                <li>With service providers who help us operate the platform</li>
                <li>When required by law or to protect safety</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of analytics and marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Nivaro is not intended for children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p className="text-gray-700">
                  Email: privacy@nivaro.com<br />
                  Address: [Your Business Address]
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}