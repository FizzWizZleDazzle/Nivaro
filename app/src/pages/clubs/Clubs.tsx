import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Calendar, Code, Search } from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'

interface Club {
  id: string
  name: string
  description: string
  member_count: number
  created_at: string
  owner_id: string
  is_public: boolean
}

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const response = await axios.get('/clubs')
      setClubs(response.data.clubs || [])
    } catch (error) {
      console.error('Failed to fetch clubs:', error)
      toast.error('Failed to load clubs')
    } finally {
      setLoading(false)
    }
  }

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coding Clubs</h1>
          <p className="mt-2 text-gray-600">Discover and join clubs to collaborate with other developers</p>
        </div>
        <Link
          to="/clubs/create"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Club
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clubs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clubs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new club'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/clubs/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Club
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                {club.is_public && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{club.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {club.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {club.member_count || 0} members
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(club.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}