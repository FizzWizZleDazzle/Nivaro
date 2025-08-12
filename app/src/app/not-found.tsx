import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.007-6-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Or try one of these popular pages:</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              <Link href="/meetings" className="text-blue-600 hover:text-blue-800 transition-colors">
                Meetings
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/learning" className="text-blue-600 hover:text-blue-800 transition-colors">
                Learning
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/forum" className="text-blue-600 hover:text-blue-800 transition-colors">
                Forum
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/onboarding" className="text-blue-600 hover:text-blue-800 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}