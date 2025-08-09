use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Club {
    pub id: String,
    pub name: String,
    pub description: String,
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
pub struct Project {
    pub id: String,
    pub club_id: String,
    pub name: String,
    pub description: String,
    pub status: String, // planning, active, completed, on-hold
    pub created_by: String,
    pub created_at: String,
    pub updated_at: String,
}

// API Request/Response types
#[derive(Serialize, Deserialize)]
pub struct CreateClubRequest {
    pub name: String,
    pub description: String,
}

#[derive(Serialize, Deserialize)]
pub struct JoinClubRequest {
    pub invite_code: String,
}

#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}