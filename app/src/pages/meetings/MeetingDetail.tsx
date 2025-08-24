import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, 
  UserPlus, UserMinus, Edit, Trash2, Copy, ExternalLink,
  MessageSquare, FileText, Download, Share2, Bell, BellOff,
  CheckCircle, XCircle, AlertCircle, Mail, Phone, Github,
  Linkedin, Twitter, Globe, ChevronDown, ChevronUp, Plus
} from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'
import { useAuth } from '../../contexts/AuthContext'

interface Meeting {
  id: string
  title: string
  description: string
  club_id: string
  club_name: string
  host_id: string
  host_name: string
  host_email: string
  meeting_date: string
  meeting_time: string
  duration_minutes: number
  location?: string
  meeting_link?: string
  is_online: boolean
  max_attendees?: number
  attendee_count: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  agenda?: string
  notes?: string
  recording_link?: string
  allow_guests: boolean
  record_meeting: boolean
  send_reminders: boolean
  created_at: string
  updated_at: string
}

interface Attendee {
  id: string
  user_id: string
  name: string
  email: string
  avatar?: string
  rsvp_status: 'attending' | 'maybe' | 'not_attending' | 'no_response'
  joined_at?: string
  role: 'host' | 'co-host' | 'attendee' | 'guest'
  notes?: string
}

interface MeetingResource {
  id: string
  type: 'document' | 'link' | 'video' | 'slides'
  title: string
  url: string
  description?: string
  uploaded_by: string
  uploaded_at: string
}

