'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockInviteCodes, mockClubs } from '../../../lib/mockData';

export default function JoinClub() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock invite code validation
    setTimeout(() => {
      const validCode = mockInviteCodes.find(code => 
        code.code.toUpperCase() === inviteCode.toUpperCase() && 
        new Date() < code.expiresAt &&
        !code.usedBy
      );

      if (validCode) {
        const club = mockClubs.find(c => c.id === validCode.clubId);
        console.log('Joining club:', club);
        
        // Redirect to the club dashboard
        router.push(`/club/${validCode.clubId}`);
      } else {
        setError('Invalid or expired invite code. Please check and try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join a Club</h1>
          <p className="mt-2 text-gray-600">Enter your invite code to get started</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase"
                placeholder="Enter invite code"
                style={{ textTransform: 'uppercase' }}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-800">
                <strong>Demo code:</strong> TECH2024
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Joining...' : 'Join Club'}
              </button>
              <Link
                href="/onboarding"
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
              >
                Back
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-gray-500">
          Step 3 of 3 - Final step! Don&apos;t have an invite code?{' '}
          <Link href="/onboarding/create" className="text-blue-600 hover:text-blue-500">
            Create your own club
          </Link>
        </div>
      </div>
    </div>
  );
}