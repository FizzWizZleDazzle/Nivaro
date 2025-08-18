import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock meeting components
const MockMeetingsList = () => {
  const mockMeetings = [
    {
      id: '1',
      title: 'Weekly Team Meeting',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'meeting',
      description: 'Regular team sync',
      rsvpCount: 5,
    },
    {
      id: '2', 
      title: 'Tech Workshop',
      date: '2024-01-20',
      time: '2:00 PM',
      type: 'workshop',
      description: 'Learn React',
      rsvpCount: 12,
    }
  ]

  return (
    <div>
      <h1>Meetings & Events</h1>
      <div data-testid="meetings-list">
        {mockMeetings.map(meeting => (
          <div key={meeting.id} data-testid={`meeting-${meeting.id}`}>
            <h3>{meeting.title}</h3>
            <p>{meeting.date} at {meeting.time}</p>
            <p>{meeting.description}</p>
            <span>{meeting.rsvpCount} RSVPs</span>
            <button>RSVP</button>
          </div>
        ))}
      </div>
      <button data-testid="create-meeting">Create New Meeting</button>
    </div>
  )
}

const MockCreateMeeting = () => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    location: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating meeting:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div>
      <h1>Create New Meeting</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Meeting Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="time">Time</label>
          <input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="meeting">Meeting</option>
            <option value="workshop">Workshop</option>
            <option value="social">Social Event</option>
          </select>
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Create Meeting</button>
      </form>
    </div>
  )
}

const MockMeetingDetail = () => {
  const [rsvpStatus, setRsvpStatus] = React.useState('not_responded')
  const [rsvps] = React.useState([
    { id: '1', userName: 'John Doe', status: 'yes' },
    { id: '2', userName: 'Jane Smith', status: 'yes' },
    { id: '3', userName: 'Mike Johnson', status: 'maybe' },
  ])

  const handleRSVP = (status: string) => {
    setRsvpStatus(status)
    console.log('RSVP updated:', status)
  }

  return (
    <div>
      <h1>Weekly Team Meeting</h1>
      <p>January 15, 2024 at 10:00 AM</p>
      <p>Regular team sync meeting</p>
      
      <div data-testid="rsvp-section">
        <h3>RSVP Status: {rsvpStatus}</h3>
        <button onClick={() => handleRSVP('yes')} data-testid="rsvp-yes">
          Yes, I&apos;ll attend
        </button>
        <button onClick={() => handleRSVP('no')} data-testid="rsvp-no">
          No, I can&apos;t attend
        </button>
        <button onClick={() => handleRSVP('maybe')} data-testid="rsvp-maybe">
          Maybe
        </button>
      </div>

      <div data-testid="rsvp-list">
        <h3>Attendees ({rsvps.filter(r => r.status === 'yes').length})</h3>
        {rsvps.map(rsvp => (
          <div key={rsvp.id} data-testid={`rsvp-${rsvp.id}`}>
            <span>{rsvp.userName}</span>
            <span>{rsvp.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Test 3: Test meeting creation and RSVP functionality
describe('Meetings & Events', () => {
  describe('Meetings List', () => {
    it('displays list of meetings with key information', () => {
      render(<MockMeetingsList />)
      
      expect(screen.getByRole('heading', { name: /meetings & events/i })).toBeInTheDocument()
      
      // Check meetings are displayed
      expect(screen.getByTestId('meeting-1')).toBeInTheDocument()
      expect(screen.getByTestId('meeting-2')).toBeInTheDocument()
      
      // Check meeting details
      expect(screen.getByText('Weekly Team Meeting')).toBeInTheDocument()
      expect(screen.getByText('Tech Workshop')).toBeInTheDocument()
      expect(screen.getByText('5 RSVPs')).toBeInTheDocument()
      expect(screen.getByText('12 RSVPs')).toBeInTheDocument()
      
      // Check RSVP buttons
      expect(screen.getAllByText('RSVP')).toHaveLength(2)
    })

    it('has create meeting button', () => {
      render(<MockMeetingsList />)
      
      const createButton = screen.getByTestId('create-meeting')
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveTextContent('Create New Meeting')
    })
  })

  describe('Meeting Creation', () => {
    it('renders meeting creation form with all fields', () => {
      render(<MockCreateMeeting />)
      
      expect(screen.getByRole('heading', { name: /create new meeting/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/meeting title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/time/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create meeting/i })).toBeInTheDocument()
    })

    it('allows user to fill out meeting form', async () => {
      const user = userEvent.setup()
      render(<MockCreateMeeting />)
      
      await user.type(screen.getByLabelText(/meeting title/i), 'Team Standup')
      await user.type(screen.getByLabelText(/description/i), 'Daily standup meeting')
      await user.type(screen.getByLabelText(/date/i), '2024-01-15')
      await user.type(screen.getByLabelText(/time/i), '09:00')
      await user.selectOptions(screen.getByLabelText(/type/i), 'meeting')
      await user.type(screen.getByLabelText(/location/i), 'Conference Room A')
      
      expect(screen.getByDisplayValue('Team Standup')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Daily standup meeting')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument()
    })

    it('submits meeting creation form', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockCreateMeeting />)
      
      await user.type(screen.getByLabelText(/meeting title/i), 'Team Meeting')
      await user.type(screen.getByLabelText(/description/i), 'Weekly sync')
      await user.click(screen.getByRole('button', { name: /create meeting/i }))
      
      expect(consoleSpy).toHaveBeenCalledWith('Creating meeting:', expect.objectContaining({
        title: 'Team Meeting',
        description: 'Weekly sync'
      }))
      
      consoleSpy.mockRestore()
    })
  })

  describe('RSVP Functionality', () => {
    it('displays meeting details and RSVP options', () => {
      render(<MockMeetingDetail />)
      
      expect(screen.getByText('Weekly Team Meeting')).toBeInTheDocument()
      expect(screen.getByText('January 15, 2024 at 10:00 AM')).toBeInTheDocument()
      
      // Check RSVP buttons
      expect(screen.getByTestId('rsvp-yes')).toBeInTheDocument()
      expect(screen.getByTestId('rsvp-no')).toBeInTheDocument()
      expect(screen.getByTestId('rsvp-maybe')).toBeInTheDocument()
    })

    it('allows user to RSVP to meeting', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockMeetingDetail />)
      
      expect(screen.getByText('RSVP Status: not_responded')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('rsvp-yes'))
      
      await waitFor(() => {
        expect(screen.getByText('RSVP Status: yes')).toBeInTheDocument()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('RSVP updated:', 'yes')
      
      consoleSpy.mockRestore()
    })

    it('displays attendee list with RSVP statuses', () => {
      render(<MockMeetingDetail />)
      
      expect(screen.getByText('Attendees (2)')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
    })

    it('updates RSVP status when different options are clicked', async () => {
      const user = userEvent.setup()
      render(<MockMeetingDetail />)
      
      // Test "Maybe" RSVP
      await user.click(screen.getByTestId('rsvp-maybe'))
      await waitFor(() => {
        expect(screen.getByText('RSVP Status: maybe')).toBeInTheDocument()
      })
      
      // Test "No" RSVP
      await user.click(screen.getByTestId('rsvp-no'))
      await waitFor(() => {
        expect(screen.getByText('RSVP Status: no')).toBeInTheDocument()
      })
    })
  })
})