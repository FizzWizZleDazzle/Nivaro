use crate::models::*;
use crate::handlers::auth::{verify_csrf_token, get_user_id_from_token};
use chrono::Utc;
use uuid::Uuid;
use worker::*;

pub async fn handle_projects(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();

    match method {
        Method::Get => {
            // Require authentication for viewing club projects
            if get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            // Extract club_id from path like /clubs/{club_id}/projects
            let segments: Vec<&str> = path.split('/').collect();
            if let Some(pos) = segments.iter().position(|&x| x == "clubs") {
                if let Some(club_id) = segments.get(pos + 1) {
                    if !club_id.is_empty() {
                        return get_club_projects(club_id, ctx).await;
                    }
                }
            }
            Response::error("Club ID required", 400)
        }
        Method::Post => {
            // Create new project - requires CSRF protection
            create_project(req, ctx).await
        }
        _ => Response::error("Method not allowed", 405),
    }
}

async fn get_club_projects(club_id: &str, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query projects for the club
    let stmt = db.prepare("
        SELECT id, club_id, name, description, status, created_by, created_at, updated_at
        FROM projects 
        WHERE club_id = ?1
        ORDER BY created_at DESC
    ");

    let stmt = match stmt.bind(&vec![club_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch projects", 500),
    };

    let projects: Vec<Project> = results
        .into_iter()
        .filter_map(|row| {
            let status_str = row["status"].as_str()?;
            let status = match status_str {
                "planning" => ProjectStatus::Planning,
                "active" => ProjectStatus::Active,
                "completed" => ProjectStatus::Completed,
                "on-hold" => ProjectStatus::OnHold,
                _ => return None,
            };

            Some(Project {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str()?.to_string(),
                status,
                created_by: row["created_by"].as_str()?.to_string(),
                created_at: row["created_at"].as_str()?.to_string(),
                updated_at: row["updated_at"].as_str()?.to_string(),
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(projects),
        error: None,
    };

    Response::from_json(&response)
}

async fn create_project(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let create_request: CreateProjectRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Verify user is a member of the club (any member can create projects)
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

    // Create new project in database
    let project_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Convert status enum to string
    let status_str = match create_request.status {
        ProjectStatus::Planning => "planning",
        ProjectStatus::Active => "active",
        ProjectStatus::Completed => "completed",
        ProjectStatus::OnHold => "on-hold",
    };

    let stmt = db.prepare("
        INSERT INTO projects (id, club_id, name, description, status, created_by, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    ");
    
    let stmt = match stmt.bind(&vec![
        project_id.clone().into(),
        create_request.club_id.clone().into(),
        create_request.name.clone().into(),
        create_request.description.clone().into(),
        status_str.into(),
        user_id.clone().into(),
        now.clone().into(),
        now.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare project insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to create project", 500);
    }

    let project = Project {
        id: project_id,
        club_id: create_request.club_id,
        name: create_request.name,
        description: create_request.description,
        status: create_request.status,
        created_by: user_id,
        created_at: now.clone(),
        updated_at: now,
    };

    let response = ApiResponse {
        success: true,
        data: Some(project),
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

// Request types
#[derive(serde::Deserialize)]
pub struct CreateProjectRequest {
    pub club_id: String,
    pub name: String,
    pub description: String,
    pub status: ProjectStatus,
}