import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Nivaro",
  description: "Learn about how Nivaro uses cookies and similar tracking technologies to improve your experience on our platform.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 mb-6">
              Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences and login status, making your next visit easier and the site more useful to you.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">
              Nivaro uses cookies and similar tracking technologies to provide and improve our services. We use cookies for:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Keeping you signed in to your account</li>
              <li>• Remembering your preferences and settings</li>
              <li>• Analyzing how you use our platform</li>
              <li>• Improving our services and user experience</li>
              <li>• Ensuring security and preventing fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Authentication tokens to keep you logged in</li>
                <li>• Security cookies to prevent cross-site request forgery</li>
                <li>• Load balancing cookies for website performance</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Functional Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies allow the website to remember choices you make and provide enhanced, more personal features.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Language preferences</li>
                <li>• Theme settings (dark/light mode)</li>
                <li>• Recently viewed clubs or events</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Analytics Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Page view statistics</li>
                <li>• User journey tracking</li>
                <li>• Feature usage analytics</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Performance Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies collect information about how you use our website, such as which pages you go to most often, and if you get error messages from web pages.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Error tracking and debugging</li>
                <li>• Performance monitoring</li>
                <li>• Speed optimization data</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We may use third-party services that set their own cookies. These services help us:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• Process payments securely</li>
              <li>• Analyze website traffic and usage</li>
              <li>• Provide customer support</li>
              <li>• Integrate with external platforms</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-4">
              You have several options for managing cookies:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Browser Settings</h3>
            <p className="text-gray-600 mb-4">
              Most browsers allow you to control cookies through their settings preferences. You can:
            </p>
            <ul className="text-gray-600 mb-4 ml-6 space-y-2">
              <li>• View cookies stored on your device</li>
              <li>• Delete existing cookies</li>
              <li>• Block cookies from specific sites</li>
              <li>• Block all cookies (may affect functionality)</li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Browser-Specific Instructions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li>• <strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                <li>• <strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li>• <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Our Cookie Preferences</h3>
            <p className="text-gray-600 mb-6">
              When you first visit Nivaro, you&apos;ll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time by clicking the cookie settings link in our footer.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impact of Blocking Cookies</h2>
            <p className="text-gray-600 mb-4">
              While you can browse our website with cookies disabled, blocking certain cookies may affect your experience:
            </p>
            <ul className="text-gray-600 mb-6 ml-6 space-y-2">
              <li>• You may need to log in repeatedly</li>
              <li>• Your preferences may not be saved</li>
              <li>• Some features may not work properly</li>
              <li>• We may not be able to provide personalized content</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie Retention</h2>
            <p className="text-gray-600 mb-6">
              Cookies have different lifespans. Session cookies are deleted when you close your browser, while persistent cookies remain on your device for a set period or until you delete them. We regularly review and clean up unnecessary cookies.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Cookie Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. We will notify you of any significant changes by posting the updated policy on our website.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us through our <a href="/contact" className="text-blue-600 hover:text-blue-700">contact page</a>.
            </p>

            <div className="bg-green-50 p-6 rounded-lg mt-8">
              <h3 className="font-semibold text-gray-900 mb-2">Cookie Consent</h3>
              <p className="text-sm text-gray-600 mb-4">
                By continuing to use Nivaro, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings or using our cookie preference center.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                Manage Cookie Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}