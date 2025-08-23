import React from 'react';
import { motion } from 'framer-motion';

const Terms: React.FC = () => {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using Cursoset ("Service"), you accept and agree to be bound by the terms and provision 
                of this agreement. These Terms of Service ("Terms") constitute a legally binding agreement between you 
                and Cursoset Inc. ("Company," "we," "our," or "us").
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cursoset is a club management and learning platform that enables organizations to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Create and manage club dashboards</li>
                <li>Build structured learning curricula</li>
                <li>Manage assignments and projects</li>
                <li>Facilitate peer reviews and collaboration</li>
                <li>Award badges and certificates</li>
                <li>Host discussion forums and community features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Account Registration and Security
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Account Creation
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You must be at least 13 years old to use our Service</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Account Responsibilities
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You are fully responsible for all activities under your account</li>
                <li>You agree to use a strong password and enable two-factor authentication when available</li>
                <li>You must keep your contact information current and accurate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Acceptable Use Policy
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Permitted Uses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use our Service for legitimate educational and organizational purposes in accordance with these Terms.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Prohibited Uses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload or share harmful, offensive, or inappropriate content</li>
                <li>Engage in harassment, bullying, or discriminatory behavior</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use the Service for commercial purposes without authorization</li>
                <li>Share false, misleading, or deceptive information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. User Content and Intellectual Property
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Your Content
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You retain ownership of content you create and upload to our platform</li>
                <li>You grant us a license to use, store, and display your content as necessary to provide our Service</li>
                <li>You are responsible for ensuring you have rights to any content you upload</li>
                <li>You represent that your content does not violate any third-party rights</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Our Content
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We own all rights to the Cursoset platform, software, and related materials</li>
                <li>We grant you a limited, non-exclusive license to use our Service</li>
                <li>You may not copy, modify, or distribute our proprietary content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our Service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Payment and Billing
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Subscription Plans
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We offer various subscription plans with different features and limitations</li>
                <li>Pricing is subject to change with reasonable notice</li>
                <li>All fees are non-refundable unless otherwise specified</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Billing Terms
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>You authorize us to charge your payment method for applicable fees</li>
                <li>You are responsible for maintaining valid payment information</li>
                <li>Late payments may result in service suspension</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Service Availability and Modifications
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Service Availability
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We strive to maintain high availability but do not guarantee uninterrupted service</li>
                <li>We may perform maintenance that temporarily affects service availability</li>
                <li>We will provide notice of planned maintenance when possible</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Service Modifications
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We may modify, update, or discontinue features with reasonable notice</li>
                <li>We reserve the right to impose usage limits or restrictions</li>
                <li>Significant changes will be communicated to users in advance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Termination
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Termination by You
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You may terminate your account at any time through your account settings</li>
                <li>You remain responsible for charges incurred before termination</li>
                <li>You may download your data before account closure</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Termination by Us
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may terminate accounts for non-payment of fees</li>
                <li>We reserve the right to terminate the Service entirely with reasonable notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Disclaimers and Limitation of Liability
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Service Disclaimers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Service is provided "as is" without warranties of any kind. We disclaim all warranties, 
                express or implied, including warranties of merchantability, fitness for a particular purpose, 
                and non-infringement.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Limitation of Liability
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Cursoset and its officers, directors, employees, and agents 
                from any claims, damages, losses, and expenses arising out of your use of our Service, violation of 
                these Terms, or infringement of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Governing Law and Dispute Resolution
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of California, 
                without regard to conflict of law provisions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising under these Terms shall be resolved through binding arbitration in 
                San Francisco, California, except that we may seek injunctive relief in any court of competent jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may modify these Terms at any time by posting the revised version on our website. 
                Changes will be effective immediately upon posting, unless otherwise specified.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@cursoset.com</p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Cursoset Inc., San Francisco, CA</p>
                <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;