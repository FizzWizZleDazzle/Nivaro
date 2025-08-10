import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock announcements components
const MockAnnouncementsList = () => {
  const [announcements, setAnnouncements] = React.useState([
    {
      id: '1',
      title: 'Welcome to Nivaro!',
      content: 'We are excited to launch this new club management platform...',
      author: 'Admin Team',
      createdAt: '2024-01-15T10:00:00Z',
      priority: 'high',
      tags: ['welcome', 'important'],
      pinned: true,
      read: false
    },
    {
      id: '2',
      title: 'New Feature: Project Collaboration',
      content: 'We have added new project collaboration tools including Kanban boards...',
      author: 'Development Team',
      createdAt: '2024-01-14T15:30:00Z',
      priority: 'medium',
      tags: ['feature', 'update'],
      pinned: false,
      read: true
    },
    {
      id: '3',
      title: 'Upcoming Maintenance Window',
      content: 'The platform will be under maintenance on January 20th from 2-4 AM EST...',
      author: 'Operations Team',
      createdAt: '2024-01-13T09:15:00Z',
      priority: 'low',
      tags: ['maintenance', 'scheduled'],
      pinned: false,
      read: false
    }
  ])

  const [filter, setFilter] = React.useState('all')
  const [unreadCount, setUnreadCount] = React.useState(
    announcements.filter(a => !a.read).length
  )

  const markAsRead = (announcementId: string) => {
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, read: true }
        : announcement
    ))
    setUnreadCount(prev => prev - 1)
  }

  const markAllAsRead = () => {
    setAnnouncements(prev => prev.map(announcement => ({ ...announcement, read: true })))
    setUnreadCount(0)
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'unread') return !announcement.read
    if (filter === 'pinned') return announcement.pinned
    return true
  }).sort((a, b) => {
    // Pinned announcements first
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div>
      <h1>Announcements & Notifications</h1>
      
      <div data-testid="announcement-stats">
        <span data-testid="unread-count">{unreadCount} unread</span>
        <button onClick={markAllAsRead} data-testid="mark-all-read">
          Mark All as Read
        </button>
      </div>

      <div data-testid="announcement-filters">
        <button 
          onClick={() => setFilter('all')}
          data-testid="filter-all"
          className={filter === 'all' ? 'active' : ''}
        >
          All ({announcements.length})
        </button>
        <button 
          onClick={() => setFilter('unread')}
          data-testid="filter-unread"
          className={filter === 'unread' ? 'active' : ''}
        >
          Unread ({announcements.filter(a => !a.read).length})
        </button>
        <button 
          onClick={() => setFilter('pinned')}
          data-testid="filter-pinned"
          className={filter === 'pinned' ? 'active' : ''}
        >
          Pinned ({announcements.filter(a => a.pinned).length})
        </button>
      </div>

      <div data-testid="announcements-list">
        {filteredAnnouncements.map(announcement => (
          <div 
            key={announcement.id} 
            data-testid={`announcement-${announcement.id}`}
            className={`announcement ${!announcement.read ? 'unread' : ''}`}
          >
            <div data-testid={`announcement-header-${announcement.id}`}>
              {announcement.pinned && (
                <span data-testid={`pinned-${announcement.id}`}>📌 Pinned</span>
              )}
              <span data-testid={`priority-${announcement.id}`} className={`priority-${announcement.priority}`}>
                {announcement.priority.toUpperCase()}
              </span>
              {!announcement.read && (
                <span data-testid={`unread-indicator-${announcement.id}`}>●</span>
              )}
            </div>
            
            <h3>{announcement.title}</h3>
            <p>{announcement.content}</p>
            
            <div data-testid={`announcement-meta-${announcement.id}`}>
              <span>By: {announcement.author}</span>
              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div data-testid={`announcement-tags-${announcement.id}`}>
              {announcement.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            {!announcement.read && (
              <button 
                onClick={() => markAsRead(announcement.id)}
                data-testid={`mark-read-${announcement.id}`}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div data-testid="no-announcements">No announcements found.</div>
      )}
    </div>
  )
}

const MockCreateAnnouncement = () => {
  const [announcementData, setAnnouncementData] = React.useState({
    title: '',
    content: '',
    priority: 'medium',
    tags: '',
    pinned: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setAnnouncementData(prev => ({
      ...prev,
      [e.target.name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = announcementData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    console.log('Creating announcement:', { ...announcementData, tags: tagsArray })
  }

  return (
    <div>
      <h1>Create New Announcement</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Announcement Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={announcementData.title}
            onChange={handleInputChange}
            placeholder="Enter announcement title"
            data-testid="announcement-title"
            required
          />
        </div>

        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={announcementData.content}
            onChange={handleInputChange}
            placeholder="Write your announcement content..."
            data-testid="announcement-content"
            rows={6}
            required
          />
        </div>

        <div>
          <label htmlFor="priority">Priority Level</label>
          <select
            id="priority"
            name="priority"
            value={announcementData.priority}
            onChange={handleInputChange}
            data-testid="announcement-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={announcementData.tags}
            onChange={handleInputChange}
            placeholder="e.g., important, feature, maintenance"
            data-testid="announcement-tags"
          />
        </div>

        <div>
          <label>
            <input
              name="pinned"
              type="checkbox"
              checked={announcementData.pinned}
              onChange={handleInputChange}
              data-testid="announcement-pinned"
            />
            Pin this announcement to the top
          </label>
        </div>

        <button type="submit" data-testid="create-announcement">
          Create Announcement
        </button>
      </form>
    </div>
  )
}

const MockNotificationCenter = () => {
  const [notifications, setNotifications] = React.useState([
    {
      id: '1',
      type: 'meeting',
      title: 'Meeting Reminder',
      message: 'Team meeting starts in 30 minutes',
      timestamp: '2024-01-15T14:30:00Z',
      read: false,
      actionUrl: '/meetings/1'
    },
    {
      id: '2',
      type: 'forum',
      title: 'New Answer',
      message: 'Someone answered your question about React state management',
      timestamp: '2024-01-15T13:45:00Z',
      read: false,
      actionUrl: '/forum/questions/1'
    },
    {
      id: '3',
      type: 'club',
      title: 'New Member',
      message: 'Alice Johnson joined your club',
      timestamp: '2024-01-15T12:00:00Z',
      read: true,
      actionUrl: '/club/members'
    }
  ])

  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: false,
    meetingReminders: true,
    forumUpdates: true,
    clubActivity: false
  })

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleSettingChange = (setting: string) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <h1>Notification Center</h1>
      
      <div data-testid="notification-header">
        <span data-testid="notification-count">{unreadCount} unread notifications</span>
        <button onClick={clearAllNotifications} data-testid="clear-all">
          Clear All
        </button>
      </div>

      <div data-testid="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            data-testid={`notification-${notification.id}`}
            className={`notification ${!notification.read ? 'unread' : ''}`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div data-testid={`notification-type-${notification.id}`} className={`type-${notification.type}`}>
              {notification.type}
            </div>
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span>{new Date(notification.timestamp).toLocaleString()}</span>
            {!notification.read && (
              <span data-testid={`unread-dot-${notification.id}`}>●</span>
            )}
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div data-testid="no-notifications">No notifications</div>
      )}

      <div data-testid="notification-settings">
        <h3>Notification Settings</h3>
        
        <label>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={() => handleSettingChange('emailNotifications')}
            data-testid="setting-email"
          />
          Email Notifications
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={() => handleSettingChange('pushNotifications')}
            data-testid="setting-push"
          />
          Push Notifications
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.meetingReminders}
            onChange={() => handleSettingChange('meetingReminders')}
            data-testid="setting-meetings"
          />
          Meeting Reminders
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.forumUpdates}
            onChange={() => handleSettingChange('forumUpdates')}
            data-testid="setting-forum"
          />
          Forum Updates
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.clubActivity}
            onChange={() => handleSettingChange('clubActivity')}
            data-testid="setting-club"
          />
          Club Activity
        </label>
      </div>
    </div>
  )
}

// Test 7: Test announcements and notifications
describe('Announcements and Notifications', () => {
  describe('Announcements List', () => {
    it('displays announcements with proper priority and status indicators', () => {
      render(<MockAnnouncementsList />)
      
      expect(screen.getByRole('heading', { name: /announcements & notifications/i })).toBeInTheDocument()
      expect(screen.getByText('Welcome to Nivaro!')).toBeInTheDocument()
      expect(screen.getByText('New Feature: Project Collaboration')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Maintenance Window')).toBeInTheDocument()
      
      // Check priority indicators
      expect(screen.getByTestId('priority-1')).toHaveTextContent('HIGH')
      expect(screen.getByTestId('priority-2')).toHaveTextContent('MEDIUM')
      expect(screen.getByTestId('priority-3')).toHaveTextContent('LOW')
      
      // Check pinned indicator
      expect(screen.getByTestId('pinned-1')).toBeInTheDocument()
    })

    it('shows unread count and allows marking all as read', async () => {
      const user = userEvent.setup()
      render(<MockAnnouncementsList />)
      
      expect(screen.getByTestId('unread-count')).toHaveTextContent('2 unread')
      
      await user.click(screen.getByTestId('mark-all-read'))
      
      await waitFor(() => {
        expect(screen.getByTestId('unread-count')).toHaveTextContent('0 unread')
      })
    })

    it('allows filtering announcements by status', async () => {
      const user = userEvent.setup()
      render(<MockAnnouncementsList />)
      
      // Filter to show only unread
      await user.click(screen.getByTestId('filter-unread'))
      
      await waitFor(() => {
        expect(screen.getByTestId('announcement-1')).toBeInTheDocument()
        expect(screen.queryByTestId('announcement-2')).not.toBeInTheDocument()
        expect(screen.getByTestId('announcement-3')).toBeInTheDocument()
      })
      
      // Filter to show only pinned
      await user.click(screen.getByTestId('filter-pinned'))
      
      await waitFor(() => {
        expect(screen.getByTestId('announcement-1')).toBeInTheDocument()
        expect(screen.queryByTestId('announcement-2')).not.toBeInTheDocument()
        expect(screen.queryByTestId('announcement-3')).not.toBeInTheDocument()
      })
    })

    it('allows marking individual announcements as read', async () => {
      const user = userEvent.setup()
      render(<MockAnnouncementsList />)
      
      expect(screen.getByTestId('unread-indicator-1')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('mark-read-1'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('unread-indicator-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('unread-count')).toHaveTextContent('1 unread')
      })
    })

    it('displays announcement metadata and tags', () => {
      render(<MockAnnouncementsList />)
      
      expect(screen.getByText('By: Admin Team')).toBeInTheDocument()
      expect(screen.getByText('By: Development Team')).toBeInTheDocument()
      expect(screen.getByText('By: Operations Team')).toBeInTheDocument()
      
      // Check tags
      expect(screen.getByTestId('announcement-tags-1')).toHaveTextContent('welcomeimportant')
      expect(screen.getByTestId('announcement-tags-2')).toHaveTextContent('featureupdate')
      expect(screen.getByTestId('announcement-tags-3')).toHaveTextContent('maintenancescheduled')
    })
  })

  describe('Create Announcement', () => {
    it('renders announcement creation form', () => {
      render(<MockCreateAnnouncement />)
      
      expect(screen.getByRole('heading', { name: /create new announcement/i })).toBeInTheDocument()
      expect(screen.getByTestId('announcement-title')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-content')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-priority')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-tags')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-pinned')).toBeInTheDocument()
    })

    it('allows filling out announcement form', async () => {
      const user = userEvent.setup()
      render(<MockCreateAnnouncement />)
      
      await user.type(screen.getByTestId('announcement-title'), 'Important Update')
      await user.type(screen.getByTestId('announcement-content'), 'This is an important announcement about platform changes...')
      await user.selectOptions(screen.getByTestId('announcement-priority'), 'high')
      await user.type(screen.getByTestId('announcement-tags'), 'update, important, platform')
      await user.click(screen.getByTestId('announcement-pinned'))
      
      expect(screen.getByDisplayValue('Important Update')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is an important announcement about platform changes...')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-priority')).toHaveValue('high')
      expect(screen.getByDisplayValue('update, important, platform')).toBeInTheDocument()
      expect(screen.getByTestId('announcement-pinned')).toBeChecked()
    })

    it('submits announcement with parsed tags and settings', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockCreateAnnouncement />)
      
      await user.type(screen.getByTestId('announcement-title'), 'Test Announcement')
      await user.type(screen.getByTestId('announcement-content'), 'Test content')
      await user.selectOptions(screen.getByTestId('announcement-priority'), 'high')
      await user.type(screen.getByTestId('announcement-tags'), 'tag1, tag2, tag3')
      await user.click(screen.getByTestId('announcement-pinned'))
      await user.click(screen.getByTestId('create-announcement'))
      
      expect(consoleSpy).toHaveBeenCalledWith('Creating announcement:', {
        title: 'Test Announcement',
        content: 'Test content',
        priority: 'high',
        pinned: true,
        tags: ['tag1', 'tag2', 'tag3']
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Notification Center', () => {
    it('displays notifications with proper type indicators', () => {
      render(<MockNotificationCenter />)
      
      expect(screen.getByRole('heading', { name: /notification center/i })).toBeInTheDocument()
      expect(screen.getByText('Meeting Reminder')).toBeInTheDocument()
      expect(screen.getByText('New Answer')).toBeInTheDocument()
      expect(screen.getByText('New Member')).toBeInTheDocument()
      
      expect(screen.getByTestId('notification-type-1')).toHaveTextContent('meeting')
      expect(screen.getByTestId('notification-type-2')).toHaveTextContent('forum')
      expect(screen.getByTestId('notification-type-3')).toHaveTextContent('club')
    })

    it('shows unread notification count', () => {
      render(<MockNotificationCenter />)
      
      expect(screen.getByTestId('notification-count')).toHaveTextContent('2 unread notifications')
      expect(screen.getByTestId('unread-dot-1')).toBeInTheDocument()
      expect(screen.getByTestId('unread-dot-2')).toBeInTheDocument()
      expect(screen.queryByTestId('unread-dot-3')).not.toBeInTheDocument()
    })

    it('allows marking notifications as read by clicking', async () => {
      const user = userEvent.setup()
      render(<MockNotificationCenter />)
      
      expect(screen.getByTestId('unread-dot-1')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('notification-1'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('unread-dot-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('notification-count')).toHaveTextContent('1 unread notification')
      })
    })

    it('allows clearing all notifications', async () => {
      const user = userEvent.setup()
      render(<MockNotificationCenter />)
      
      expect(screen.getByTestId('notification-1')).toBeInTheDocument()
      expect(screen.getByTestId('notification-2')).toBeInTheDocument()
      expect(screen.getByTestId('notification-3')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('clear-all'))
      
      await waitFor(() => {
        expect(screen.getByTestId('no-notifications')).toBeInTheDocument()
        expect(screen.getByText('No notifications')).toBeInTheDocument()
      })
    })

    it('displays notification settings and allows toggling them', async () => {
      const user = userEvent.setup()
      render(<MockNotificationCenter />)
      
      expect(screen.getByText('Notification Settings')).toBeInTheDocument()
      expect(screen.getByTestId('setting-email')).toBeChecked()
      expect(screen.getByTestId('setting-push')).not.toBeChecked()
      expect(screen.getByTestId('setting-meetings')).toBeChecked()
      expect(screen.getByTestId('setting-forum')).toBeChecked()
      expect(screen.getByTestId('setting-club')).not.toBeChecked()
      
      // Toggle push notifications
      await user.click(screen.getByTestId('setting-push'))
      
      await waitFor(() => {
        expect(screen.getByTestId('setting-push')).toBeChecked()
      })
      
      // Toggle email notifications
      await user.click(screen.getByTestId('setting-email'))
      
      await waitFor(() => {
        expect(screen.getByTestId('setting-email')).not.toBeChecked()
      })
    })
  })
})