use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Club {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String, // ISO 8601 timestamp
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Course {
    pub id: String,
    pub title: String,
    pub description: String,
    pub club_id: String,
    pub is_published: bool,
    pub difficulty: CourseDifficulty,
    pub estimated_duration: u32, // in minutes
    pub created_by: String, // admin user id
    pub created_at: String,
    pub updated_at: String,
    pub lessons: Vec<Lesson>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CourseDifficulty {
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub content: LessonContent,
    pub order: u32,
    pub is_published: bool,
    pub estimated_duration: u32, // in minutes
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonContent {
    pub rich_text: Option<String>, // HTML or markdown content
    pub video_url: Option<String>,
    pub video_embed_id: Option<String>, // YouTube, Vimeo, etc.
    pub code_snippets: Option<Vec<CodeSnippet>>,
    pub resources: Option<Vec<Resource>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSnippet {
    pub id: String,
    pub language: String,
    pub code: String,
    pub title: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resource {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub resource_type: ResourceType,
    pub url: String,
    pub file_size: Option<u64>, // in bytes
    pub mime_type: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResourceType {
    File,
    Link,
    Document,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProgress {
    pub user_id: String,
    pub course_id: String,
    pub completed_lessons: Vec<String>, // lesson IDs
    pub started_at: String,
    pub last_accessed_at: String,
    pub completed_at: Option<String>,
    pub progress_percentage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonProgress {
    pub user_id: String,
    pub lesson_id: String,
    pub is_completed: bool,
    pub time_spent: u32, // in minutes
    pub completed_at: Option<String>,
    pub last_accessed_at: String,
}

// API Response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoursesResponse {
    pub courses: Vec<Course>,
    pub total: u32,
    pub page: u32,
    pub limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CourseWithProgress {
    #[serde(flatten)]
    pub course: Course,
    pub progress: Option<UserProgress>,
}

// Request types for API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCourseRequest {
    pub title: String,
    pub description: String,
    pub club_id: String,
    pub difficulty: CourseDifficulty,
    pub estimated_duration: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateLessonRequest {
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub content: LessonContent,
    pub estimated_duration: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProgressRequest {
    pub lesson_id: String,
    pub is_completed: bool,
    pub time_spent: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}