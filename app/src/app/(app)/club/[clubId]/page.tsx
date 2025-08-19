'use client';

import { useParams } from 'next/navigation';
import { useClub, useClubMembers, useClubEvents, useClubAnnouncements, useClubProjects } from '../../../../lib/hooks';
import { MemberRole } from '../../../../lib/types';
import { isAdmin } from '../../../../lib/auth';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ClubDashboard() {
  const params = useParams();
  const clubId = params.clubId as string;
  const { user } = useAuth();
  
  // Use API hooks to fetch data
  const { data: club, loading: clubLoading, error: clubError } = useClub(clubId);
  const { data: members, loading: membersLoading, error: membersError } = useClubMembers(clubId);
  const { data: events, loading: eventsLoading, error: eventsError } = useClubEvents(clubId);
  const { data: announcements, loading: announcementsLoading, error: announcementsError } = useClubAnnouncements(clubId);
  const { data: projects, loading: projectsLoading, error: projectsError } = useClubProjects(clubId);
  
  // Find user's membership
  const membership = members.find(m => m.clubId === clubId && m.userId === user?.id);
  const userRole = membership?.role || MemberRole.MEMBER;

  // Loading state
  if (clubLoading || membersLoading || eventsLoading || announcementsLoading || projectsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (clubError || membersError || eventsError || announcementsError || projectsError || !club) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Error loading club data</h1>
        <p className="text-gray-600 mt-2">
          {clubError || membersError || eventsError || announcementsError || projectsError || "Club not found"}
        </p>
      </div>
    );
  }

  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const pinnedAnnouncements = announcements
    .filter(a => a.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
            <p className="text-gray-600 mt-2">{club.description}</p>
            <div className="flex items-center mt-4 text-sm text-gray-500 space-x-6">
              <span>{members.length} members</span>
              <span>Created {new Date(club.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {isAdmin(userRole) && (
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                Add Content
              </button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">
                Invite Members
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()} at{' '}
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
          {pinnedAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {pinnedAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-3">
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No announcements</p>
          )}
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div key={project.id} className="border border-green-200 bg-green-50 rounded-md p-3">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {project.status}
                    </span>
                    <p className="text-xs text-gray-500">
                      Updated {project.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No active projects</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">
              <strong>Demo User</strong> created a new event &quot;Weekly Tech Meetup&quot;
            </span>
            <span className="text-gray-400">2 days ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              <strong>Alice Johnson</strong> joined the club
            </span>
            <span className="text-gray-400">1 week ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">
              <strong>Demo User</strong> posted a new announcement
            </span>
            <span className="text-gray-400">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}