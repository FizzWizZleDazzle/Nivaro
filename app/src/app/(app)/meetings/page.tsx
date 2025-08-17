'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Meeting } from '@/types/meetings';
import { getMeetings } from '@/lib/meetings';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filter, setFilter] = useState<'all' | 'meeting' | 'workshop' | 'social'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (error) {
        console.error('Failed to load meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const filteredMeetings = filter === 'all' 
    ? meetings 
    : meetings.filter(meeting => meeting.type === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'workshop': return '🛠️';
      case 'social': return '🎉';
      default: return '📋';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading meetings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings & Events</h1>
            <p className="text-gray-600 mt-2">Discover and join club meetings, workshops, and social events</p>
          </div>
          <Link
            href="/meetings/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Meeting
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          {(['all', 'meeting', 'workshop', 'social'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && ` (${meetings.filter(m => m.type === type).length})`}
            </button>
          ))}
        </div>

        {/* Meetings Grid */}
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {filter === 'all' ? 'No meetings scheduled yet.' : `No ${filter}s scheduled yet.`}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTypeIcon(meeting.type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(meeting.type)}`}>
                      {meeting.type}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>{meeting.location}</span>
                  </div>
                  {meeting.maxAttendees && (
                    <div className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>Max {meeting.maxAttendees} attendees</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}