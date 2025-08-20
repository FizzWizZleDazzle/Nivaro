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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? 'https://nivaroapi.fizzwizzledazzle.com'
    : process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
    ? 'https://nivaroapi.fizzwizzledazzle.dev'
    : 'http://localhost:8788');

// Mock data for demonstration
const mockCourses: Course[] = [
  {
    id: "course1",
    title: "Introduction to Programming",
    description: "Learn the basics of programming with hands-on exercises and real-world examples. Perfect for beginners who want to start their coding journey.",
    clubId: "club1",
    isPublished: true,
    difficulty: "Beginner",
    estimatedDuration: 120,
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    lessons: [
      {
        id: "lesson1",
        courseId: "course1",
        title: "Getting Started",
        description: "Your first lesson in programming",
        content: {
          richText: "<h1>Welcome!</h1><p>This is your first lesson in programming. Let's start with the basics.</p>",
          codeSnippets: [
            {
              id: "code1",
              language: "javascript",
              code: "console.log('Hello, World!');",
              title: "Hello World",
              description: "Your first program"
            }
          ]
        },
        order: 1,
        isPublished: true,
        estimatedDuration: 30,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      }
    ]
  },
  {
    id: "course2",
    title: "Advanced Web Development",
    description: "Master modern web development with React, TypeScript, and advanced patterns. Build scalable applications with industry best practices.",
    clubId: "club1",
    isPublished: true,
    difficulty: "Advanced",
    estimatedDuration: 300,
    createdBy: "admin",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    lessons: [
      {
        id: "lesson2",
        courseId: "course2",
        title: "React Hooks Deep Dive",
        description: "Understanding advanced React patterns",
        content: {
          richText: "<h2>Advanced React Hooks</h2><p>Learn how to build custom hooks and optimize your React applications.</p>",
          codeSnippets: [
            {
              id: "code2",
              language: "typescript",
              code: "const useCustomHook = () => {\n  const [state, setState] = useState();\n  return { state, setState };\n};",
              title: "Custom Hook",
              description: "Building reusable logic"
            }
          ]
        },
        order: 1,
        isPublished: true,
        estimatedDuration: 45,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15")
      }
    ]
  },
  {
    id: "course3",
    title: "Data Structures & Algorithms",
    description: "Build a strong foundation in computer science fundamentals. Learn essential data structures and algorithms used in software engineering.",
    clubId: "club1",
    isPublished: true,
    difficulty: "Intermediate",
    estimatedDuration: 180,
    createdBy: "admin",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    lessons: []
  }
];

class LearningApiClient {
  private useMockData = true; // Toggle for development

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (this.useMockData) {
      return this.getMockData<T>(endpoint, options);
    }

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

  private getMockData<T>(endpoint: string, options: RequestInit): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint.includes('/api/learning/courses') && !endpoint.includes('/courses/')) {
          const response: CoursesResponse = {
            courses: mockCourses,
            total: mockCourses.length,
            page: 1,
            limit: 10
          };
          resolve(response as T);
        } else if (endpoint.includes('/courses/course1')) {
          resolve(mockCourses[0] as T);
        } else if (endpoint.includes('/courses/course2')) {
          resolve(mockCourses[1] as T);
        } else if (endpoint.includes('/courses/course3')) {
          resolve(mockCourses[2] as T);
        } else if (options.method === 'POST' && endpoint.includes('/courses')) {
          const newCourse: Course = {
            id: `course_${Date.now()}`,
            title: "New Course",
            description: "A newly created course",
            clubId: "club1",
            isPublished: false,
            difficulty: "Beginner",
            estimatedDuration: 60,
            createdBy: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lessons: []
          };
          resolve(newCourse as T);
        } else {
          resolve("Success" as T);
        }
      }, 500); // Simulate network delay
    });
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