'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClub, useClubMembers } from '../lib/hooks';
import { MemberRole } from '../lib/types';
import { isAdmin } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';

interface ClubNavigationProps {
  clubId: string;
}

export default function ClubNavigation({ clubId }: ClubNavigationProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Use API hooks to fetch data
  const { data: club, loading: clubLoading, error: clubError } = useClub(clubId);
  const { data: members, loading: membersLoading, error: membersError } = useClubMembers(clubId);
  
  // Find current user's membership
  const membership = members.find(m => m.clubId === clubId && m.userId === user?.id);
  const userRole = membership?.role || MemberRole.MEMBER;

  if (clubLoading || membersLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 mr-8">
                Nivaro
              </Link>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (clubError || membersError || !club) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 mr-8">
                Nivaro
              </Link>
              <span className="text-red-600">Error loading club data</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: `/club/${clubId}`, current: pathname === `/club/${clubId}` },
    { name: 'Members', href: `/club/${clubId}/members`, current: pathname === `/club/${clubId}/members` },
  ];

  // Add admin-only navigation items
  if (isAdmin(userRole)) {
    navigation.push(
      { name: 'Settings', href: `/club/${clubId}/settings`, current: pathname === `/club/${clubId}/settings` }
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 mr-8">
              Nivaro
            </Link>
            <div className="flex items-center space-x-1">
              <h1 className="text-lg font-semibold text-gray-900 mr-6">{club.name}</h1>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdmin(userRole) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Admin
              </span>
            )}
            <div className="text-sm text-gray-600">
              Welcome, {user?.name || 'Guest'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}