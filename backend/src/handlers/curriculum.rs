use worker::*;
use crate::models::*;
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;

pub async fn handle_curriculum(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Parse club ID from path
    if path.contains("/api/clubs/") && path.contains("/curriculum") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                let club_id = club_id.to_string();
                
                // Check if there's a curriculum_id in the path
                if path.contains("/curriculum/") {
                    let curriculum_segments: Vec<&str> = path.split("/curriculum/").collect();
                    if curriculum_segments.len() > 1 {
                        let curriculum_id = curriculum_segments[1].split('/').next().unwrap_or("").to_string();
                        
                        match method {
                            Method::Put => return update_curriculum(req, ctx, club_id, curriculum_id).await,
                            Method::Delete => return delete_curriculum(req, ctx, curriculum_id).await,
                            _ => return Response::error("Method not allowed", 405)
                        }
                    }
                }
                
                // Otherwise handle club curriculum endpoints
                match method {
                    Method::Get => return get_curriculum(ctx, club_id).await,
                    Method::Post => return create_curriculum(req, ctx, club_id).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Handle publish endpoint
    if path.contains("/api/curriculum/") && path.ends_with("/publish") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(curr_id_pos) = segments.iter().position(|&x| x == "curriculum") {
            if let Some(curriculum_id) = segments.get(curr_id_pos + 1) {
                return publish_curriculum(req, ctx, curriculum_id.to_string()).await;
            }
        }
    }
    
    Response::error("Invalid curriculum endpoint", 400)
}

async fn get_curriculum(ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    // Get curriculum with modules and lessons
    let curriculum_stmt = db.prepare("
        SELECT c.*, u.name as creator_name 
        FROM curricula c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.club_id = ?1
        ORDER BY c.created_at DESC
        LIMIT 1
    ");
    
    let curriculum_stmt = curriculum_stmt.bind(&vec![club_id.clone().into()])?;
    
    match curriculum_stmt.first::<serde_json::Value>(None).await {
        Ok(Some(curriculum_data)) => {
            let curriculum_id = curriculum_data["id"].as_str().unwrap_or("");
            
            // Get modules for this curriculum
            let modules_stmt = db.prepare("
                SELECT * FROM modules 
                WHERE curriculum_id = ?1 
                ORDER BY order_index ASC
            ");
            let modules_stmt = modules_stmt.bind(&vec![curriculum_id.into()])?;
            let modules_results = modules_stmt.all().await?;
            let modules = modules_results.results::<serde_json::Value>()?;
            
            // Get lessons for each module
            let mut modules_with_lessons = vec![];
            for module in modules {
                let module_id = module["id"].as_str().unwrap_or("");
                
                let lessons_stmt = db.prepare("
                    SELECT * FROM lessons 
                    WHERE module_id = ?1 
                    ORDER BY order_index ASC
                ");
                let lessons_stmt = lessons_stmt.bind(&vec![module_id.into()])?;
                let lessons_results = lessons_stmt.all().await?;
                let lessons = lessons_results.results::<serde_json::Value>()?;
                
                let mut module_with_lessons = module.clone();
                module_with_lessons["lessons"] = json!(lessons);
                modules_with_lessons.push(module_with_lessons);
            }
            
            let mut curriculum = curriculum_data.clone();
            curriculum["modules"] = json!(modules_with_lessons);
            
            Response::from_json(&json!({
                "success": true,
                "data": curriculum
            }))
        }
        Ok(None) => {
            Response::from_json(&json!({
                "success": true,
                "data": null
            }))
        }
        Err(_) => Response::error("Failed to fetch curriculum", 500)
    }
}

async fn create_curriculum(mut req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let title = body["title"].as_str().unwrap_or("");
    let description = body["description"].as_str();
    
    if title.is_empty() {
        return Response::error("Title is required", 400);
    }
    
    let db = ctx.env.d1("DB")?;
    
    // Verify user is club owner or admin
    let member_check = db.prepare("
        SELECT role FROM members 
        WHERE user_id = ?1 AND club_id = ?2 AND role = 'admin'
    ");
    let member_check = member_check.bind(&vec![user_id.clone().into(), club_id.clone().into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can create curriculum", 403);
    }
    
    // Create curriculum
    let curriculum_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO curricula (id, club_id, title, description, created_by, created_at, updated_at, is_published)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        curriculum_id.clone().into(),
        club_id.into(),
        title.into(),
        description.unwrap_or("").into(),
        user_id.into(),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": curriculum_id,
            "title": title,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "is_published": false
        }
    }))
}

async fn update_curriculum(mut req: Request, ctx: RouteContext<()>, club_id: String, curriculum_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Verify user is club admin
    let member_check = db.prepare("
        SELECT role FROM members 
        WHERE user_id = ?1 AND club_id = ?2 AND role = 'admin'
    ");
    let member_check = member_check.bind(&vec![user_id.into(), club_id.into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can update curriculum", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let title = body["title"].as_str();
    let description = body["description"].as_str();
    
    let now = Utc::now().to_rfc3339();
    
    // Build update query dynamically
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<JsValue> = vec![now.clone().into()];
    let mut param_index = 2;
    
    if let Some(t) = title {
        updates.push(format!("title = ?{}", param_index));
        params.push(t.into());
        param_index += 1;
    }
    
    if let Some(d) = description {
        updates.push(format!("description = ?{}", param_index));
        params.push(d.into());
        param_index += 1;
    }
    
    params.push(curriculum_id.clone().into());
    
    let stmt = db.prepare(&format!(
        "UPDATE curricula SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": curriculum_id,
            "updated_at": now
        }
    }))
}

async fn delete_curriculum(req: Request, ctx: RouteContext<()>, curriculum_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Verify user owns the curriculum
    let curriculum_check = db.prepare("
        SELECT c.club_id FROM curricula c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let curriculum_check = curriculum_check.bind(&vec![curriculum_id.clone().into(), user_id.into()])?;
    
    if curriculum_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can delete curriculum", 403);
    }
    
    // Delete curriculum (cascades to modules and lessons)
    let stmt = db.prepare("DELETE FROM curricula WHERE id = ?1");
    let stmt = stmt.bind(&vec![curriculum_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Curriculum deleted successfully"
    }))
}

async fn publish_curriculum(req: Request, ctx: RouteContext<()>, curriculum_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Verify user owns the curriculum
    let curriculum_check = db.prepare("
        SELECT c.club_id FROM curricula c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let curriculum_check = curriculum_check.bind(&vec![curriculum_id.clone().into(), user_id.into()])?;
    
    if curriculum_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can publish curriculum", 403);
    }
    
    // Update curriculum to published
    let stmt = db.prepare("UPDATE curricula SET is_published = 1, updated_at = ?1 WHERE id = ?2");
    let stmt = stmt.bind(&vec![Utc::now().to_rfc3339().into(), curriculum_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Curriculum published successfully"
    }))
}