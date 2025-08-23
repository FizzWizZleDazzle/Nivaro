import axios from 'axios';
import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface Club {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Member {
  id: string;
  user_id: string;
  club_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateClubData {
  name: string;
  description: string;
}

export interface Announcement {
  id: string;
  club_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  pinned: boolean;
  author?: {
    name: string;
    avatar?: string;
  };
}

export interface Project {
  id: string;
  club_id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  created_by: string;
  created_at: string;
  updated_at: string;
}

class ClubService {
  async getClubs(): Promise<Club[]> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      return [];
    }
  }

  async getClub(clubId: string): Promise<Club | null> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch club:', error);
      return null;
    }
  }

  async createClub(data: CreateClubData): Promise<Club | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/clubs`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create club:', error);
      return null;
    }
  }

  async getMembers(clubId: string): Promise<Member[]> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}/members`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return [];
    }
  }

  async inviteMember(clubId: string, email: string): Promise<boolean> {
    try {
      const csrfToken = await authService.getCsrfToken();
      await axios.post(
        `${API_URL}/api/clubs/${clubId}/invite`,
        { email },
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to invite member:', error);
      return false;
    }
  }

  async getAnnouncements(clubId: string): Promise<Announcement[]> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}/announcements`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      return [];
    }
  }

  async createAnnouncement(clubId: string, data: { title: string; content: string; pinned?: boolean }): Promise<Announcement | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/clubs/${clubId}/announcements`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create announcement:', error);
      return null;
    }
  }

  async getProjects(clubId: string): Promise<Project[]> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}/projects`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  async createProject(clubId: string, data: { name: string; description: string; status: Project['status'] }): Promise<Project | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/clubs/${clubId}/projects`,
        { ...data, club_id: clubId },
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }
}

export const clubService = new ClubService();