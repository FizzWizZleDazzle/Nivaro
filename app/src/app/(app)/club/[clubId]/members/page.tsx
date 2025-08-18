'use client';

import { useParams } from 'next/navigation';
import { useClub, useClubMembers } from '../../../../../lib/hooks';
import { MemberRole } from '../../../../../lib/types';
import { isAdmin } from '../../../../../lib/auth';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function MembersPage() {
  const params = useParams();
  const clubId = params.clubId as string;
  const { user } = useAuth();
  
  // Use API hooks to fetch data
  const { data: club, loading: clubLoading, error: clubError } = useClub(clubId);
  const { data: members, loading: membersLoading, error: membersError } = useClubMembers(clubId);
  
  // Find user's membership
  const membership = members.find(m => m.clubId === clubId && m.userId === user?.id);
  const userRole = membership?.role || MemberRole.MEMBER;

  // Loading state
  if (clubLoading || membersLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (clubError || membersError || !club) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Error loading data</h1>
        <p className="text-gray-600 mt-2">{clubError || membersError || "Club not found"}</p>
      </div>
    );
  }

  const adminMembers = members.filter(m => m.role === MemberRole.ADMIN);
  const regularMembers = members.filter(m => m.role === MemberRole.MEMBER);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">
            {members.length} member{members.length !== 1 ? 's' : ''} in {club.name}
          </p>
        </div>
        {isAdmin(userRole) && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Invite Members
          </button>
        )}
      </div>

      {/* Admins Section */}
      {adminMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Administrators</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {adminMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {member.user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.user.name}</h3>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {member.joinedAt.toLocaleDateString()}
                  </span>
                  {isAdmin(userRole) && member.userId !== user?.id && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {regularMembers.length > 0 ? (
            regularMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {member.user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.user.name}</h3>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Member
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {member.joinedAt.toLocaleDateString()}
                  </span>
                  {isAdmin(userRole) && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No members yet.</p>
              {isAdmin(userRole) && (
                <button className="mt-2 text-blue-600 hover:text-blue-500 text-sm">
                  Invite the first member
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Code Section */}
      {isAdmin(userRole) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Club Invite Code</h3>
          <div className="flex items-center justify-between">
            <div>
              <code className="bg-white px-3 py-1 rounded border text-blue-900 font-mono">
                TECH2024
              </code>
              <p className="text-sm text-blue-700 mt-1">
                Share this code with people you want to invite to the club.
              </p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}