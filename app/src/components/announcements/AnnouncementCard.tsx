import React from 'react';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  author?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${getTypeStyles(announcement.type)}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{announcement.title}</h3>
        <span className="text-sm text-gray-500">{formatDate(announcement.timestamp)}</span>
      </div>
      
      <p className="mb-2 leading-relaxed">{announcement.content}</p>
      
      {announcement.author && (
        <div className="text-sm text-gray-600">
          — {announcement.author}
        </div>
      )}
    </div>
  );
}