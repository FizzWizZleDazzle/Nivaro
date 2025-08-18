// API utilities for club management
import { Club, Member, Event, Announcement, Project } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  };

  // Add CSRF token for state-changing operations
  if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    try {
      const csrfResponse = await fetch(`${API_BASE}/csrf-token`, {
        credentials: 'include',
      });
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        config.headers = {
          ...config.headers,
          'X-CSRF-Token': csrfData.token,
        };
      }
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Use the default error message if parsing fails
    }
    throw new ApiError(errorMessage, response.status, response);
  }

  const data = await response.json();
  if (data.success === false) {
    throw new ApiError(data.error || 'API request failed', response.status, data);
  }

  return data.data || data;
}

// Club API functions
export const clubsApi = {
  // Get all clubs
  async getAll(): Promise<Club[]> {
    return apiRequest<Club[]>('/clubs');
  },

  // Get specific club
  async getById(clubId: string): Promise<Club> {
    return apiRequest<Club>(`/clubs/${clubId}`);
  },

  // Create new club
  async create(clubData: { name: string; description: string }): Promise<Club> {
    return apiRequest<Club>('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  },
};

// Members API functions  
export const membersApi = {
  // Get club members
  async getByClub(clubId: string): Promise<Member[]> {
    return apiRequest<Member[]>(`/clubs/${clubId}/members`);
  },

  // Join club with invite code
  async join(inviteCode: string): Promise<Member> {
    return apiRequest<Member>('/members/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  },
};

// Events API functions
export const eventsApi = {
  // Get club events
  async getByClub(clubId: string): Promise<Event[]> {
    return apiRequest<Event[]>(`/clubs/${clubId}/events`);
  },

  // Create new event
  async create(eventData: {
    club_id: string;
    title: string;
    description: string;
    date: string;
    location?: string;
  }): Promise<Event> {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
};

// Announcements API functions
export const announcementsApi = {
  // Get club announcements
  async getByClub(clubId: string): Promise<Announcement[]> {
    return apiRequest<Announcement[]>(`/clubs/${clubId}/announcements`);
  },

  // Create new announcement
  async create(announcementData: {
    club_id: string;
    title: string;
    content: string;
    pinned: boolean;
  }): Promise<Announcement> {
    return apiRequest<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },
};

// Projects API functions
export const projectsApi = {
  // Get club projects
  async getByClub(clubId: string): Promise<Project[]> {
    return apiRequest<Project[]>(`/clubs/${clubId}/projects`);
  },

  // Create new project
  async create(projectData: {
    club_id: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
  }): Promise<Project> {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
};

// Export the ApiError for error handling
export { ApiError };