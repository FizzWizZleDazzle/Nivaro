import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Nivaro",
  description: "Learn about Nivaro, the comprehensive club management platform designed to bring communities together and streamline club operations.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Nivaro</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Nivaro is dedicated to empowering communities by providing a comprehensive club management platform that simplifies organization, enhances collaboration, and fosters meaningful connections.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-600 mb-4">
              We provide clubs and communities with the tools they need to thrive:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Event planning and meeting management</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Member collaboration and communication tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Learning resources and skill development</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Project collaboration and code sharing</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Community forums and mentorship</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 mb-6">
              We envision a world where every community can easily organize, collaborate, and grow together. Nivaro bridges the gap between technology and human connection, making it simple for clubs to focus on what matters most - their members and mission.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Nivaro?</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600 text-sm">
                  Intuitive interface designed for users of all technical backgrounds.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Comprehensive</h3>
                <p className="text-gray-600 text-sm">
                  All-in-one solution for club management, communication, and collaboration.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Scalable</h3>
                <p className="text-gray-600 text-sm">
                  Grows with your community from small groups to large organizations.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600 text-sm">
                  Enterprise-grade security to protect your community&apos;s data.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started Today</h2>
            <p className="text-gray-600 mb-6">
              Ready to transform how your club operates? Join thousands of communities already using Nivaro to bring their members together and achieve their goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/onboarding/create" 
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Create Your Club
              </a>
              <a 
                href="/contact" 
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors text-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}