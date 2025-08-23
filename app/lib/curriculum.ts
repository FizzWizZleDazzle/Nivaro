import axios from 'axios';
import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface Curriculum {
  id: string;
  club_id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  modules?: Module[];
}

export interface Module {
  id: string;
  curriculum_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment';
  video_url?: string;
  duration_minutes?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  club_id: string;
  lesson_id?: string;
  title: string;
  description: string;
  due_date?: string;
  max_points: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content?: string;
  file_url?: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  points_earned?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  graded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  time_spent_minutes: number;
}

class CurriculumService {
  // Curriculum methods
  async getCurriculum(clubId: string): Promise<Curriculum | null> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}/curriculum`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
      return null;
    }
  }

  async createCurriculum(clubId: string, data: { title: string; description?: string }): Promise<Curriculum | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/clubs/${clubId}/curriculum`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create curriculum:', error);
      return null;
    }
  }

  async updateCurriculum(clubId: string, curriculumId: string, data: Partial<Curriculum>): Promise<Curriculum | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/clubs/${clubId}/curriculum/${curriculumId}`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update curriculum:', error);
      return null;
    }
  }

  // Module methods
  async createModule(curriculumId: string, data: { title: string; description?: string; order_index: number }): Promise<Module | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/curriculum/${curriculumId}/modules`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create module:', error);
      return null;
    }
  }

  async updateModule(moduleId: string, data: Partial<Module>): Promise<Module | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/modules/${moduleId}`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update module:', error);
      return null;
    }
  }

  async deleteModule(moduleId: string): Promise<boolean> {
    try {
      const csrfToken = await authService.getCsrfToken();
      await axios.delete(
        `${API_URL}/api/modules/${moduleId}`,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to delete module:', error);
      return false;
    }
  }

  // Lesson methods
  async createLesson(moduleId: string, data: {
    title: string;
    content: string;
    lesson_type: Lesson['lesson_type'];
    video_url?: string;
    duration_minutes?: number;
    order_index: number;
  }): Promise<Lesson | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/modules/${moduleId}/lessons`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create lesson:', error);
      return null;
    }
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>): Promise<Lesson | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/lessons/${lessonId}`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update lesson:', error);
      return null;
    }
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    try {
      const csrfToken = await authService.getCsrfToken();
      await axios.delete(
        `${API_URL}/api/lessons/${lessonId}`,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      return false;
    }
  }

  // Assignment methods
  async getAssignments(clubId: string): Promise<Assignment[]> {
    try {
      const response = await axios.get(`${API_URL}/api/clubs/${clubId}/assignments`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      return [];
    }
  }

  async createAssignment(clubId: string, data: {
    title: string;
    description: string;
    lesson_id?: string;
    due_date?: string;
    max_points?: number;
  }): Promise<Assignment | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/clubs/${clubId}/assignments`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      return null;
    }
  }

  // Submission methods
  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    try {
      const response = await axios.get(`${API_URL}/api/assignments/${assignmentId}/submissions`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return [];
    }
  }

  async submitAssignment(assignmentId: string, data: {
    content?: string;
    file_url?: string;
  }): Promise<Submission | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.post(
        `${API_URL}/api/assignments/${assignmentId}/submit`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      return null;
    }
  }

  async gradeSubmission(submissionId: string, data: {
    points_earned: number;
    feedback?: string;
  }): Promise<Submission | null> {
    try {
      const csrfToken = await authService.getCsrfToken();
      const response = await axios.put(
        `${API_URL}/api/submissions/${submissionId}/grade`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to grade submission:', error);
      return null;
    }
  }

  // Progress tracking
  async getUserProgress(userId: string, clubId: string): Promise<UserProgress[]> {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}/clubs/${clubId}/progress`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      return [];
    }
  }

  async markLessonComplete(lessonId: string): Promise<boolean> {
    try {
      const csrfToken = await authService.getCsrfToken();
      await axios.post(
        `${API_URL}/api/lessons/${lessonId}/complete`,
        {},
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      return false;
    }
  }
}

export const curriculumService = new CurriculumService();