import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nivaro</h1>
          <p className="text-lg text-gray-600">Club Management Made Simple</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              Create a new club or join an existing one to get started with Nivaro.
            </p>
            <div className="space-y-3">
              <Link 
                href="/onboarding/create"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create a Club
              </Link>
              <Link 
                href="/onboarding/join"
                className="block w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
              >
                Join with Invite Code
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
            <div className="space-y-3">
              <Link 
                href="/meetings"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                View Meetings & Events
              </Link>
              <Link
                href="/project-collaboration"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Project & Code Collaboration
              </Link>
              <Link 
                href="/club/club-1"
                className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                View Demo Club
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}