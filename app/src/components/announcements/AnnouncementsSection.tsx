import React from 'react';
import AnnouncementCard, { Announcement } from './AnnouncementCard';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  title?: string;
}

export default function AnnouncementsSection({ 
  announcements, 
  title = "Announcements" 
}: AnnouncementsSectionProps) {
  if (announcements.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-gray-500 text-center py-8">
          No announcements at this time.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </section>
  );
}