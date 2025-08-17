'use client';

import { useState } from 'react';
import CourseList from '../../../components/learning/CourseList';
import CourseCreator from '../../../components/learning/CourseCreator';
import LessonViewer from '../../../components/learning/LessonViewer';
import { Course } from '../../../types/learning';

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'create' | 'lesson'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isAdmin] = useState(true); // TODO: Get from user context/auth

  const handleCourseCreated = (course: Course) => {
    setActiveTab('courses');
    // Optionally refresh the course list or add the new course to the state
  };

  const handleStartLesson = (course: Course, lessonId: string) => {
    setSelectedCourse(course);
    setSelectedLessonId(lessonId);
    setActiveTab('lesson');
  };

  const handleProgressUpdate = (lessonId: string, completed: boolean, timeSpent: number) => {
    console.log('Progress updated:', { lessonId, completed, timeSpent });
    // TODO: Update UI to reflect progress changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
              <p className="mt-1 text-sm text-gray-500">
                Discover courses, track your progress, and expand your skills
              </p>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Browse Courses
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'create'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Create Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'courses' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Courses</h2>
              <p className="text-gray-600">
                Choose from our comprehensive library of courses designed to help you grow your skills.
              </p>
            </div>
            <CourseList />
          </div>
        )}

        {activeTab === 'create' && isAdmin && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create New Course</h2>
              <p className="text-gray-600">
                Design and publish a new course with lessons, resources, and interactive content.
              </p>
            </div>
            <CourseCreator 
              clubId="club1" // TODO: Get from context/props
              onCourseCreated={handleCourseCreated}
            />
          </div>
        )}

        {activeTab === 'lesson' && selectedCourse && selectedLessonId && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setActiveTab('courses')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Courses
              </button>
              <div className="mt-2">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-gray-600">Continue your learning journey</p>
              </div>
            </div>
            <LessonViewer
              courseId={selectedCourse.id}
              lessonId={selectedLessonId}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        )}
      </div>

      {/* Demo Data Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a demo of the Learning & Courses module. Course data is currently static.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}