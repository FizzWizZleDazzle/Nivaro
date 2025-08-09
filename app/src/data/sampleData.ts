import { Announcement } from '../components/announcements/AnnouncementCard';
import { Notification } from '../components/notifications/NotificationToast';

// Sample announcements data
export const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to Nivaro',
    content: 'We\'re excited to launch our new platform! Explore the features and let us know what you think.',
    type: 'success',
    timestamp: new Date('2024-01-15T10:00:00'),
    author: 'Nivaro Team'
  },
  {
    id: '2',
    title: 'Scheduled Maintenance',
    content: 'We will be performing scheduled maintenance on Sunday, January 21st from 2:00 AM to 4:00 AM PST. Some services may be temporarily unavailable.',
    type: 'warning',
    timestamp: new Date('2024-01-18T14:30:00'),
    author: 'System Administrator'
  },
  {
    id: '3',
    title: 'New Features Released',
    content: 'Check out our latest updates including improved notifications and announcement system. We\'ve also enhanced the user interface for better accessibility.',
    type: 'info',
    timestamp: new Date('2024-01-20T09:15:00'),
    author: 'Product Team'
  }
];

// Sample notifications data
export const sampleNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Welcome!',
    message: 'Thanks for joining Nivaro. Explore the platform and discover what we have to offer.',
    type: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    autoClose: false
  },
  {
    id: 'n2',
    title: 'Profile Setup',
    message: 'Complete your profile to get the most out of your Nivaro experience.',
    type: 'info',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    autoClose: false
  },
  {
    id: 'n3',
    title: 'System Update',
    message: 'The platform has been updated with new features and improvements.',
    type: 'info',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
    autoClose: false
  },
  {
    id: 'n4',
    title: 'Tips & Tricks',
    message: 'Learn how to make the most of the announcements and notifications system.',
    type: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    autoClose: false
  }
];

// Function to create a sample notification for testing
export function createSampleNotification(): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  const notifications = [
    {
      title: 'Test Notification',
      message: 'This is a test notification to demonstrate the system.',
      type: 'info' as const,
      autoClose: true,
      duration: 5000
    },
    {
      title: 'Success!',
      message: 'Your action was completed successfully.',
      type: 'success' as const,
      autoClose: true,
      duration: 4000
    },
    {
      title: 'Warning',
      message: 'Please review your settings to ensure everything is configured correctly.',
      type: 'warning' as const,
      autoClose: true,
      duration: 6000
    }
  ];
  
  return notifications[Math.floor(Math.random() * notifications.length)];
}