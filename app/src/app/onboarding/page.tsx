'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingLanding() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Nivaro</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your all-in-one platform for club management and community building
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What you can do with Nivaro</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Organize Meetings & Events</h3>
                    <p className="text-gray-600 text-sm">Schedule and manage club meetings with easy RSVP tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-green-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Collaborate on Projects</h3>
                    <p className="text-gray-600 text-sm">Work together on coding projects and share knowledge</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Learn & Grow</h3>
                    <p className="text-gray-600 text-sm">Access learning resources and get mentorship</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-orange-600 text-sm font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Stay Connected</h3>
                    <p className="text-gray-600 text-sm">Keep up with announcements and club updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>

          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Go to dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s Set You Up</h1>
          <p className="text-gray-600">Choose how you&apos;d like to get started with Nivaro</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Join an Existing Club</h2>
            <p className="text-gray-600 mb-4">
              Do you have an invite code from a club organizer? Join an existing community and start collaborating right away.
            </p>
            <Link
              href="/onboarding/profile?flow=join"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Join with Invite Code
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Your Own Club</h2>
            <p className="text-gray-600 mb-4">
              Start fresh by creating your own club community. Perfect for student organizations, hobby groups, or professional teams.
            </p>
            <Link
              href="/onboarding/profile?flow=create"
              className="inline-block bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
            >
              Create New Club
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Just Exploring</h2>
            <p className="text-gray-600 mb-4">
              Take a look around and see what Nivaro has to offer. You can always create or join a club later.
            </p>
            <Link
              href="/onboarding/tour"
              className="inline-block bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
            >
              Take a Tour
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip setup for now
          </Link>
        </div>
      </div>
    </div>
  );
}