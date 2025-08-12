use serde::{Deserialize, Serialize};

// User and Authentication models
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub email_verified: bool,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub avatar: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub email_verified: bool,
    pub is_active: bool,
    pub last_login: Option<String>,
    pub failed_login_attempts: u32,
    pub locked_until: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub expires_at: String,
    pub created_at: String,
    pub last_accessed: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EmailVerification {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub email: String,
    pub expires_at: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PasswordReset {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub expires_at: String,
    pub created_at: String,
    pub used_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SocialAccount {
    pub id: String,
    pub user_id: String,
    pub provider: SocialProvider,
    pub provider_id: String,
    pub email: String,
    pub name: String,
    pub avatar: Option<String>,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum SocialProvider {
    Google,
    GitHub,
    Microsoft,
    Discord,
}

// Club models
#[derive(Serialize, Deserialize, Clone)]
pub struct Club {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub avatar: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub owner_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum MemberRole {
    Admin,
    Member,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Member {
    pub id: String,
    pub user_id: String,
    pub club_id: String,
    pub role: MemberRole,
    pub joined_at: String,
    pub user: User,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct InviteCode {
    pub code: String,
    pub club_id: String,
    pub created_by: String,
    pub expires_at: String,
    pub used_by: Option<String>,
    pub used_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Event {
    pub id: String,
    pub club_id: String,
    pub title: String,
    pub description: String,
    pub date: String,
    pub location: Option<String>,
    pub created_by: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Announcement {
    pub id: String,
    pub club_id: String,
    pub title: String,
    pub content: String,
    pub created_by: String,
    pub created_at: String,
    pub pinned: bool,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ProjectStatus {
    Planning,
    Active,
    Completed,
    OnHold,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub club_id: String,
    pub name: String,
    pub description: String,
    pub status: ProjectStatus,
    pub created_by: String,
    pub created_at: String,
    pub updated_at: String,
}

// Learning models
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Course {
    pub id: String,
    pub title: String,
    pub description: String,
    pub club_id: String,
    pub is_published: bool,
    pub difficulty: CourseDifficulty,
    pub estimated_duration: u32, // in minutes
    pub created_by: String,      // admin user id
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

// Auth API Request types
#[derive(Serialize, Deserialize, Debug)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub new_password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub email: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SocialLoginRequest {
    pub provider: SocialProvider,
    pub access_token: String,
    pub profile: SocialUserProfile,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SocialUserProfile {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar: Option<String>,
}

// Auth API Response types
#[derive(Serialize, Deserialize, Debug)]
pub struct AuthResponse {
    pub success: bool,
    pub user: Option<User>,
    pub token: Option<String>,
    pub expires_at: Option<String>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SessionInfo {
    pub user: User,
    pub session: Session,
}

// Other API Request/Response types
#[derive(Serialize, Deserialize)]
pub struct CreateClubRequest {
    pub name: String,
    pub description: String,
}

#[derive(Serialize, Deserialize)]
pub struct JoinClubRequest {
    pub invite_code: String,
}

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

#[derive(Serialize, Deserialize)]
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
