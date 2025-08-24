import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, MessageSquare, Settings, Plus, UserPlus, Code, BookOpen, Trophy } from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'
import { useAuth } from '../../contexts/AuthContext'

interface Club {
  id: string
  name: string
  description: string
  member_count: number
  created_at: string
  owner_id: string
  is_public: boolean
  tags: string[]
}

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isMember, setIsMember] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (clubId) {
      fetchClubDetails()
      fetchMembers()
    }
  }, [clubId])

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/clubs/${clubId}`)
      setClub(response.data.club)
      setIsOwner(response.data.club.owner_id === user?.id)
    } catch (error) {
      console.error('Failed to fetch club details:', error)
      toast.error('Failed to load club details')
      navigate('/clubs')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/clubs/${clubId}/members`)
      setMembers(response.data.members || [])
      setIsMember(response.data.members.some((m: Member) => m.user_id === user?.id))
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleJoinClub = async () => {
    try {
      await axios.post('/members/join', { club_id: clubId })
      toast.success('Successfully joined the club!')
      fetchMembers()
      if (club) {
        setClub({ ...club, member_count: club.member_count + 1 })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join club')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!club) {
    return <div>Club not found</div>
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Code },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Trophy },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/clubs')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Clubs
      </button>

      {/* Club Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
            <p className="text-gray-600 mb-4">{club.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {club.member_count} members
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Created {new Date(club.created_at).toLocaleDateString()}
              </div>
              {club.is_public && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Public</span>
              )}
            </div>
            {club.tags && club.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {club.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {!isMember ? (
              <button
                onClick={handleJoinClub}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Join Club
              </button>
            ) : (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
                Member
              </span>
            )}
            {isOwner && (
              <button
                onClick={() => navigate(`/clubs/${clubId}/settings`)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Club Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Events</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Members ({members.length})</h3>
                {(isOwner || isMember) && (
                  <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invite Members
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Meetings</h3>
                {(isOwner || isMember) && (
                  <Link
                    to={`/meetings/create?clubId=${clubId}`}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Schedule Meeting
                  </Link>
                )}
              </div>
              <p className="text-gray-500">No meetings scheduled</p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Curriculum</h3>
                {isOwner && (
                  <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Curriculum
                  </button>
                )}
              </div>
              <p className="text-gray-500">No curriculum available</p>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Projects</h3>
                {isMember && (
                  <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                  </button>
                )}
              </div>
              <p className="text-gray-500">No projects yet</p>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Discussions</h3>
                {isMember && (
                  <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Start Discussion
                  </button>
                )}
              </div>
              <p className="text-gray-500">No discussions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}