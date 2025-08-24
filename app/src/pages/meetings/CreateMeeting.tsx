import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Video, Users, AlertCircle } from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'

interface Club {
  id: string
  name: string
}

export default function CreateMeeting() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedClubId = searchParams.get('clubId')
  
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club_id: preselectedClubId || '',
    meeting_date: '',
    meeting_time: '',
    duration_minutes: 60,
    is_online: true,
    location: '',
    meeting_link: '',
    max_attendees: '',
    agenda: '',
    allow_guests: false,
    record_meeting: false,
    send_reminders: true
  })

  useEffect(() => {
    fetchUserClubs()
  }, [])

  const fetchUserClubs = async () => {
    try {
      const response = await axios.get('/clubs')
      setClubs(response.data.clubs || [])
    } catch (error) {
      console.error('Failed to fetch clubs:', error)
      toast.error('Failed to load clubs')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Meeting title is required')
      return false
    }
    if (!formData.club_id) {
      toast.error('Please select a club')
      return false
    }
    if (!formData.meeting_date) {
      toast.error('Meeting date is required')
      return false
    }
    if (!formData.meeting_time) {
      toast.error('Meeting time is required')
      return false
    }
    if (!formData.is_online && !formData.location) {
      toast.error('Location is required for in-person meetings')
      return false
    }
    if (formData.is_online && !formData.meeting_link) {
      toast.error('Meeting link is required for online meetings')
      return false
    }
    
    // Check if meeting date is in the future
    const meetingDateTime = new Date(`${formData.meeting_date}T${formData.meeting_time}`)
    if (meetingDateTime <= new Date()) {
      toast.error('Meeting must be scheduled in the future')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/meetings', {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      })
      
      toast.success('Meeting scheduled successfully!')
      navigate(`/meetings/${response.data.meeting.id}`)
    } catch (error: any) {
      console.error('Failed to create meeting:', error)
      toast.error(error.response?.data?.error || 'Failed to schedule meeting')
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots for the meeting
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Meetings
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Schedule a Meeting</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new meeting for your club members</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
                Select Club *
              </label>
              <select
                id="club_id"
                name="club_id"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.club_id}
                onChange={handleChange}
              >
                <option value="">Choose a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Weekly Code Review Session"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the meeting purpose and topics..."
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="meeting_date"
                  name="meeting_date"
                  required
                  min={minDate}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.meeting_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700">
                  Time *
                </label>
                <select
                  id="meeting_time"
                  name="meeting_time"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.meeting_time}
                  onChange={handleChange}
                >
                  <option value="">Select time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) *
                </label>
                <select
                  id="duration_minutes"
                  name="duration_minutes"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_online"
                  value="true"
                  checked={formData.is_online}
                  onChange={() => setFormData({ ...formData, is_online: true })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Online Meeting
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_online"
                  value="false"
                  checked={!formData.is_online}
                  onChange={() => setFormData({ ...formData, is_online: false })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  In-Person Meeting
                </span>
              </label>
            </div>

            {formData.is_online ? (
              <div>
                <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  id="meeting_link"
                  name="meeting_link"
                  required={formData.is_online}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.meeting_link}
                  onChange={handleChange}
                  placeholder="https://zoom.us/j/123456789"
                />
                <p className="mt-1 text-sm text-gray-500">Zoom, Google Meet, or other video conferencing link</p>
              </div>
            ) : (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required={!formData.is_online}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Building name, room number, address"
                />
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Settings</h3>
            
            <div>
              <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700">
                Maximum Attendees (optional)
              </label>
              <input
                type="number"
                id="max_attendees"
                name="max_attendees"
                min="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.max_attendees}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
                Meeting Agenda
              </label>
              <textarea
                id="agenda"
                name="agenda"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.agenda}
                onChange={handleChange}
                placeholder="1. Introduction&#10;2. Topic discussion&#10;3. Q&A&#10;4. Next steps"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_guests"
                  checked={formData.allow_guests}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow guests (non-members can join)</span>
              </label>
              
              {formData.is_online && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="record_meeting"
                    checked={formData.record_meeting}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Record meeting</span>
                </label>
              )}
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="send_reminders"
                  checked={formData.send_reminders}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Send email reminders to attendees</span>
              </label>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Meeting Notice</h3>
                <p className="mt-1 text-sm text-blue-700">
                  All club members will be notified about this meeting via email and in-app notifications.
                  {formData.send_reminders && ' Reminders will be sent 24 hours and 1 hour before the meeting.'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/meetings')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}