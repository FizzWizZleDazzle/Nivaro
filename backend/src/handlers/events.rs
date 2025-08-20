use crate::models::*;
use crate::handlers::auth::{verify_csrf_token, get_user_id_from_token};
use chrono::Utc;
use uuid::Uuid;
use worker::*;

pub async fn handle_events(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();

    match method {
        Method::Get => {
            // Require authentication for viewing club events
            if get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            // Extract club_id from path like /clubs/{club_id}/events
            let segments: Vec<&str> = path.split('/').collect();
            if let Some(pos) = segments.iter().position(|&x| x == "clubs") {
                if let Some(club_id) = segments.get(pos + 1) {
                    if !club_id.is_empty() {
                        return get_club_events(club_id, ctx).await;
                    }
                }
            }
            Response::error("Club ID required", 400)
        }
        Method::Post => {
            // Create new event - requires CSRF protection
            create_event(req, ctx).await
        }
        _ => Response::error("Method not allowed", 405),
    }
}

async fn get_club_events(club_id: &str, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query events for the club
    let stmt = db.prepare("
        SELECT id, club_id, title, description, date, location, created_by, created_at
        FROM events 
        WHERE club_id = ?1
        ORDER BY date ASC
    ");

    let stmt = match stmt.bind(&vec![club_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch events", 500),
    };

    let events: Vec<Event> = results
        .into_iter()
        .filter_map(|row| {
            Some(Event {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                title: row["title"].as_str()?.to_string(),
                description: row["description"].as_str()?.to_string(),
                date: row["date"].as_str()?.to_string(),
                location: row["location"].as_str().map(|s| s.to_string()),
                created_by: row["created_by"].as_str()?.to_string(),
                created_at: row["created_at"].as_str()?.to_string(),
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(events),
        error: None,
    };

    Response::from_json(&response)
}

async fn create_event(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let create_request: CreateEventRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Verify user is a member of the club (and ideally an admin, but we'll allow any member for now)
    let member_check_stmt = db.prepare("SELECT role FROM members WHERE user_id = ?1 AND club_id = ?2");
    let member_check_stmt = match member_check_stmt.bind(&vec![user_id.clone().into(), create_request.club_id.clone().into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to check membership", 500),
    };

    match member_check_stmt.first::<serde_json::Value>(None).await {
        Ok(Some(_)) => {}, // User is a member
        Ok(None) => return Response::error("User is not a member of this club", 403),
        Err(_) => return Response::error("Failed to verify membership", 500),
    }

    // Create new event in database
    let event_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let stmt = db.prepare("
        INSERT INTO events (id, club_id, title, description, date, location, created_by, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    ");
    
    let stmt = match stmt.bind(&vec![
        event_id.clone().into(),
        create_request.club_id.clone().into(),
        create_request.title.clone().into(),
        create_request.description.clone().into(),
        create_request.date.clone().into(),
        create_request.location.clone().unwrap_or_else(|| "".to_string()).into(),
        user_id.clone().into(),
        now.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare event insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to create event", 500);
    }

    let event = Event {
        id: event_id,
        club_id: create_request.club_id,
        title: create_request.title,
        description: create_request.description,
        date: create_request.date,
        location: create_request.location,
        created_by: user_id,
        created_at: now,
    };

    let response = ApiResponse {
        success: true,
        data: Some(event),
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

// Request types
#[derive(serde::Deserialize)]
pub struct CreateEventRequest {
    pub club_id: String,
    pub title: String,
    pub description: String,
    pub date: String,
    pub location: Option<String>,
}