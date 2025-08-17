'use client';

import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Sample data - in a real app, this would come from your backend
interface DashboardStats {
  upcomingMeetings: number;
  activeProjects: number;
  unreadAnnouncements: number;
  forumQuestions: number;
}

interface RecentActivity {
  id: string;
  type: 'meeting' | 'project' | 'announcement' | 'forum';
  title: string;
  time: string;
  url: string;
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingMeetings: 3,
    activeProjects: 2,
    unreadAnnouncements: 5,
    forumQuestions: 8,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'meeting',
      title: 'Weekly Team Standup',
      time: '2 hours ago',
      url: '/meetings/1',
    },
    {
      id: '2',
      type: 'project',
      title: 'New project: Club Website',
      time: '5 hours ago',
      url: '/project-collaboration',
    },
    {
      id: '3',
      type: 'announcement',
      title: 'Club Elections Next Month',
      time: '1 day ago',
      url: '/announcements',
    },
    {
      id: '4',
      type: 'forum',
      title: 'Help needed with React hooks',
      time: '2 days ago',
      url: '/forum',
    },
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening in your clubs today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingMeetings}</p>
              </div>
            </div>
            <Link href="/meetings" className="mt-4 text-green-600 font-medium hover:text-green-700 transition-colors block">
              View all meetings →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
            <Link href="/project-collaboration" className="mt-4 text-purple-600 font-medium hover:text-purple-700 transition-colors block">
              View projects →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadAnnouncements}</p>
              </div>
            </div>
            <Link href="/announcements" className="mt-4 text-teal-600 font-medium hover:text-teal-700 transition-colors block">
              Read announcements →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Forum Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forumQuestions}</p>
              </div>
            </div>
            <Link href="/forum" className="mt-4 text-orange-600 font-medium hover:text-orange-700 transition-colors block">
              Join discussions →
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/meetings/create"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Create Meeting</p>
                  <p className="text-sm text-gray-600">Schedule new event</p>
                </div>
              </Link>

              <Link 
                href="/project-collaboration"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">New Project</p>
                  <p className="text-sm text-gray-600">Start collaborating</p>
                </div>
              </Link>

              <Link 
                href="/learning"
                className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Browse Courses</p>
                  <p className="text-sm text-gray-600">Continue learning</p>
                </div>
              </Link>

              <Link 
                href="/forum"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Ask Question</p>
                  <p className="text-sm text-gray-600">Get help from community</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.url}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {activity.type === 'meeting' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {activity.type === 'project' && (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {activity.type === 'announcement' && (
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    )}
                    {activity.type === 'forum' && (
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}