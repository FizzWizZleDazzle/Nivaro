use crate::models::*;
use crate::handlers::auth::verify_csrf_token;
use chrono::Utc;
use uuid::Uuid;
use worker::*;

pub async fn handle_clubs(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();

    match method {
        Method::Get => {
            // Get all clubs or specific club  
            if path.contains("/clubs/") {
                // Extract club_id from path manually
                let segments: Vec<&str> = path.split('/').collect();
                if let Some(club_id) = segments.get(segments.len() - 1) {
                    if !club_id.is_empty() && *club_id != "clubs" {
                        return get_club(club_id, ctx).await;
                    }
                }
            }
            get_clubs(ctx).await
        }
        Method::Post => {
            // Create new club - requires CSRF protection
            create_club(req, ctx).await
        }
        _ => Response::error("Method not allowed", 405),
    }
}

async fn get_clubs(ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query all clubs from database
    let stmt = db.prepare("SELECT id, name, description, avatar, created_at, updated_at, owner_id FROM clubs ORDER BY created_at DESC");
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch clubs", 500),
    };

    let clubs: Vec<Club> = results
        .into_iter()
        .filter_map(|row| {
            Some(Club {
                id: row["id"].as_str()?.to_string(),
                name: row["name"].as_str()?.to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                avatar: row["avatar"].as_str().map(|s| s.to_string()),
                created_at: row["created_at"].as_str()?.to_string(),
                updated_at: row["updated_at"].as_str()?.to_string(),
                owner_id: row["owner_id"].as_str()?.to_string(),
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(clubs),
        error: None,
    };

    Response::from_json(&response)
}

async fn get_club(club_id: &str, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query specific club from database
    let stmt = db.prepare("SELECT id, name, description, avatar, created_at, updated_at, owner_id FROM clubs WHERE id = ?1");
    let stmt = match stmt.bind(&vec![club_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(row)) => {
            let club = Club {
                id: row["id"].as_str().unwrap_or("").to_string(),
                name: row["name"].as_str().unwrap_or("").to_string(),
                description: row["description"].as_str().map(|s| s.to_string()),
                avatar: row["avatar"].as_str().map(|s| s.to_string()),
                created_at: row["created_at"].as_str().unwrap_or("").to_string(),
                updated_at: row["updated_at"].as_str().unwrap_or("").to_string(),
                owner_id: row["owner_id"].as_str().unwrap_or("").to_string(),
            };

            let response = ApiResponse {
                success: true,
                data: Some(club),
                error: None,
            };

            Response::from_json(&response)
        }
        Ok(None) => {
            let response: ApiResponse<Club> = ApiResponse {
                success: false,
                data: None,
                error: Some("Club not found".to_string()),
            };
            Ok(Response::from_json(&response)?.with_status(404))
        }
        Err(_) => Response::error("Failed to fetch club", 500),
    }
}

async fn create_club(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let create_request: CreateClubRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Create new club in database
    let club_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let stmt = db.prepare("
        INSERT INTO clubs (id, name, description, created_at, updated_at, owner_id)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ");
    
    let stmt = match stmt.bind(&vec![
        club_id.clone().into(),
        create_request.name.clone().into(),
        create_request.description.clone().into(),
        now.clone().into(),
        now.clone().into(),
        user_id.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare club insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to create club", 500);
    }

    // Also add the creator as an admin member
    let member_id = Uuid::new_v4().to_string();
    let member_stmt = db.prepare("
        INSERT INTO members (id, user_id, club_id, role, joined_at)
        VALUES (?1, ?2, ?3, 'admin', ?4)
    ");
    
    if let Ok(stmt) = member_stmt.bind(&vec![
        member_id.into(),
        user_id.clone().into(),
        club_id.clone().into(),
        now.clone().into(),
    ]) {
        let _ = stmt.run().await;
    }

    let club = Club {
        id: club_id,
        name: create_request.name,
        description: Some(create_request.description),
        avatar: None,
        created_at: now.clone(),
        updated_at: now,
        owner_id: user_id, // Use user_id here (after cloning above)
    };

    let response = ApiResponse {
        success: true,
        data: Some(club),
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

// Import the helper function from auth module
use crate::handlers::auth::get_user_id_from_token;
