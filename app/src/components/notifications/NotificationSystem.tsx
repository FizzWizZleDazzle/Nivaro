import React, { useState, useCallback } from 'react';
import NotificationToast, { Notification } from './NotificationToast';

interface NotificationSystemProps {
  initialNotifications?: Notification[];
}

export default function NotificationSystem({ 
  initialNotifications = [] 
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Container - Fixed position for toasts */}
      <div className="fixed top-4 right-4 z-50 max-h-screen overflow-y-auto">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>

      {/* Export functions for external use */}
      <div style={{ display: 'none' }}>
        {/* This is a hack to expose functions - in a real app, you'd use context or state management */}
        <span data-add-notification={addNotification}></span>
        <span data-notifications-count={unreadCount}></span>
      </div>
    </>
  );
}

// Hook for using the notification system
export function useNotifications() {
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // In a real app, this would use context or a global state management solution
    const event = new CustomEvent('add-notification', { detail: notification });
    window.dispatchEvent(event);
  }, []);

  return { addNotification };
}