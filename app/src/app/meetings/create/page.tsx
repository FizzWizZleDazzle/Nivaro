'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateMeetingRequest } from '@/types/meetings';
import { createMeeting } from '@/lib/meetings';

export default function CreateMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMeetingRequest>({
    title: '',
    description: '',
    type: 'meeting',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    agenda: '',
    maxAttendees: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meeting = await createMeeting(formData);
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  // Check if user is admin (mock implementation)
  const isAdmin = true; // In a real app, this would come from authentication

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Only administrators can create meetings.</p>
            <Link
              href="/meetings"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Meetings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
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

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Meeting</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter meeting title"
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="meeting">📅 Meeting</option>
                <option value="workshop">🛠️ Workshop</option>
                <option value="social">🎉 Social Event</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter meeting description"
              />
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter meeting location"
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees (optional)
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                min="1"
                value={formData.maxAttendees || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty for no limit"
              />
            </div>

            {/* Agenda */}
            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-2">
                Agenda (Markdown supported)
              </label>
              <textarea
                id="agenda"
                name="agenda"
                rows={8}
                value={formData.agenda}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="# Meeting Agenda&#10;&#10;## Topics&#10;1. Welcome&#10;2. Discussion items&#10;3. Next steps&#10;&#10;You can use **bold**, *italic*, and other markdown formatting."
              />
              <p className="text-sm text-gray-500 mt-2">
                You can use Markdown formatting: # for headings, ** for bold, * for italic, - for lists
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Meeting'}
              </button>
              <Link
                href="/meetings"
                className="flex-1 text-center bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}