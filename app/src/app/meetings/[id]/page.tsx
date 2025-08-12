import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Meeting, RSVP } from '@/types/meetings';
import { getMeeting, getRSVPs, createRSVP } from '@/lib/meetings';

export async function generateStaticParams() {
  return [];
}

'use client';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const loadMeetingData = async () => {
      try {
        const [meetingData, rsvpData] = await Promise.all([
          getMeeting(meetingId),
          getRSVPs(meetingId)
        ]);

        if (!meetingData) {
          router.push('/meetings');
          return;
        }

        setMeeting(meetingData);
        setRSVPs(rsvpData);
        
        // Find current user's RSVP (mock implementation)
        const currentUserRSVP = rsvpData.find(rsvp => rsvp.userId === 'current-user');
        setUserRSVP(currentUserRSVP || null);
      } catch (error) {
        console.error('Failed to load meeting data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetingData();
  }, [meetingId, router]);

  const handleRSVP = async (status: 'attending' | 'not-attending' | 'maybe') => {
    if (!meeting) return;

    setRsvpLoading(true);
    try {
      const newRSVP = await createRSVP(meeting.id, { status });
      setUserRSVP(newRSVP);
      
      // Update RSVPs list
      const updatedRSVPs = rsvps.filter(rsvp => rsvp.userId !== 'current-user');
      updatedRSVPs.push(newRSVP);
      setRSVPs(updatedRSVPs);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    } finally {
      setRsvpLoading(false);
    }
  };

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

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for headings and lists
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  const getRSVPCounts = () => {
    const attending = rsvps.filter(r => r.status === 'attending').length;
    const notAttending = rsvps.filter(r => r.status === 'not-attending').length;
    const maybe = rsvps.filter(r => r.status === 'maybe').length;
    return { attending, notAttending, maybe };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Meeting not found.</div>
        </div>
      </div>
    );
  }

  const { attending, notAttending, maybe } = getRSVPCounts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/meetings"
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Meetings</span>
          </Link>
        </div>

        {/* Meeting Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getTypeIcon(meeting.type)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(meeting.type)}`}>
                {meeting.type}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{meeting.title}</h1>
          <p className="text-gray-700 text-lg mb-6">{meeting.description}</p>

          {/* Meeting Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📅</span>
                <span className="text-gray-900 font-medium">{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🕒</span>
                <span className="text-gray-900 font-medium">
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <span className="text-gray-900 font-medium">{meeting.location}</span>
              </div>
              {meeting.maxAttendees && (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">👥</span>
                  <span className="text-gray-900 font-medium">Max {meeting.maxAttendees} attendees</span>
                </div>
              )}
            </div>

            {/* RSVP Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">RSVPs</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Attending:</span>
                  <span className="font-medium">{attending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Maybe:</span>
                  <span className="font-medium">{maybe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Not Attending:</span>
                  <span className="font-medium">{notAttending}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Buttons */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
            {userRSVP && (
              <p className="text-sm text-gray-600 mb-4">
                Current status: <span className="font-medium">{userRSVP.status}</span>
              </p>
            )}
            <div className="flex space-x-4">
              <button
                onClick={() => handleRSVP('attending')}
                disabled={rsvpLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  userRSVP?.status === 'attending'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                ✓ Attending
              </button>
              <button
                onClick={() => handleRSVP('maybe')}
                disabled={rsvpLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  userRSVP?.status === 'maybe'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                ? Maybe
              </button>
              <button
                onClick={() => handleRSVP('not-attending')}
                disabled={rsvpLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  userRSVP?.status === 'not-attending'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                ✗ Not Attending
              </button>
            </div>
          </div>
        </div>

        {/* Agenda */}
        {meeting.agenda && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agenda</h2>
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(meeting.agenda) }}
            />
          </div>
        )}

        {/* Meeting Summary */}
        {meeting.summary && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Summary</h2>
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(meeting.summary) }}
            />
          </div>
        )}

        {/* Recording */}
        {meeting.recordingUrl && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recording</h2>
            <a
              href={meeting.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Recording
            </a>
          </div>
        )}
      </div>
    </div>
  );
}