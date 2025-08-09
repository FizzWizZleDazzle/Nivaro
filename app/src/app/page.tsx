'use client';

import React, { useState } from 'react';
import AnnouncementsSection from '../components/announcements/AnnouncementsSection';
import NotificationSystem from '../components/notifications/NotificationSystem';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { sampleAnnouncements, sampleNotifications, createSampleNotification } from '../data/sampleData';
import { Notification } from '../components/notifications/NotificationToast';

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleClear = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const addTestNotification = () => {
    const newNotification = createSampleNotification();
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Notification Center */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Nivaro</h1>
              <span className="ml-3 text-sm text-gray-500">Announcements & Notifications</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={addTestNotification}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Notification
              </button>
              
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClear={handleClear}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Nivaro</h2>
          <p className="text-lg text-gray-600 mb-6">
            Stay updated with the latest announcements and manage your notifications seamlessly.
          </p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">System Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📢 Announcements</h4>
                <p className="text-sm text-gray-600">
                  Important updates and information are displayed in a clear, organized format.
                  Each announcement includes type indicators, timestamps, and author information.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔔 Notifications</h4>
                <p className="text-sm text-gray-600">
                  Real-time notifications keep you informed of key activities.
                  Features include toast notifications, notification center, and read/unread status.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <AnnouncementsSection announcements={sampleAnnouncements} />

        {/* Demo Section */}
        <section className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Try the System</h3>
            <p className="text-gray-600 mb-4">
              Click the &quot;Test Notification&quot; button in the header to see how notifications work.
              Use the notification bell icon to access the notification center.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Info notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Success notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Warning notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Error notifications</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Notification System */}
      <NotificationSystem initialNotifications={[]} />
    </div>
  );
}
