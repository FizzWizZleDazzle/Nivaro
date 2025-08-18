use crate::models::*;
use crate::handlers::auth::verify_csrf_token;
use chrono::Utc;
use uuid::Uuid;
use worker::*;

pub async fn handle_members(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();

    match method {
        Method::Get => {
            // Extract club_id from path like /clubs/{club_id}/members
            let segments: Vec<&str> = path.split('/').collect();
            if let Some(pos) = segments.iter().position(|&x| x == "clubs") {
                if let Some(club_id) = segments.get(pos + 1) {
                    if !club_id.is_empty() {
                        return get_club_members(club_id, ctx).await;
                    }
                }
            }
            Response::error("Club ID required", 400)
        }
        Method::Post => {
            // Join club with invite code - requires CSRF protection
            join_club(req, ctx).await
        }
        _ => Response::error("Method not allowed", 405),
    }
}

async fn get_club_members(club_id: &str, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query members with user information using JOIN
    let stmt = db.prepare("
        SELECT 
            m.id, m.user_id, m.club_id, m.role, m.joined_at,
            u.email, u.name, u.avatar, u.created_at as user_created_at, 
            u.updated_at as user_updated_at, u.email_verified, u.is_active
        FROM members m
        INNER JOIN users u ON m.user_id = u.id
        WHERE m.club_id = ?1
        ORDER BY m.joined_at ASC
    ");

    let stmt = match stmt.bind(&vec![club_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch members", 500),
    };

    let members: Vec<Member> = results
        .into_iter()
        .filter_map(|row| {
            let role_str = row["role"].as_str()?;
            let role = match role_str {
                "admin" => MemberRole::Admin,
                "member" => MemberRole::Member,
                _ => return None,
            };

            Some(Member {
                id: row["id"].as_str()?.to_string(),
                user_id: row["user_id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str()?.to_string(),
                role,
                joined_at: row["joined_at"].as_str()?.to_string(),
                user: User {
                    id: row["user_id"].as_str()?.to_string(),
                    email: row["email"].as_str()?.to_string(),
                    name: row["name"].as_str()?.to_string(),
                    avatar: row["avatar"].as_str().map(|s| s.to_string()),
                    created_at: row["user_created_at"].as_str()?.to_string(),
                    updated_at: row["user_updated_at"].as_str()?.to_string(),
                    email_verified: row["email_verified"].as_i64().unwrap_or(0) == 1,
                    is_active: row["is_active"].as_i64().unwrap_or(0) == 1,
                },
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(members),
        error: None,
    };

    Response::from_json(&response)
}

async fn join_club(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let join_request: JoinClubRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Validate invite code and get club_id
    let code_stmt = db.prepare("
        SELECT club_id, expires_at, used_by 
        FROM invite_codes 
        WHERE code = ?1
    ");

    let code_stmt = match code_stmt.bind(&vec![join_request.invite_code.to_uppercase().into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare invite code query", 500),
    };

    let invite_info = match code_stmt.first::<serde_json::Value>(None).await {
        Ok(Some(row)) => row,
        Ok(None) => {
            let response: ApiResponse<Member> = ApiResponse {
                success: false,
                data: None,
                error: Some("Invalid invite code".to_string()),
            };
            return Ok(Response::from_json(&response)?.with_status(400));
        }
        Err(_) => return Response::error("Failed to validate invite code", 500),
    };

    // Check if code is already used
    if invite_info["used_by"].as_str().is_some() {
        let response: ApiResponse<Member> = ApiResponse {
            success: false,
            data: None,
            error: Some("Invite code has already been used".to_string()),
        };
        return Ok(Response::from_json(&response)?.with_status(400));
    }

    // Check if code is expired
    let expires_at = invite_info["expires_at"].as_str().unwrap_or("");
    let now = Utc::now().to_rfc3339();
    if expires_at < now.as_str() {
        let response: ApiResponse<Member> = ApiResponse {
            success: false,
            data: None,
            error: Some("Invite code has expired".to_string()),
        };
        return Ok(Response::from_json(&response)?.with_status(400));
    }

    let club_id = invite_info["club_id"].as_str().unwrap_or("").to_string();

    // Check if user is already a member
    let member_check_stmt = db.prepare("SELECT COUNT(*) as count FROM members WHERE user_id = ?1 AND club_id = ?2");
    let member_check_stmt = match member_check_stmt.bind(&vec![user_id.clone().into(), club_id.clone().into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to check membership", 500),
    };

    if let Ok(Some(result)) = member_check_stmt.first::<serde_json::Value>(None).await {
        if result["count"].as_u64().unwrap_or(0) > 0 {
            let response: ApiResponse<Member> = ApiResponse {
                success: false,
                data: None,
                error: Some("User is already a member of this club".to_string()),
            };
            return Ok(Response::from_json(&response)?.with_status(400));
        }
    }

    // Create membership
    let member_id = Uuid::new_v4().to_string();
    let joined_at = Utc::now().to_rfc3339();

    let member_stmt = db.prepare("
        INSERT INTO members (id, user_id, club_id, role, joined_at)
        VALUES (?1, ?2, ?3, 'member', ?4)
    ");

    let member_stmt = match member_stmt.bind(&vec![
        member_id.clone().into(),
        user_id.clone().into(),
        club_id.clone().into(),
        joined_at.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare member insert", 500),
    };

    if member_stmt.run().await.is_err() {
        return Response::error("Failed to create membership", 500);
    }

    // Mark invite code as used
    let used_at = Utc::now().to_rfc3339();
    let update_code_stmt = db.prepare("UPDATE invite_codes SET used_by = ?1, used_at = ?2 WHERE code = ?3");
    if let Ok(stmt) = update_code_stmt.bind(&vec![
        user_id.clone().into(),
        used_at.into(),
        join_request.invite_code.to_uppercase().into(),
    ]) {
        let _ = stmt.run().await;
    }

    // Get user info for response
    let user_stmt = db.prepare("SELECT id, email, name, avatar, created_at, updated_at, email_verified, is_active FROM users WHERE id = ?1");
    let user_info = match user_stmt.bind(&vec![user_id.clone().into()]) {
        Ok(stmt) => match stmt.first::<serde_json::Value>(None).await {
            Ok(Some(row)) => row,
            _ => return Response::error("Failed to get user info", 500),
        },
        Err(_) => return Response::error("Failed to prepare user query", 500),
    };

    let member = Member {
        id: member_id,
        user_id: user_id.clone(),
        club_id,
        role: MemberRole::Member,
        joined_at,
        user: User {
            id: user_id,
            email: user_info["email"].as_str().unwrap_or("").to_string(),
            name: user_info["name"].as_str().unwrap_or("").to_string(),
            avatar: user_info["avatar"].as_str().map(|s| s.to_string()),
            created_at: user_info["created_at"].as_str().unwrap_or("").to_string(),
            updated_at: user_info["updated_at"].as_str().unwrap_or("").to_string(),
            email_verified: user_info["email_verified"].as_i64().unwrap_or(0) == 1,
            is_active: user_info["is_active"].as_i64().unwrap_or(0) == 1,
        },
    };

    let response = ApiResponse {
        success: true,
        data: Some(member),
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

// Import the helper function from auth module
use crate::handlers::auth::get_user_id_from_token;
