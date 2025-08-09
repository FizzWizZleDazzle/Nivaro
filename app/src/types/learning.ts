// Learning & Courses Module Types

export interface Club {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  clubId: string;
  isPublished: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number; // in minutes
  createdBy: string; // admin user id
  createdAt: Date;
  updatedAt: Date;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: LessonContent;
  order: number;
  isPublished: boolean;
  estimatedDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonContent {
  richText?: string; // HTML or markdown content
  videoUrl?: string;
  videoEmbedId?: string; // YouTube, Vimeo, etc.
  codeSnippets?: CodeSnippet[];
  resources?: Resource[];
}

export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  title?: string;
  description?: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'file' | 'link' | 'document';
  url: string;
  fileSize?: number; // in bytes
  mimeType?: string;
  createdAt: Date;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // lesson IDs
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  progressPercentage: number;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent: number; // in minutes
  completedAt?: Date;
  lastAccessedAt: Date;
}

// API Response types
export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface CourseWithProgress extends Course {
  progress?: UserProgress;
}

// Request types for API
export interface CreateCourseRequest {
  title: string;
  description: string;
  clubId: string;
  difficulty: Course['difficulty'];
  estimatedDuration: number;
}

export interface CreateLessonRequest {
  courseId: string;
  title: string;
  description: string;
  content: LessonContent;
  estimatedDuration: number;
}

export interface UpdateProgressRequest {
  lessonId: string;
  isCompleted: boolean;
  timeSpent: number;
}