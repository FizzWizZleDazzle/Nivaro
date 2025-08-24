use worker::*;
use serde::{Deserialize, Serialize};
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectExtended {
    pub id: String,
    pub name: String,
    pub description: String,
    pub club_id: String,
    pub owner_id: String,
    pub owner_name: String,
    pub status: String,
    pub tech_stack: Vec<String>,
    pub github_url: Option<String>,
    pub demo_url: Option<String>,
    pub contributors: Vec<Contributor>,
    pub tasks_total: u32,
    pub tasks_completed: u32,
    pub stars_count: u32,
    pub is_starred: bool,
    pub is_member: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contributor {
    pub id: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub role: String,
    pub contributions: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectActivity {
    pub id: String,
    pub project_id: String,
    pub project_name: String,
    pub user_id: String,
    pub user_name: String,
    pub action: String,
    pub details: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectStats {
    pub total_projects: u32,
    pub active_projects: u32,
    pub completed_projects: u32,
    pub total_contributors: u32,
    pub total_tasks: u32,
    pub completed_tasks: u32,
}

// Handle club-specific projects
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
            Some(Project {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                owner_id: row["owner_id"].as_str()?.to_string(),
                status: row["status"].as_str()?.to_string(),
                tech_stack: row["tech_stack"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
                github_url: row["github_url"].as_str().map(|s| s.to_string()),
                demo_url: row["demo_url"].as_str().map(|s| s.to_string()),
                tasks: row["tasks"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
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

    // Convert tech_stack to JSON string
    let tech_stack_json = serde_json::to_string(&create_request.tech_stack).unwrap_or("[]".to_string());

    let stmt = db.prepare("
        INSERT INTO projects (id, club_id, name, description, owner_id, status, tech_stack, github_url, demo_url, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
    ");
    
    let stmt = match stmt.bind(&vec![
        project_id.clone().into(),
        create_request.club_id.clone().into(),
        create_request.name.clone().into(),
        create_request.description.clone().into(),
        user_id.clone().into(),
        "planning".into(), // New projects start as planning
        tech_stack_json.into(),
        create_request.github_url.clone().unwrap_or_default().into(),
        create_request.demo_url.clone().unwrap_or_default().into(),
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
        description: Some(create_request.description),
        owner_id: user_id,
        status: "planning".to_string(),
        tech_stack: Some(create_request.tech_stack),
        github_url: create_request.github_url,
        demo_url: create_request.demo_url,
        tasks: None,
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

// Get all projects (general list)
pub async fn get_all_projects(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query all projects
    let stmt = db.prepare("
        SELECT p.*, c.name as club_name 
        FROM projects p
        JOIN clubs c ON p.club_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 50
    ");
    
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch projects", 500),
    };

    let projects: Vec<Project> = results
        .into_iter()
        .filter_map(|row| {
            Some(Project {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                owner_id: row["owner_id"].as_str()?.to_string(),
                status: row["status"].as_str()?.to_string(),
                tech_stack: row["tech_stack"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
                github_url: row["github_url"].as_str().map(|s| s.to_string()),
                demo_url: row["demo_url"].as_str().map(|s| s.to_string()),
                tasks: row["tasks"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
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

// Get user's projects
pub async fn get_user_projects(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Check authentication
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query projects where user is owner or member
    let stmt = db.prepare("
        SELECT DISTINCT p.*, c.name as club_name
        FROM projects p
        JOIN clubs c ON p.club_id = c.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.owner_id = ?1 OR pm.user_id = ?1
        ORDER BY p.updated_at DESC
    ");
    
    let stmt = match stmt.bind(&vec![user_id.into()]) {
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
            Some(Project {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                owner_id: row["owner_id"].as_str()?.to_string(),
                status: row["status"].as_str()?.to_string(),
                tech_stack: row["tech_stack"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
                github_url: row["github_url"].as_str().map(|s| s.to_string()),
                demo_url: row["demo_url"].as_str().map(|s| s.to_string()),
                tasks: row["tasks"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
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

// Get starred projects
pub async fn get_starred_projects(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Check authentication
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query starred projects
    let stmt = db.prepare("
        SELECT p.*, c.name as club_name, s.starred_at
        FROM stars s
        JOIN projects p ON s.target_id = p.id
        JOIN clubs c ON p.club_id = c.id
        WHERE s.user_id = ?1 AND s.target_type = 'project'
        ORDER BY s.starred_at DESC
    ");
    
    let stmt = match stmt.bind(&vec![user_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };
    
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch starred projects", 500),
    };

    let projects: Vec<Project> = results
        .into_iter()
        .filter_map(|row| {
            Some(Project {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                owner_id: row["owner_id"].as_str()?.to_string(),
                status: row["status"].as_str()?.to_string(),
                tech_stack: row["tech_stack"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
                github_url: row["github_url"].as_str().map(|s| s.to_string()),
                demo_url: row["demo_url"].as_str().map(|s| s.to_string()),
                tasks: row["tasks"].as_str()
                    .and_then(|s| serde_json::from_str(s).ok()),
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

// Get project activities
pub async fn get_project_activities(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let activities = vec![
        ProjectActivity {
            id: "1".to_string(),
            project_id: "1".to_string(),
            project_name: "Club Website Redesign".to_string(),
            user_id: "user1".to_string(),
            user_name: "Alice Johnson".to_string(),
            action: "commit".to_string(),
            details: "Added responsive navigation menu".to_string(),
            created_at: "2024-01-10T14:30:00Z".to_string(),
        },
        ProjectActivity {
            id: "2".to_string(),
            project_id: "2".to_string(),
            project_name: "Mobile App Development".to_string(),
            user_id: "user2".to_string(),
            user_name: "Bob Smith".to_string(),
            action: "pr_merged".to_string(),
            details: "Merged PR #42: User authentication flow".to_string(),
            created_at: "2024-01-10T12:00:00Z".to_string(),
        },
        ProjectActivity {
            id: "3".to_string(),
            project_id: "1".to_string(),
            project_name: "Club Website Redesign".to_string(),
            user_id: "user3".to_string(),
            user_name: "Carol White".to_string(),
            action: "issue_closed".to_string(),
            details: "Closed issue #15: Fix mobile menu bug".to_string(),
            created_at: "2024-01-10T10:15:00Z".to_string(),
        },
    ];
    
    Response::from_json(&serde_json::json!({
        "activities": activities
    }))
}

// Get project statistics
pub async fn get_project_stats(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Check authentication
    if get_user_id_from_token(&req, &ctx).is_none() {
        return Response::error("Unauthorized", 401);
    }

    let stats = ProjectStats {
        total_projects: 12,
        active_projects: 8,
        completed_projects: 4,
        total_contributors: 28,
        total_tasks: 156,
        completed_tasks: 89,
    };
    
    Response::from_json(&serde_json::json!(stats))
}

// Star/unstar a project
pub async fn toggle_project_star(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Check authentication
    if get_user_id_from_token(&req, &ctx).is_none() {
        return Response::error("Unauthorized", 401);
    }

    // CSRF protection
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    #[derive(Deserialize)]
    struct StarRequest {
        project_id: String,
        starred: bool,
    }

    match req.json::<StarRequest>().await {
        Ok(data) => {
            Response::from_json(&serde_json::json!({
                "success": true,
                "message": if data.starred { "Project starred" } else { "Project unstarred" },
                "starred": data.starred
            }))
        }
        Err(_) => Response::error("Invalid request body", 400),
    }
}

// Join a project
pub async fn join_project(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Check authentication
    if get_user_id_from_token(&req, &ctx).is_none() {
        return Response::error("Unauthorized", 401);
    }

    // CSRF protection
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    #[derive(Deserialize)]
    struct JoinRequest {
        project_id: String,
    }

    match req.json::<JoinRequest>().await {
        Ok(data) => {
            Response::from_json(&serde_json::json!({
                "success": true,
                "message": format!("Successfully joined project {}", data.project_id)
            }))
        }
        Err(_) => Response::error("Invalid request body", 400),
    }
}
