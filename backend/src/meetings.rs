use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct Meeting {
    pub id: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "type")]
    pub meeting_type: String,
    pub date: String,
    #[serde(rename = "startTime")]
    pub start_time: String,
    #[serde(rename = "endTime")]
    pub end_time: String,
    pub location: String,
    pub agenda: String,
    #[serde(rename = "maxAttendees", skip_serializing_if = "Option::is_none")]
    pub max_attendees: Option<u32>,
    #[serde(rename = "createdBy")]
    pub created_by: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(rename = "recordingUrl", skip_serializing_if = "Option::is_none")]
    pub recording_url: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RSVP {
    pub id: String,
    #[serde(rename = "meetingId")]
    pub meeting_id: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    #[serde(rename = "userName")]
    pub user_name: String,
    #[serde(rename = "userEmail")]
    pub user_email: String,
    pub status: String,
    #[serde(rename = "rsvpDate")]
    pub rsvp_date: String,
}

#[derive(Deserialize)]
pub struct CreateMeetingRequest {
    pub title: String,
    pub description: String,
    #[serde(rename = "type")]
    pub meeting_type: String,
    pub date: String,
    #[serde(rename = "startTime")]
    pub start_time: String,
    #[serde(rename = "endTime")]
    pub end_time: String,
    pub location: String,
    pub agenda: String,
    #[serde(rename = "maxAttendees")]
    pub max_attendees: Option<u32>,
}

#[derive(Deserialize)]
pub struct UpdateMeetingRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub meeting_type: Option<String>,
    pub date: Option<String>,
    #[serde(rename = "startTime")]
    pub start_time: Option<String>,
    #[serde(rename = "endTime")]
    pub end_time: Option<String>,
    pub location: Option<String>,
    pub agenda: Option<String>,
    #[serde(rename = "maxAttendees")]
    pub max_attendees: Option<u32>,
    pub summary: Option<String>,
    #[serde(rename = "recordingUrl")]
    pub recording_url: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateRSVPRequest {
    pub status: String,
}

// Mock data storage (in a real implementation, this would use a database)
fn get_mock_meetings() -> Vec<Meeting> {
    vec![
        Meeting {
            id: "1".to_string(),
            title: "Weekly Club Meeting".to_string(),
            description: "Our regular weekly meeting to discuss club activities and upcoming events.".to_string(),
            meeting_type: "meeting".to_string(),
            date: "2024-01-15".to_string(),
            start_time: "18:00".to_string(),
            end_time: "19:30".to_string(),
            location: "Room 101, Student Center".to_string(),
            agenda: "# Weekly Meeting Agenda\n\n## Topics\n1. Welcome new members\n2. Review last week's activities\n3. Plan upcoming events\n4. Q&A Session".to_string(),
            max_attendees: Some(50),
            created_by: "admin".to_string(),
            created_at: "2024-01-10T10:00:00Z".to_string(),
            summary: None,
            recording_url: None,
        },
        Meeting {
            id: "2".to_string(),
            title: "Photography Workshop".to_string(),
            description: "Learn the basics of digital photography with hands-on exercises.".to_string(),
            meeting_type: "workshop".to_string(),
            date: "2024-01-20".to_string(),
            start_time: "14:00".to_string(),
            end_time: "17:00".to_string(),
            location: "Art Building, Studio 2".to_string(),
            agenda: "# Photography Workshop\n\n## Schedule\n- **2:00-2:30 PM**: Introduction to Camera Settings\n- **2:30-3:15 PM**: Composition Techniques\n- **3:15-3:30 PM**: Break\n- **3:30-4:30 PM**: Hands-on Practice\n- **4:30-5:00 PM**: Review and Feedback".to_string(),
            max_attendees: Some(20),
            created_by: "admin".to_string(),
            created_at: "2024-01-08T15:30:00Z".to_string(),
            summary: None,
            recording_url: None,
        },
        Meeting {
            id: "3".to_string(),
            title: "Welcome Social Event".to_string(),
            description: "A casual social gathering to welcome new members and build community.".to_string(),
            meeting_type: "social".to_string(),
            date: "2024-01-25".to_string(),
            start_time: "19:00".to_string(),
            end_time: "22:00".to_string(),
            location: "Student Lounge".to_string(),
            agenda: "# Welcome Social\n\n## Activities\n- Icebreaker games\n- Food and refreshments\n- Group photos\n- Networking time".to_string(),
            max_attendees: None,
            created_by: "admin".to_string(),
            created_at: "2024-01-05T12:00:00Z".to_string(),
            summary: None,
            recording_url: None,
        },
    ]
}

