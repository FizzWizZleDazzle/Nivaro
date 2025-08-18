use crate::models::*;
use crate::handlers::auth::{verify_csrf_token, get_user_id_from_token};
use chrono::Utc;
use uuid::Uuid;
use worker::*;

pub async fn handle_announcements(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();

    match method {
        Method::Get => {
            // Extract club_id from path like /clubs/{club_id}/announcements
            let segments: Vec<&str> = path.split('/').collect();
            if let Some(pos) = segments.iter().position(|&x| x == "clubs") {
                if let Some(club_id) = segments.get(pos + 1) {
                    if !club_id.is_empty() {
                        return get_club_announcements(club_id, ctx).await;
                    }
                }
            }
            Response::error("Club ID required", 400)
        }
        Method::Post => {
            // Create new announcement - requires CSRF protection
            create_announcement(req, ctx).await
        }
        _ => Response::error("Method not allowed", 405),
    }
}

async fn get_club_announcements(club_id: &str, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query announcements for the club
    let stmt = db.prepare("
        SELECT id, club_id, title, content, created_by, created_at, pinned
        FROM announcements 
        WHERE club_id = ?1
        ORDER BY pinned DESC, created_at DESC
    ");

    let stmt = match stmt.bind(&vec![club_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch announcements", 500),
    };

    let announcements: Vec<Announcement> = results
        .into_iter()
        .filter_map(|row| {
            Some(Announcement {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                title: row["title"].as_str()?.to_string(),
                content: row["content"].as_str()?.to_string(),
                created_by: row["created_by"].as_str()?.to_string(),
                created_at: row["created_at"].as_str()?.to_string(),
                pinned: row["pinned"].as_i64().unwrap_or(0) == 1,
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(announcements),
        error: None,
    };

    Response::from_json(&response)
}

async fn create_announcement(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let create_request: CreateAnnouncementRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Verify user is an admin of the club (only admins can create announcements)
    let member_check_stmt = db.prepare("SELECT role FROM members WHERE user_id = ?1 AND club_id = ?2");
    let member_check_stmt = match member_check_stmt.bind(&vec![user_id.clone().into(), create_request.club_id.clone().into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to check membership", 500),
    };

    match member_check_stmt.first::<serde_json::Value>(None).await {
        Ok(Some(row)) => {
            if row["role"].as_str().unwrap_or("") != "admin" {
                return Response::error("Only club admins can create announcements", 403);
            }
        },
        Ok(None) => return Response::error("User is not a member of this club", 403),
        Err(_) => return Response::error("Failed to verify membership", 500),
    }

    // Create new announcement in database
    let announcement_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let stmt = db.prepare("
        INSERT INTO announcements (id, club_id, title, content, created_by, created_at, pinned)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ");
    
    let stmt = match stmt.bind(&vec![
        announcement_id.clone().into(),
        create_request.club_id.clone().into(),
        create_request.title.clone().into(),
        create_request.content.clone().into(),
        user_id.clone().into(),
        now.clone().into(),
        (if create_request.pinned { 1 } else { 0 }).into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare announcement insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to create announcement", 500);
    }

    let announcement = Announcement {
        id: announcement_id,
        club_id: create_request.club_id,
        title: create_request.title,
        content: create_request.content,
        created_by: user_id,
        created_at: now,
        pinned: create_request.pinned,
    };

    let response = ApiResponse {
        success: true,
        data: Some(announcement),
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

// Request types
#[derive(serde::Deserialize)]
pub struct CreateAnnouncementRequest {
    pub club_id: String,
    pub title: String,
    pub content: String,
    pub pinned: bool,
}