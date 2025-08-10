# Announcements & Notifications System

This directory contains the announcements and notifications system components for Nivaro.

## Components Overview

### Announcements
- **AnnouncementCard.tsx**: Displays individual announcements with type-based styling
- **AnnouncementsSection.tsx**: Container for displaying multiple announcements

### Notifications
- **NotificationToast.tsx**: Individual notification component with auto-close functionality
- **NotificationCenter.tsx**: Dropdown notification center with filtering and management
- **NotificationSystem.tsx**: Main system for managing notifications state

## Usage

### Basic Announcements
```tsx
import AnnouncementsSection from './components/announcements/AnnouncementsSection';
import { Announcement } from './components/announcements/AnnouncementCard';

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'System Update',
    content: 'New features have been released!',
    type: 'info',
    timestamp: new Date(),
    author: 'Admin'
  }
];

<AnnouncementsSection announcements={announcements} />
```

### Notification System
```tsx
import NotificationSystem from './components/notifications/NotificationSystem';
import NotificationCenter from './components/notifications/NotificationCenter';

// In your main layout or app component
<NotificationSystem initialNotifications={[]} />
<NotificationCenter 
  notifications={notifications}
  onMarkAsRead={handleMarkAsRead}
  onMarkAllAsRead={handleMarkAllAsRead}
  onClear={handleClear}
  onClearAll={handleClearAll}
/>
```

## Features

### Announcements
- Type-based styling (info, warning, success, error)
- Timestamp formatting
- Author attribution
- Responsive design

### Notifications
- Real-time notifications
- Read/unread status tracking
- Filtering (all/unread)
- Auto-close functionality
- Toast notifications
- Notification center dropdown
- Bulk actions (mark all read, clear all)

## Styling

All components use Tailwind CSS for styling and are fully responsive. The color scheme follows a consistent pattern:
- Blue: Info notifications/announcements
- Green: Success notifications/announcements
- Yellow: Warning notifications/announcements
- Red: Error notifications/announcements

## Data Types

See the individual component files for complete TypeScript interface definitions:
- `Announcement` interface in `AnnouncementCard.tsx`
- `Notification` interface in `NotificationToast.tsx`