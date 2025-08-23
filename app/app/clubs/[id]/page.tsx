'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clubService, Club, Member, Announcement, Project } from '@/lib/clubs';
import Navigation from '@/components/Navigation';
import CurriculumBuilder from '@/components/curriculum/CurriculumBuilder';
import AssignmentManager from '@/components/assignments/AssignmentManager';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Bell, 
  BookOpen, 
  FolderOpen,
  Settings,
  Plus,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function ClubDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;
  
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && clubId) {
      loadClubData();
    }
  }, [user, clubId]);

  const loadClubData = async () => {
    try {
      const [clubData, membersData, announcementsData, projectsData] = await Promise.all([
        clubService.getClub(clubId),
        clubService.getMembers(clubId),
        clubService.getAnnouncements(clubId),
        clubService.getProjects(clubId),
      ]);
      
      setClub(clubData);
      setMembers(membersData);
      setAnnouncements(announcementsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load club data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">Club not found</p>
        </div>
      </div>
    );
  }

  const isOwner = club.owner_id === user.id;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FolderOpen },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/clubs"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clubs
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
              <p className="text-gray-600 mt-2">{club.description}</p>
            </div>
            {isOwner && (
              <Link
                href={`/clubs/${clubId}/settings`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Announcements */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-indigo-600" />
                      Announcements
                    </h2>
                    {isOwner && (
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">
                        <Plus className="w-4 h-4 inline mr-1" />
                        New
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    {announcements.length > 0 ? (
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="border-l-4 border-indigo-500 pl-4">
                            <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                            <p className="text-gray-600 mt-1">{announcement.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No announcements yet</p>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">
                      <Plus className="w-4 h-4 inline mr-1" />
                      New Project
                    </button>
                  </div>
                  <div className="p-6">
                    {projects.length > 0 ? (
                      <div className="space-y-3">
                        {projects.map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.description}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No projects yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Members */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Members ({members.length})</h2>
                  </div>
                  <div className="p-6">
                    {members.length > 0 ? (
                      <div className="space-y-3">
                        {members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {member.user?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <span className="ml-3 text-sm text-gray-900">
                                {member.user?.name || 'Unknown'}
                              </span>
                            </div>
                            {member.role === 'admin' && (
                              <span className="text-xs text-indigo-600">Admin</span>
                            )}
                          </div>
                        ))}
                        {members.length > 5 && (
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all members
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No members yet</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                {isOwner && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        Invite Members
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        Create Assignment
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        Schedule Event
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        Post Announcement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <CurriculumBuilder clubId={clubId} isOwner={isOwner} />
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">All Members</h2>
                {isOwner && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Invite
                  </button>
                )}
              </div>
              <div className="p-6">
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {member.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {member.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No members yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <AssignmentManager clubId={clubId} isOwner={isOwner} />
          )}

          {/* Other tabs would have similar content structures */}
          {(activeTab === 'discussions' || activeTab === 'events') && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}