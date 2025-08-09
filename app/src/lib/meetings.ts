import { Meeting, CreateMeetingRequest, UpdateMeetingRequest, RSVP } from '@/types/meetings';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787';

// Mock data for development - in a real app this would come from the backend
const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Weekly Club Meeting',
    description: 'Our regular weekly meeting to discuss club activities and upcoming events.',
    type: 'meeting',
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '19:30',
    location: 'Room 101, Student Center',
    agenda: '# Weekly Meeting Agenda\n\n## Topics\n1. Welcome new members\n2. Review last week\'s activities\n3. Plan upcoming events\n4. Q&A Session',
    maxAttendees: 50,
    createdBy: 'admin',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Photography Workshop',
    description: 'Learn the basics of digital photography with hands-on exercises.',
    type: 'workshop',
    date: '2024-01-20',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Art Building, Studio 2',
    agenda: '# Photography Workshop\n\n## Schedule\n- **2:00-2:30 PM**: Introduction to Camera Settings\n- **2:30-3:15 PM**: Composition Techniques\n- **3:15-3:30 PM**: Break\n- **3:30-4:30 PM**: Hands-on Practice\n- **4:30-5:00 PM**: Review and Feedback',
    maxAttendees: 20,
    createdBy: 'admin',
    createdAt: '2024-01-08T15:30:00Z'
  },
  {
    id: '3',
    title: 'Welcome Social Event',
    description: 'A casual social gathering to welcome new members and build community.',
    type: 'social',
    date: '2024-01-25',
    startTime: '19:00',
    endTime: '22:00',
    location: 'Student Lounge',
    agenda: '# Welcome Social\n\n## Activities\n- Icebreaker games\n- Food and refreshments\n- Group photos\n- Networking time',
    createdBy: 'admin',
    createdAt: '2024-01-05T12:00:00Z'
  }
];

const mockRSVPs: RSVP[] = [
  {
    id: '1',
    meetingId: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'attending',
    rsvpDate: '2024-01-12T10:00:00Z'
  },
  {
    id: '2',
    meetingId: '1',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'maybe',
    rsvpDate: '2024-01-13T14:30:00Z'
  }
];

export async function getMeetings(): Promise<Meeting[]> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Return mock data for development
  return mockMeetings;
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Return mock data for development
  return mockMeetings.find(m => m.id === id) || null;
}

export async function createMeeting(meeting: CreateMeetingRequest): Promise<Meeting> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Mock implementation for development
  const newMeeting: Meeting = {
    ...meeting,
    id: Date.now().toString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
  };
  return newMeeting;
}

export async function updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting | null> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Mock implementation for development
  const meeting = mockMeetings.find(m => m.id === id);
  if (meeting) {
    return { ...meeting, ...updates };
  }
  return null;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      return true;
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Mock implementation for development
  return mockMeetings.some(m => m.id === id);
}

// RSVP API functions
export async function getRSVPs(meetingId: string): Promise<RSVP[]> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${meetingId}/rsvps`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Return mock data for development
  return mockRSVPs.filter(rsvp => rsvp.meetingId === meetingId);
}

export async function createRSVP(meetingId: string, rsvp: { status: 'attending' | 'not-attending' | 'maybe' }): Promise<RSVP> {
  try {
    const response = await fetch(`${API_BASE}/api/meetings/${meetingId}/rsvps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvp),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.log('Using mock data - backend not available');
  }
  
  // Mock implementation for development
  const newRSVP: RSVP = {
    id: Date.now().toString(),
    meetingId,
    userId: 'current-user',
    userName: 'Current User',
    userEmail: 'user@example.com',
    status: rsvp.status,
    rsvpDate: new Date().toISOString(),
  };
  
  // Remove existing RSVP from same user
  const filteredRSVPs = mockRSVPs.filter(r => !(r.meetingId === meetingId && r.userId === 'current-user'));
  filteredRSVPs.push(newRSVP);
  
  return newRSVP;
}