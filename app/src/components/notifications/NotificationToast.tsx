import React, { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  autoClose?: boolean;
  duration?: number; // in milliseconds
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationToast({ 
  notification, 
  onClose, 
  onMarkAsRead 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoClose && notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300); // Wait for fade out animation
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.autoClose, notification.duration, notification.id, onClose]);

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full shadow-lg rounded-lg border-l-4 p-4 mb-4
        ${getTypeStyles(notification.type)}
        ${!notification.read ? 'ring-2 ring-blue-300' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(notification.timestamp)}
          </p>
        </div>
        
        <div className="flex ml-2 space-x-1">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Mark as read"
            >
              ✓
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}