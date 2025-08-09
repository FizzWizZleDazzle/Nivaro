import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Nivaro
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your comprehensive platform for managing student club activities, meetings, and events.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Meetings Card */}
            <Link 
              href="/meetings"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">📅</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Meetings & Events
                </h2>
                <p className="text-gray-600 mb-6">
                  Schedule meetings, workshops, and social events. Manage RSVPs and track attendance.
                </p>
                <div className="text-blue-600 font-medium">
                  Explore Meetings →
                </div>
              </div>
            </Link>

            {/* Coming Soon Card */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 opacity-75">
              <div className="text-center">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Club Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage members, roles, and club information. Track member engagement and activities.
                </p>
                <div className="text-gray-400 font-medium">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500">
              Built for student organizations to streamline communication and event management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
