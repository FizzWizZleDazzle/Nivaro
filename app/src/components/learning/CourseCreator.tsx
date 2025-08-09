'use client';

import { useState } from 'react';
import { Course, CreateCourseRequest, CreateLessonRequest, LessonContent } from '../../types/learning';
import { learningApi } from '../../lib/learning-api';

interface CourseCreatorProps {
  clubId: string;
  onCourseCreated?: (course: Course) => void;
}

export default function CourseCreator({ clubId, onCourseCreated }: CourseCreatorProps) {
  const [course, setCourse] = useState<CreateCourseRequest>({
    title: '',
    description: '',
    clubId,
    difficulty: 'Beginner',
    estimatedDuration: 60,
  });
  
  const [lessons, setLessons] = useState<CreateLessonRequest[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CreateLessonRequest>({
    courseId: '',
    title: '',
    description: '',
    content: {
      richText: '',
      codeSnippets: [],
      resources: [],
    },
    estimatedDuration: 30,
  });
  
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course.title.trim() || !course.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const createdCourse = await learningApi.createCourse(course);
      
      // Create lessons if any
      for (const lesson of lessons) {
        await learningApi.createLesson({
          ...lesson,
          courseId: createdCourse.id,
        });
      }
      
      onCourseCreated?.(createdCourse);
      
      // Reset form
      setCourse({
        title: '',
        description: '',
        clubId,
        difficulty: 'Beginner',
        estimatedDuration: 60,
      });
      setLessons([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLesson = () => {
    if (!currentLesson.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    setLessons([...lessons, { ...currentLesson }]);
    setCurrentLesson({
      courseId: '',
      title: '',
      description: '',
      content: {
        richText: '',
        codeSnippets: [],
        resources: [],
      },
      estimatedDuration: 30,
    });
    setShowLessonForm(false);
    setError(null);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const addCodeSnippet = () => {
    const newSnippet = {
      id: `code_${Date.now()}`,
      language: 'javascript',
      code: '',
      title: '',
      description: '',
    };
    
    setCurrentLesson({
      ...currentLesson,
      content: {
        ...currentLesson.content,
        codeSnippets: [...(currentLesson.content.codeSnippets || []), newSnippet],
      },
    });
  };

  const updateCodeSnippet = (index: number, field: string, value: string) => {
    const updatedSnippets = [...(currentLesson.content.codeSnippets || [])];
    updatedSnippets[index] = { ...updatedSnippets[index], [field]: value };
    
    setCurrentLesson({
      ...currentLesson,
      content: {
        ...currentLesson.content,
        codeSnippets: updatedSnippets,
      },
    });
  };

  const removeCodeSnippet = (index: number) => {
    const updatedSnippets = currentLesson.content.codeSnippets?.filter((_, i) => i !== index) || [];
    setCurrentLesson({
      ...currentLesson,
      content: {
        ...currentLesson.content,
        codeSnippets: updatedSnippets,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleCourseSubmit} className="space-y-6">
        {/* Course Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={course.difficulty}
              onChange={(e) => setCourse({ ...course, difficulty: e.target.value as Course['difficulty'] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description *
          </label>
          <textarea
            value={course.description}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what students will learn in this course"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={course.estimatedDuration}
            onChange={(e) => setCourse({ ...course, estimatedDuration: parseInt(e.target.value) || 0 })}
            min="1"
            className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lessons Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lessons ({lessons.length})</h3>
            <button
              type="button"
              onClick={() => setShowLessonForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Lesson
            </button>
          </div>

          {/* Existing Lessons */}
          {lessons.length > 0 && (
            <div className="space-y-2 mb-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div>
                    <span className="font-medium">{lesson.title}</span>
                    <span className="text-gray-500 ml-2">({lesson.estimatedDuration}m)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Lesson Form */}
          {showLessonForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-3">Add New Lesson</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Lesson title"
                    value={currentLesson.title}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={currentLesson.estimatedDuration}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, estimatedDuration: parseInt(e.target.value) || 30 })}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <textarea
                  placeholder="Lesson description"
                  value={currentLesson.description}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <textarea
                  placeholder="Lesson content (HTML/Markdown)"
                  value={currentLesson.content.richText}
                  onChange={(e) => setCurrentLesson({
                    ...currentLesson,
                    content: { ...currentLesson.content, richText: e.target.value }
                  })}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Code Snippets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Code Snippets</label>
                    <button
                      type="button"
                      onClick={addCodeSnippet}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add Code
                    </button>
                  </div>
                  
                  {currentLesson.content.codeSnippets?.map((snippet, index) => (
                    <div key={index} className="border rounded p-3 mb-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Language"
                          value={snippet.language}
                          onChange={(e) => updateCodeSnippet(index, 'language', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Title (optional)"
                          value={snippet.title}
                          onChange={(e) => updateCodeSnippet(index, 'title', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeCodeSnippet(index)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        placeholder="Code"
                        value={snippet.code}
                        onChange={(e) => updateCodeSnippet(index, 'code', e.target.value)}
                        rows={3}
                        className="w-full border rounded px-2 py-1 text-sm font-mono"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={addLesson}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLessonForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Course...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}