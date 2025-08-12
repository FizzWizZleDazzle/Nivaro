'use client';

import { useParams } from 'next/navigation';
import { mockClubs, mockEvents, mockAnnouncements, mockProjects, mockMembers } from '../../../lib/mockData';
import { MemberRole } from '../../../lib/types';
import { isAdmin } from '../../../lib/auth';
import { useAuth } from '../../../contexts/AuthContext';

export default function ClubDashboard() {
  const params = useParams();
  const clubId = params.clubId as string;
  const { user } = useAuth();
  
  // Find the club and user's membership
  const club = mockClubs.find(c => c.id === clubId);
  const membership = mockMembers.find(m => m.clubId === clubId && m.userId === user?.id);
  const userRole = membership?.role || MemberRole.MEMBER;
  
  // Filter data for this club
  const clubEvents = mockEvents.filter(e => e.clubId === clubId);
  const clubAnnouncements = mockAnnouncements.filter(a => a.clubId === clubId);
  const clubProjects = mockProjects.filter(p => p.clubId === clubId);
  const clubMembers = mockMembers.filter(m => m.clubId === clubId);

  if (!club) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Club not found</h1>
        <p className="text-gray-600 mt-2">The club you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  const upcomingEvents = clubEvents
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const pinnedAnnouncements = clubAnnouncements
    .filter(a => a.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeProjects = clubProjects.filter(p => p.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
            <p className="text-gray-600 mt-2">{club.description}</p>
            <div className="flex items-center mt-4 text-sm text-gray-500 space-x-6">
              <span>{clubMembers.length} members</span>
              <span>Created {club.createdAt.toLocaleDateString()}</span>
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
                    {announcement.createdAt.toLocaleDateString()}
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