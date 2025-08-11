import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Nivaro",
  description: "Terms of service and conditions of use for the Nivaro club management platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using Nivaro (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              Nivaro is a web-based club management platform that provides tools for:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Club and community organization</li>
              <li>• Event planning and management</li>
              <li>• Member communication and collaboration</li>
              <li>• Learning resources and skill development</li>
              <li>• Project management and code collaboration</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Provide accurate and complete information during registration</li>
              <li>• Maintain the security of your password and account</li>
              <li>• Accept responsibility for all activities under your account</li>
              <li>• Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to use the Service to:</p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Violate any applicable laws or regulations</li>
              <li>• Infringe upon the rights of others</li>
              <li>• Distribute spam, malware, or harmful content</li>
              <li>• Harass, abuse, or harm other users</li>
              <li>• Attempt to gain unauthorized access to the Service</li>
              <li>• Use the Service for commercial purposes without permission</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of content you create and upload to the Service. By using the Service, you grant us a license to use, store, and display your content as necessary to provide the Service.
            </p>
            <p className="text-gray-600 mb-6">
              The Nivaro platform, including its design, functionality, and underlying technology, is protected by copyright and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payments and Subscriptions</h2>
            <p className="text-gray-600 mb-4">
              Some features of the Service may require payment. By subscribing to a paid plan:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• You agree to pay all fees associated with your chosen plan</li>
              <li>• Subscriptions automatically renew unless cancelled</li>
              <li>• Refunds are provided according to our refund policy</li>
              <li>• We may change pricing with 30 days notice</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-600 mb-6">
              While we strive to maintain high availability, we do not guarantee that the Service will be available 100% of the time. We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              To the maximum extent permitted by law, Nivaro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you have paid for the Service in the past 12 months.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-6">
              Either party may terminate this agreement at any time. Upon termination, your right to use the Service ceases immediately. We may terminate or suspend accounts that violate these terms without prior notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms are governed by and construed in accordance with the laws of the jurisdiction in which Nivaro operates, without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us through our <a href="/contact" className="text-blue-600 hover:text-blue-700">contact page</a> or email us directly.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                By using Nivaro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}