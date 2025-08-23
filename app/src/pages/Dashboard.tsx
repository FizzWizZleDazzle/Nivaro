import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, Calendar, FolderOpen, BookOpen, Plus, ArrowRight } from 'lucide-react'
import axios from '../config/api'

interface Stats {
  totalClubs: number
  upcomingMeetings: number
  activeProjects: number
  learningProgress: number
}

interface Club {
  id: string
  name: string
  description: string
  memberCount: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalClubs: 0,
    upcomingMeetings: 0,
    activeProjects: 0,
    learningProgress: 0
  })
  const [recentClubs, setRecentClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats - Note: this endpoint may not exist yet in backend
      try {
        const statsResponse = await axios.get('/dashboard/stats')
        setStats(statsResponse.data)
      } catch (err) {
        // Use default values if endpoint doesn't exist
      }
      
      // Fetch recent clubs
      const clubsResponse = await axios.get('/clubs?limit=3')
      setRecentClubs(clubsResponse.data.clubs || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="mt-2 text-gray-600">Here's what's happening in your coding clubs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clubs</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalClubs}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/clubs" className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Meetings</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.upcomingMeetings}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/meetings" className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
              View calendar <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeProjects}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
              View projects <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Learning Progress</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.learningProgress}%</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/learning" className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
              Continue learning <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/clubs/create"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <Plus className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Create Club</p>
              <p className="text-xs text-gray-500">Start a new coding club</p>
            </div>
          </Link>

          <Link
            to="/meetings/create"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Schedule Meeting</p>
              <p className="text-xs text-gray-500">Plan your next session</p>
            </div>
          </Link>

          <Link
            to="/projects"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <FolderOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">New Project</p>
              <p className="text-xs text-gray-500">Start collaborating</p>
            </div>
          </Link>

          <Link
            to="/learning"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Browse Courses</p>
              <p className="text-xs text-gray-500">Learn something new</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Clubs */}
      {recentClubs.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Clubs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentClubs.map((club) => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{club.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{club.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {club.memberCount} members
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}