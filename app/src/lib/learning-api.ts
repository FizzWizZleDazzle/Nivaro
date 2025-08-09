import { 
  Course, 
  Lesson, 
  CoursesResponse, 
  CreateCourseRequest, 
  CreateLessonRequest, 
  UpdateProgressRequest,
  UserProgress,
  Resource 
} from '../types/learning';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class LearningApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data.data || data;
  }

  // Course endpoints
  async getCourses(clubId?: string, page = 1, limit = 10): Promise<CoursesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (clubId) {
      params.append('club_id', clubId);
    }
    
    return this.request<CoursesResponse>(`/api/learning/courses?${params}`);
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.request<Course>(`/api/learning/courses/${courseId}`);
  }

  async createCourse(course: CreateCourseRequest): Promise<Course> {
    return this.request<Course>('/api/learning/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  }

  // Lesson endpoints
  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    return this.request<Lesson>(`/api/learning/courses/${courseId}/lessons/${lessonId}`);
  }

  async createLesson(lesson: CreateLessonRequest): Promise<Lesson> {
    return this.request<Lesson>(`/api/learning/courses/${lesson.courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  }

  // Progress endpoints
  async updateProgress(progress: UpdateProgressRequest): Promise<string> {
    return this.request<string>('/api/learning/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return this.request<UserProgress[]>(`/api/learning/progress/${userId}`);
  }

  // Resource endpoints
  async getResources(clubId: string): Promise<Resource[]> {
    return this.request<Resource[]>(`/api/learning/clubs/${clubId}/resources`);
  }

  async createResource(clubId: string, resource: Partial<Resource>): Promise<Resource> {
    return this.request<Resource>(`/api/learning/clubs/${clubId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }
}

export const learningApi = new LearningApiClient();