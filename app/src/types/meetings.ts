export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: 'meeting' | 'workshop' | 'social';
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location: string;
  agenda: string; // Markdown content
  maxAttendees?: number;
  createdBy: string; // User ID of admin who created it
  createdAt: string; // ISO date string
  summary?: string; // Post-meeting summary (markdown)
  recordingUrl?: string; // URL to meeting recording
}

export interface RSVP {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'attending' | 'not-attending' | 'maybe';
  rsvpDate: string; // ISO date string
}

export interface Attendance {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  attended: boolean;
  checkedInAt?: string; // ISO date string
}

export interface CreateMeetingRequest {
  title: string;
  description: string;
  type: 'meeting' | 'workshop' | 'social';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: string;
  maxAttendees?: number;
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  summary?: string;
  recordingUrl?: string;
}