import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Nivaro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Club Management Platform with Specialized Project & Code Collaboration Tools
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            🚀 New: Project & Code Collaboration Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-800 mb-2">Kanban Project Board</h3>
              <p className="text-sm text-gray-600">
                Organize tasks with To Do, In Progress, and Done columns. 
                Drag and drop to manage your technical projects efficiently.
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-3">📁</div>
              <h3 className="font-semibold text-gray-800 mb-2">Repository Linking</h3>
              <p className="text-sm text-gray-600">
                Connect your GitHub and GitLab repositories. 
                Keep track of all your club&apos;s code projects in one place.
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="font-semibold text-gray-800 mb-2">Code Snippet Sharing</h3>
              <p className="text-sm text-gray-600">
                Share code snippets with syntax highlighting. 
                Perfect for tutorials, examples, and team collaboration.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/project-collaboration"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Project Collaboration Features
            </Link>
          </div>
        </div>

        <div className="text-center sm:text-left w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            About Nivaro
          </h3>
          <p className="text-gray-600 mb-4">
            Nivaro is a comprehensive club management platform designed specifically for technical clubs. 
            Our specialized project and code collaboration features help technical communities work together 
            more effectively.
          </p>
          <div className="text-sm text-gray-500">
            <strong>Key Features:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Kanban-style project boards for task management</li>
              <li>GitHub and GitLab repository integration</li>
              <li>Code snippet sharing with syntax highlighting</li>
              <li>Designed to minimize overlap with general club features</li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500">
        <span>Nivaro &copy; 2024</span>
        <span>•</span>
        <span>Built for Technical Clubs</span>
      </footer>
    </div>
  );
}
