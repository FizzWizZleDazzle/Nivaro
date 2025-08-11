import { useEffect } from 'react';
import { trackEvent, trackPageView } from '@/components/Analytics';

// Hook for tracking page views
export function usePageView(url?: string, title?: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pageUrl = url || window.location.href;
      const pageTitle = title || document.title;
      trackPageView(pageUrl, pageTitle);
    }
  }, [url, title]);
}

// Hook for tracking user interactions
export function useAnalytics() {
  const track = (eventName: string, properties?: Record<string, unknown>) => {
    trackEvent(eventName, properties);
  };

  // Predefined tracking functions for common events
  const trackClubCreated = (clubId: string, clubType?: string) => {
    track('club_created', { club_id: clubId, club_type: clubType });
  };

  const trackMeetingScheduled = (meetingId: string, clubId: string) => {
    track('meeting_scheduled', { meeting_id: meetingId, club_id: clubId });
  };

  const trackMeetingJoined = (meetingId: string, clubId: string) => {
    track('meeting_joined', { meeting_id: meetingId, club_id: clubId });
  };

  const trackProjectCreated = (projectId: string, clubId: string) => {
    track('project_created', { project_id: projectId, club_id: clubId });
  };

  const trackCourseStarted = (courseId: string, courseName?: string) => {
    track('course_started', { course_id: courseId, course_name: courseName });
  };

  const trackForumPost = (postId: string, category?: string) => {
    track('forum_post_created', { post_id: postId, category });
  };

  const trackSearch = (query: string, results?: number) => {
    track('search_performed', { search_query: query, results_count: results });
  };

  const trackUserEngagement = (action: string, section: string) => {
    track('user_engagement', { action, section });
  };

  return {
    track,
    trackClubCreated,
    trackMeetingScheduled,
    trackMeetingJoined,
    trackProjectCreated,
    trackCourseStarted,
    trackForumPost,
    trackSearch,
    trackUserEngagement,
  };
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track important performance metrics
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackEvent('performance_navigation', {
            page_load_time: navEntry.loadEventEnd - navEntry.loadEventStart,
            dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            first_byte_time: navEntry.responseStart - navEntry.requestStart,
          });
        }
        
        if (entry.entryType === 'paint') {
          trackEvent('performance_paint', {
            metric: entry.name,
            value: entry.startTime,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (e) {
      console.warn('Performance monitoring not fully supported:', e);
    }

    return () => observer.disconnect();
  }, []);
}

// Hook for error tracking
export function useErrorTracking() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack?.substring(0, 500), // Limit stack trace size
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString?.() || 'Unknown promise rejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

// Combined hook for all analytics features
export function useAnalyticsSetup() {
  usePerformanceMonitoring();
  useErrorTracking();
  
  return useAnalytics();
}