import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Nivaro",
  description: "Privacy policy for Nivaro club management platform. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-6">
              At Nivaro, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our club management platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
            <ul className="text-gray-600 mb-4 ml-6 space-y-2">
              <li>• Account information (name, email address, password)</li>
              <li>• Profile information (bio, interests, skills)</li>
              <li>• Club and event content you create</li>
              <li>• Messages and communications within the platform</li>
              <li>• Payment information (processed securely by third-party providers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information We Collect Automatically</h3>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Usage data (how you interact with our platform)</li>
              <li>• Device information (browser type, operating system)</li>
              <li>• Log data (IP address, access times, pages viewed)</li>
              <li>• Cookies and similar technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Provide and maintain our services</li>
              <li>• Process your transactions and manage subscriptions</li>
              <li>• Send you important updates and notifications</li>
              <li>• Respond to your inquiries and provide customer support</li>
              <li>• Improve our platform and develop new features</li>
              <li>• Ensure security and prevent fraud</li>
              <li>• Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• <strong>Within Your Clubs:</strong> Information you share within clubs is visible to other club members</li>
              <li>• <strong>Service Providers:</strong> Trusted third parties who help us operate our platform</li>
              <li>• <strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
              <li>• <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li>• <strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">We implement appropriate security measures to protect your information:</p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• SSL/TLS encryption for data transmission</li>
              <li>• Secure data storage with encrypted databases</li>
              <li>• Regular security audits and monitoring</li>
              <li>• Access controls and authentication measures</li>
              <li>• Employee training on data privacy and security</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• <strong>Access:</strong> Request a copy of your personal information</li>
              <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
              <li>• <strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li>• <strong>Restriction:</strong> Limit how we process your information</li>
              <li>• <strong>Objection:</strong> Object to certain types of processing</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 mb-4">We use cookies and similar technologies to:</p>
            <ul className="text-gray-600 mb-4 ml-6 space-y-2">
              <li>• Remember your preferences and settings</li>
              <li>• Authenticate your login sessions</li>
              <li>• Analyze platform usage and performance</li>
              <li>• Provide personalized content and features</li>
            </ul>
            <p className="text-gray-600 mb-6">
              You can control cookie settings through your browser preferences. See our <a href="/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</a> for more details.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-600 mb-6">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete your personal information within 30 days, except where we are required to retain it by law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during international transfers, including standard contractual clauses and adequacy decisions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-6">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the effective date. We encourage you to review this Privacy Policy periodically.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us through our <a href="/contact" className="text-blue-600 hover:text-blue-700">contact page</a> or email us directly.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="font-semibold text-gray-900 mb-2">Your Data Rights</h3>
              <p className="text-sm text-gray-600 mb-4">
                To exercise any of your privacy rights or if you have questions about how we handle your personal information, please don&apos;t hesitate to reach out to us.
              </p>
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Our Privacy Team →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}