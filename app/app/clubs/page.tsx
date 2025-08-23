'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clubService, Club } from '@/lib/clubs';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Plus, Users, Calendar, Settings, ChevronRight } from 'lucide-react';

export default function ClubsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user]);

  const loadClubs = async () => {
    try {
      const userClubs = await clubService.getClubs();
      setClubs(userClubs);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoadingClubs(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Clubs</h1>
            <p className="text-gray-600 mt-2">Manage and explore your club memberships</p>
          </div>
          <Link
            href="/clubs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Club
          </Link>
        </div>

        {loadingClubs ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    {club.owner_id === user.id && (
                      <span className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{club.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {club.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created {new Date(club.created_at).toLocaleDateString()}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No clubs yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first club or joining an existing one.
            </p>
            <div className="mt-6">
              <Link
                href="/clubs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Club
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}