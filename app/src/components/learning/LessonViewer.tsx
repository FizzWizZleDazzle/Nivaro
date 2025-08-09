'use client';

import { useState, useEffect } from 'react';
import { Lesson, CodeSnippet } from '../../types/learning';
import { learningApi } from '../../lib/learning-api';

interface LessonViewerProps {
  courseId: string;
  lessonId: string;
  onProgressUpdate?: (lessonId: string, completed: boolean, timeSpent: number) => void;
}

export default function LessonViewer({ courseId, lessonId, onProgressUpdate }: LessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchLesson();
    
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // in minutes
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await learningApi.getLesson(courseId, lessonId);
      setLesson(lessonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;

    try {
      await learningApi.updateProgress({
        lessonId: lesson.id,
        isCompleted: !isCompleted,
        timeSpent: timeSpent,
      });
      
      setIsCompleted(!isCompleted);
      onProgressUpdate?.(lesson.id, !isCompleted, timeSpent);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const copyCodeToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const renderCodeSnippet = (snippet: CodeSnippet) => (
    <div key={snippet.id} className="bg-gray-900 rounded-lg overflow-hidden mb-6">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm font-medium">
            {snippet.language}
          </span>
          {snippet.title && (
            <span className="text-gray-400 text-sm">- {snippet.title}</span>
          )}
        </div>
        <button
          onClick={() => copyCodeToClipboard(snippet.code)}
          className="text-gray-400 hover:text-white text-sm"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-gray-100 text-sm overflow-x-auto">
        <code>{snippet.code}</code>
      </pre>
      {snippet.description && (
        <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm">
          {snippet.description}
        </div>
      )}
    </div>
  );

  const renderVideoEmbed = (embedId: string) => {
    // Simple YouTube embed - in a real app, you'd handle multiple video platforms
    if (embedId.includes('youtube.com') || embedId.includes('youtu.be')) {
      const videoId = embedId.split('/').pop()?.split('?')[0];
      return (
        <div className="aspect-video mb-6">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Lesson Video"
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      );
    }
    
    // Fallback for other video URLs
    return (
      <div className="mb-6">
        <video
          src={embedId}
          controls
          className="w-full rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 rounded h-8 w-3/4"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-1/2"></div>
        <div className="animate-pulse bg-gray-200 rounded h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchLesson}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Lesson Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {lesson.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {lesson.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Estimated time: {lesson.estimatedDuration} minutes
          </span>
          <button
            onClick={handleMarkComplete}
            className={`px-4 py-2 rounded transition-colors ${
              isCompleted 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isCompleted ? '✓ Completed' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="space-y-6">
        {/* Video Content */}
        {lesson.content.videoUrl && renderVideoEmbed(lesson.content.videoUrl)}
        {lesson.content.videoEmbedId && renderVideoEmbed(lesson.content.videoEmbedId)}

        {/* Rich Text Content */}
        {lesson.content.richText && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content.richText }}
          />
        )}

        {/* Code Snippets */}
        {lesson.content.codeSnippets && lesson.content.codeSnippets.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Code Examples</h3>
            {lesson.content.codeSnippets.map(renderCodeSnippet)}
          </div>
        )}

        {/* Resources */}
        {lesson.content.resources && lesson.content.resources.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              {lesson.content.resources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      )}
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {resource.type === 'file' ? 'Download' : 'View'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-4 border-t">
        <p className="text-sm text-gray-500">
          Time spent: {timeSpent} minutes
        </p>
      </div>
    </div>
  );
}