interface MeetingComment {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  created_at: string
  edited_at?: string
  is_edited: boolean
}

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [resources, setResources] = useState<MeetingResource[]>([])
  const [comments, setComments] = useState<MeetingComment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [userRsvp, setUserRsvp] = useState<string>('no_response')
  const [isHost, setIsHost] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [showAttendees, setShowAttendees] = useState(true)
  const [showResources, setShowResources] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [meetingNotes, setMeetingNotes] = useState('')
  const [newComment, setNewComment] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (id) {
      fetchMeetingDetails()
      fetchAttendees()
      fetchResources()
      fetchComments()
    }
  }, [id])

  const fetchMeetingDetails = async () => {
    try {
      const response = await axios.get(`/meetings/${id}`)
      setMeeting(response.data.meeting)
      setIsHost(response.data.meeting.host_id === user?.id)
      setMeetingNotes(response.data.meeting.notes || '')
    } catch (error) {
      console.error('Failed to fetch meeting details:', error)
      toast.error('Failed to load meeting details')
      navigate('/meetings')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendees = async () => {
    try {
      const response = await axios.get(`/meetings/${id}/attendees`)
      setAttendees(response.data.attendees || [])
      const userAttendee = response.data.attendees.find((a: Attendee) => a.user_id === user?.id)
      if (userAttendee) {
        setUserRsvp(userAttendee.rsvp_status)
        setIsAttending(userAttendee.rsvp_status === 'attending')
      }
    } catch (error) {
      console.error('Failed to fetch attendees:', error)
    }
  }

  const fetchResources = async () => {
    try {
      const response = await axios.get(`/meetings/${id}/resources`)
      setResources(response.data.resources || [])
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/meetings/${id}/comments`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleRsvp = async (status: string) => {
    try {
      await axios.post(`/meetings/${id}/rsvp`, { status })
      setUserRsvp(status)
      setIsAttending(status === 'attending')
      toast.success('RSVP updated successfully')
      fetchAttendees()
      if (meeting) {
        const change = status === 'attending' ? 1 : userRsvp === 'attending' ? -1 : 0
        setMeeting({ ...meeting, attendee_count: meeting.attendee_count + change })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update RSVP')
    }
  }

  const handleCancelMeeting = async () => {
    if (!window.confirm('Are you sure you want to cancel this meeting? All attendees will be notified.')) {
      return
    }

    try {
      await axios.post(`/meetings/${id}/cancel`)
      toast.success('Meeting cancelled successfully')
      if (meeting) {
        setMeeting({ ...meeting, status: 'cancelled' })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel meeting')
    }
  }

  const handleStartMeeting = async () => {
    try {
      await axios.post(`/meetings/${id}/start`)
      toast.success('Meeting started!')
      if (meeting) {
        setMeeting({ ...meeting, status: 'in_progress' })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start meeting')
    }
  }

  const handleEndMeeting = async () => {
    try {
      await axios.post(`/meetings/${id}/end`)
      toast.success('Meeting ended')
      if (meeting) {
        setMeeting({ ...meeting, status: 'completed' })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to end meeting')
    }
  }

  const handleSaveNotes = async () => {
    try {
      await axios.put(`/meetings/${id}/notes`, { notes: meetingNotes })
      toast.success('Notes saved successfully')
      setEditingNotes(false)
      if (meeting) {
        setMeeting({ ...meeting, notes: meetingNotes })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save notes')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/meetings/${id}/comments`, { content: newComment })
      setComments([response.data.comment, ...comments])
      setNewComment('')
      toast.success('Comment added')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/meetings/${id}/comments/${commentId}`)
      setComments(comments.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete comment')
    }
  }

  const handleCopyMeetingLink = () => {
    if (meeting?.meeting_link) {
      navigator.clipboard.writeText(meeting.meeting_link)
      toast.success('Meeting link copied to clipboard')
    }
  }

  const handleShareMeeting = () => {
    const shareUrl = `${window.location.origin}/meetings/${id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Meeting URL copied to clipboard')
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    }
    return `${dateObj.toLocaleDateString('en-US', options)} at ${time}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRsvpColor = (status: string) => {
    switch (status) {
      case 'attending':
        return 'text-green-600 bg-green-50'
      case 'maybe':
        return 'text-yellow-600 bg-yellow-50'
      case 'not_attending':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return CheckCircle
      case 'not_attending':
        return XCircle
      default:
        return AlertCircle
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText
      case 'video':
        return Video
      case 'link':
        return ExternalLink
      default:
        return Globe
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!meeting) {
    return <div>Meeting not found</div>
  }

  const meetingDateTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`)
  const hasStarted = meetingDateTime <= new Date()
  const hasEnded = meeting.status === 'completed' || meeting.status === 'cancelled'
  const canStart = isHost && hasStarted && meeting.status === 'scheduled'
  const canEnd = isHost && meeting.status === 'in_progress'

  const tabs = [
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'attendees', label: `Attendees (${attendees.length})`, icon: Users },
    { id: 'resources', label: `Resources (${resources.length})`, icon: FileText },
    { id: 'discussion', label: `Discussion (${comments.length})`, icon: MessageSquare }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Meetings
      </button>

      {/* Meeting Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold text-gray-900 mr-3">
                {meeting.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                {meeting.status.replace('_', ' ')}
              </span>
            </div>
            
            {meeting.description && (
              <p className="text-gray-600 mb-4">{meeting.description}</p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                {formatDateTime(meeting.meeting_date, meeting.meeting_time)}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                {meeting.duration_minutes} minutes
              </div>
              <div className="flex items-center text-gray-600">
                {meeting.is_online ? (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Online Meeting
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    {meeting.location || 'TBD'}
                  </>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                {meeting.attendee_count}
                {meeting.max_attendees && `/${meeting.max_attendees}`} attendees
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-1">Host:</span> {meeting.host_name}
              <span className="mx-2">•</span>
              <span className="font-medium mr-1">Club:</span>
              <Link to={`/clubs/${meeting.club_id}`} className="text-indigo-600 hover:text-indigo-700">
                {meeting.club_name}
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {!hasEnded && (
              <>
                {canStart && (
                  <button
                    onClick={handleStartMeeting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Start Meeting
                  </button>
                )}
                {canEnd && (
                  <button
                    onClick={handleEndMeeting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    End Meeting
                  </button>
                )}
                {meeting.is_online && meeting.meeting_link && isAttending && (
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Meeting
                  </a>
                )}
              </>
            )}
            
            <button
              onClick={handleShareMeeting}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </button>

            {isHost && meeting.status === 'scheduled' && (
              <>
                <button
                  onClick={() => navigate(`/meetings/${id}/edit`)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleCancelMeeting}
                  className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* RSVP Section */}
        {!hasEnded && meeting.status !== 'cancelled' && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your RSVP</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRsvp('attending')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      userRsvp === 'attending' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Attending
                  </button>
                  <button
                    onClick={() => handleRsvp('maybe')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      userRsvp === 'maybe' 
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRsvp('not_attending')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      userRsvp === 'not_attending' 
                        ? 'bg-red-100 text-red-700 border-2 border-red-500' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Not Attending
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  notificationsEnabled 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <BellOff className="w-5 h-5 mr-2" />
                    Notifications Off
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Meeting Agenda */}
              {meeting.agenda && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Meeting Agenda</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-gray-700">{meeting.agenda}</pre>
                  </div>
                </div>
              )}

              {/* Meeting Notes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Meeting Notes</h3>
                  {isHost && !editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div>
                    <textarea
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add meeting notes..."
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingNotes(false)
                          setMeetingNotes(meeting.notes || '')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {meeting.notes ? (
                      <pre className="whitespace-pre-wrap text-gray-700">{meeting.notes}</pre>
                    ) : (
                      <p className="text-gray-500 italic">No notes added yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Meeting Link */}
              {meeting.is_online && meeting.meeting_link && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Meeting Link</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={meeting.meeting_link}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleCopyMeetingLink}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Recording Link */}
              {meeting.recording_link && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recording</h3>
                  <a
                    href={meeting.recording_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Watch Recording
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendees' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {attendees.length} Attendees
                  {meeting.max_attendees && ` (Max: ${meeting.max_attendees})`}
                </h3>
                {isHost && (
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <UserPlus className="w-5 h-5 inline mr-2" />
                    Invite
                  </button>
                )}
              </div>

              {/* RSVP Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {['attending', 'maybe', 'not_attending', 'no_response'].map((status) => {
                  const count = attendees.filter(a => a.rsvp_status === status).length
                  const Icon = getRsvpIcon(status)
                  return (
                    <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${getRsvpColor(status).split(' ')[0]}`} />
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-gray-600">{status.replace('_', ' ')}</div>
                    </div>
                  )
                })}
              </div>

              {/* Attendees List */}
              <div className="space-y-2">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {attendee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{attendee.name}</p>
                          <p className="text-sm text-gray-500">{attendee.email}</p>
                        </div>
                        {attendee.role !== 'attendee' && (
                          <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {attendee.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getRsvpColor(attendee.rsvp_status)}`}>
                          {attendee.rsvp_status.replace('_', ' ')}
                        </span>
                        {isHost && attendee.user_id !== user?.id && (
                          <button className="text-red-600 hover:text-red-700">
                            <UserMinus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {attendee.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">"{attendee.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Meeting Resources</h3>
                {(isHost || isAttending) && (
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <Plus className="w-5 h-5 inline mr-2" />
                    Add Resource
                  </button>
                )}
              </div>

              {resources.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No resources added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => {
                    const Icon = getResourceIcon(resource.type)
                    return (
                      <div key={resource.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Icon className="w-6 h-6 text-indigo-600 mt-1" />
                          <div className="ml-3 flex-1">
                            <a 
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {resource.title}
                            </a>
                            {resource.description && (
                              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Shared by {resource.uploaded_by} • {new Date(resource.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discussion' && (
            <div>
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </div>

              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Start the discussion!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {comment.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{comment.user_name}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                              {comment.is_edited && (
                                <span className="ml-2 text-xs text-gray-400">(edited)</span>
                              )}
                            </div>
                            {comment.user_id === user?.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="mt-2 text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}