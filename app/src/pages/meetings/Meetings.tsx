import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Video, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'

interface Meeting {
  id: string
  title: string
  description: string
  club_id: string
  club_name: string
  host_id: string
  host_name: string
  meeting_date: string
  meeting_time: string
  duration_minutes: number
  location?: string
  meeting_link?: string
  is_online: boolean
  max_attendees?: number
  attendee_count: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchMeetings()
  }, [])

  useEffect(() => {
    filterMeetings()
  }, [meetings, filter, selectedDate])

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/meetings')
      setMeetings(response.data.meetings || [])
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const filterMeetings = () => {
    let filtered = [...meetings]
    const now = new Date()

    if (filter === 'upcoming') {
      filtered = filtered.filter(m => new Date(m.meeting_date) >= now)
    } else if (filter === 'past') {
      filtered = filtered.filter(m => new Date(m.meeting_date) < now)
    }

    if (selectedDate) {
      filtered = filtered.filter(m => {
        const meetingDate = new Date(m.meeting_date)
        return meetingDate.toDateString() === selectedDate.toDateString()
      })
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
    setFilteredMeetings(filtered)
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(m => {
      const meetingDate = new Date(m.meeting_date)
      return meetingDate.toDateString() === date.toDateString()
    })
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="mt-2 text-gray-600">Schedule and manage your club meetings</p>
        </div>
        <Link
          to="/meetings/create"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Meeting
        </Link>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md ${
                filter === 'upcoming'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md ${
                filter === 'past'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'calendar'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div>
          {filteredMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming meetings" 
                  : filter === 'past'
                  ? "No past meetings to show"
                  : "No meetings scheduled yet"}
              </p>
              <Link
                to="/meetings/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Schedule Your First Meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {meeting.title}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(meeting.status)}`}>
                            {meeting.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{meeting.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDateTime(meeting.meeting_date, meeting.meeting_time)}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {meeting.duration_minutes} minutes
                          </div>
                          <div className="flex items-center text-gray-500">
                            {meeting.is_online ? (
                              <>
                                <Video className="w-4 h-4 mr-2" />
                                Online Meeting
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-2" />
                                {meeting.location || 'TBD'}
                              </>
                            )}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="w-4 h-4 mr-2" />
                            {meeting.attendee_count}
                            {meeting.max_attendees && `/${meeting.max_attendees}`} attendees
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-4 text-sm text-gray-500">
                          <span className="font-medium mr-1">Host:</span> {meeting.host_name}
                          <span className="mx-2">•</span>
                          <span className="font-medium mr-1">Club:</span> {meeting.club_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((day, index) => {
              const dayMeetings = day ? getMeetingsForDate(day) : []
              const isToday = day && day.toDateString() === new Date().toDateString()
              const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()
              
              return (
                <div
                  key={index}
                  className={`bg-white p-2 min-h-[100px] ${
                    day ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-indigo-50' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                      {dayMeetings.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayMeetings.slice(0, 2).map((meeting) => (
                            <div
                              key={meeting.id}
                              className="text-xs p-1 bg-indigo-100 text-indigo-700 rounded truncate"
                              title={meeting.title}
                            >
                              {meeting.meeting_time} - {meeting.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayMeetings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}