fn get_mock_rsvps() -> Vec<RSVP> {
    vec![
        RSVP {
            id: "1".to_string(),
            meeting_id: "1".to_string(),
            user_id: "user1".to_string(),
            user_name: "John Doe".to_string(),
            user_email: "john@example.com".to_string(),
            status: "attending".to_string(),
            rsvp_date: "2024-01-12T10:00:00Z".to_string(),
        },
        RSVP {
            id: "2".to_string(),
            meeting_id: "1".to_string(),
            user_id: "user2".to_string(),
            user_name: "Jane Smith".to_string(),
            user_email: "jane@example.com".to_string(),
            status: "maybe".to_string(),
            rsvp_date: "2024-01-13T14:30:00Z".to_string(),
        },
    ]
}

// API functions
pub async fn get_meetings() -> Vec<Meeting> {
    get_mock_meetings()
}

pub async fn get_meeting(id: &str) -> Option<Meeting> {
    get_mock_meetings().into_iter().find(|m| m.id == id)
}

pub async fn create_meeting(req: CreateMeetingRequest) -> Meeting {
    let now = chrono::Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    Meeting {
        id,
        title: req.title,
        description: req.description,
        meeting_type: req.meeting_type,
        date: req.date,
        start_time: req.start_time,
        end_time: req.end_time,
        location: req.location,
        agenda: req.agenda,
        max_attendees: req.max_attendees,
        created_by: "admin".to_string(), // In a real app, this would come from auth
        created_at: now,
        summary: None,
        recording_url: None,
    }
}

pub async fn update_meeting(id: &str, updates: UpdateMeetingRequest) -> Option<Meeting> {
    if let Some(mut meeting) = get_meeting(id).await {
        if let Some(title) = updates.title {
            meeting.title = title;
        }
        if let Some(description) = updates.description {
            meeting.description = description;
        }
        if let Some(meeting_type) = updates.meeting_type {
            meeting.meeting_type = meeting_type;
        }
        if let Some(date) = updates.date {
            meeting.date = date;
        }
        if let Some(start_time) = updates.start_time {
            meeting.start_time = start_time;
        }
        if let Some(end_time) = updates.end_time {
            meeting.end_time = end_time;
        }
        if let Some(location) = updates.location {
            meeting.location = location;
        }
        if let Some(agenda) = updates.agenda {
            meeting.agenda = agenda;
        }
        if let Some(max_attendees) = updates.max_attendees {
            meeting.max_attendees = Some(max_attendees);
        }
        if let Some(summary) = updates.summary {
            meeting.summary = Some(summary);
        }
        if let Some(recording_url) = updates.recording_url {
            meeting.recording_url = Some(recording_url);
        }
        Some(meeting)
    } else {
        None
    }
}

pub async fn delete_meeting(id: &str) -> bool {
    // In a real implementation, this would delete from the database
    get_meeting(id).await.is_some()
}

pub async fn get_rsvps(meeting_id: &str) -> Vec<RSVP> {
    get_mock_rsvps()
        .into_iter()
        .filter(|r| r.meeting_id == meeting_id)
        .collect()
}

pub async fn create_rsvp(meeting_id: &str, req: CreateRSVPRequest) -> RSVP {
    let now = chrono::Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    RSVP {
        id,
        meeting_id: meeting_id.to_string(),
        user_id: "current-user".to_string(), // In a real app, this would come from auth
        user_name: "Current User".to_string(),
        user_email: "user@example.com".to_string(),
        status: req.status,
        rsvp_date: now,
    }
}
