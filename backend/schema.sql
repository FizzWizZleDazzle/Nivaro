-- Optimized Nivaro Database Schema 
-- Minimizes D1 write operations by combining related data
-- R2 used only for large files (avatars, documents, videos)

-- Users table (combines profile data to avoid multiple writes)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT, -- R2 URL for avatar image
    bio TEXT,
    skills TEXT, -- JSON array
    social_links TEXT, -- JSON object
    preferences TEXT, -- JSON object
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT
);

-- Sessions table (minimal for JWT validation)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_accessed TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clubs table (all club data in one row to minimize writes)
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT, -- R2 URL for avatar
    owner_id TEXT NOT NULL,
    settings TEXT, -- JSON object
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    member_count INTEGER DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Members table (needed for efficient querying of user's clubs)
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE(user_id, club_id)
);

-- Projects table (all project data in one row)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    club_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
    tech_stack TEXT, -- JSON array
    github_url TEXT,
    demo_url TEXT,
    tasks TEXT, -- JSON array of tasks
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project members (needed for permissions)
CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK (role IN ('owner', 'maintainer', 'contributor', 'viewer')),
    joined_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(project_id, user_id)
);

-- Courses table (all course metadata in one row)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id TEXT NOT NULL,
    club_id TEXT, -- Optional club association
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration_hours INTEGER,
    thumbnail_url TEXT, -- R2 URL for thumbnail
    lessons TEXT NOT NULL, -- JSON array of lesson objects
    requirements TEXT, -- JSON array
    learning_outcomes TEXT, -- JSON array
    is_published INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- Course enrollments (one row per enrollment, includes all progress)
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    enrolled_at TEXT NOT NULL,
    completed_at TEXT,
    last_accessed TEXT,
    progress TEXT, -- JSON object with completed_lessons, quiz_scores, notes, bookmarks
    completion_percentage REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);

-- Meetings table (all meeting data in one row)
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    club_id TEXT NOT NULL,
    host_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    meeting_date TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    meeting_link TEXT,
    is_online INTEGER DEFAULT 0,
    max_attendees INTEGER,
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    agenda TEXT,
    notes TEXT,
    recording_url TEXT, -- YouTube or R2 URL
    attendees TEXT, -- JSON array of attendee objects with RSVP status
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements table (combined with events and activities)
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    club_id TEXT,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'announcement', 'event', 'discussion', 'project_update'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    data TEXT, -- JSON object with type-specific data
    is_pinned INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- Stars table (for favoriting items)
CREATE TABLE IF NOT EXISTS stars (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'project', 'course', 'club'
    starred_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, target_id, target_type)
);

-- Notifications table (all notification data in one row)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    data TEXT, -- JSON object with additional data
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CSRF tokens
CREATE TABLE IF NOT EXISTS csrf_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password resets
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    used_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invite codes
CREATE TABLE IF NOT EXISTS invite_codes (
    code TEXT PRIMARY KEY,
    club_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_by TEXT,
    used_at TEXT,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_club ON members(club_id);
CREATE INDEX IF NOT EXISTS idx_projects_club ON projects(club_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_meetings_club ON meetings(club_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_activities_club ON activities(club_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_stars_user ON stars(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_csrf_expires ON csrf_tokens(expires_at);

-- Example of JSON structures stored in TEXT columns:
-- 
-- courses.lessons: [
--   {
--     "id": "lesson1",
--     "title": "Introduction",
--     "description": "Course introduction",
--     "youtube_video_id": "dQw4w9WgXcQ",
--     "content_markdown": "# Lesson 1\n\nContent here...",
--     "duration_minutes": 30,
--     "resources": [
--       {"title": "Slides", "url": "https://r2.domain.com/slides.pdf"},
--       {"title": "Code", "url": "https://github.com/..."}
--     ]
--   }
-- ]
--
-- enrollments.progress: {
--   "completed_lessons": ["lesson1", "lesson2"],
--   "quiz_scores": {"quiz1": 85, "quiz2": 92},
--   "notes": {"lesson1": "Important points..."},
--   "bookmarks": ["lesson3_timestamp_5:30"],
--   "last_lesson_id": "lesson2"
-- }
--
-- meetings.attendees: [
--   {"user_id": "user1", "name": "John", "rsvp": "yes", "attended": true},
--   {"user_id": "user2", "name": "Jane", "rsvp": "maybe", "attended": false}
-- ]