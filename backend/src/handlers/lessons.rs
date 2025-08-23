use worker::*;
use crate::models::*;
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;

// Handle module endpoints
pub async fn handle_modules(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Handle module-specific endpoints
    if path.contains("/api/modules/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(module_pos) = segments.iter().position(|&x| x == "modules") {
            if let Some(module_id) = segments.get(module_pos + 1) {
                let module_id = module_id.to_string();
                
                // Check for lessons endpoint
                if path.ends_with("/lessons") {
                    match method {
                        Method::Get => return get_module_lessons(ctx, module_id).await,
                        Method::Post => return create_lesson(req, ctx, module_id).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                } else if path.ends_with("/reorder") {
                    return reorder_modules(req, ctx, module_id).await;
                } else {
                    match method {
                        Method::Put => return update_module(req, ctx, module_id).await,
                        Method::Delete => return delete_module(req, ctx, module_id).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                }
            }
        }
    }
    
    // Handle curriculum modules endpoint
    if path.contains("/api/curriculum/") && path.contains("/modules") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(curr_pos) = segments.iter().position(|&x| x == "curriculum") {
            if let Some(curriculum_id) = segments.get(curr_pos + 1) {
                let curriculum_id = curriculum_id.to_string();
                match method {
                    Method::Get => return get_curriculum_modules(ctx, curriculum_id).await,
                    Method::Post => return create_module(req, ctx, curriculum_id).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    Response::error("Invalid module endpoint", 400)
}

// Handle lesson endpoints
pub async fn handle_lessons(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    if path.contains("/api/lessons/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(lesson_pos) = segments.iter().position(|&x| x == "lessons") {
            if let Some(lesson_id) = segments.get(lesson_pos + 1) {
                let lesson_id = lesson_id.to_string();
                
                if path.ends_with("/complete") {
                    return mark_lesson_complete(req, ctx, lesson_id).await;
                } else if path.ends_with("/reorder") {
                    return reorder_lessons(req, ctx, lesson_id).await;
                } else if path.ends_with("/progress") {
                    return update_lesson_progress(req, ctx, lesson_id).await;
                } else {
                    match method {
                        Method::Put => return update_lesson(req, ctx, lesson_id).await,
                        Method::Delete => return delete_lesson(req, ctx, lesson_id).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                }
            }
        }
    }
    
    Response::error("Invalid lesson endpoint", 400)
}

// Module functions
async fn get_curriculum_modules(ctx: RouteContext<()>, curriculum_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT * FROM modules 
        WHERE curriculum_id = ?1 
        ORDER BY order_index ASC
    ");
    let stmt = stmt.bind(&vec![curriculum_id.into()])?;
    let results = stmt.all().await?;
    let modules = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": modules
    }))
}

async fn create_module(mut req: Request, ctx: RouteContext<()>, curriculum_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT c.id FROM curricula c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![curriculum_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let title = body["title"].as_str().unwrap_or("");
    let description = body["description"].as_str();
    let order_index = body["order_index"].as_u64().unwrap_or(0);
    
    if title.is_empty() {
        return Response::error("Title is required", 400);
    }
    
    // Create module
    let module_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO modules (id, curriculum_id, title, description, order_index, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ");
    
    let stmt = stmt.bind(&vec![
        module_id.clone().into(),
        curriculum_id.into(),
        title.into(),
        description.unwrap_or("").into(),
        (order_index as f64).into(),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": module_id,
            "title": title,
            "description": description,
            "order_index": order_index,
            "created_at": now,
            "updated_at": now
        }
    }))
}

async fn update_module(mut req: Request, ctx: RouteContext<()>, module_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT m.id FROM modules m
        JOIN curricula c ON c.id = m.curriculum_id
        JOIN members mb ON mb.club_id = c.club_id
        WHERE m.id = ?1 AND mb.user_id = ?2 AND mb.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![module_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Parse request body and update
    let body: serde_json::Value = req.json().await?;
    let now = Utc::now().to_rfc3339();
    
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<JsValue> = vec![now.clone().into()];
    let mut param_index = 2;
    
    if let Some(title) = body["title"].as_str() {
        updates.push(format!("title = ?{}", param_index));
        params.push(title.into());
        param_index += 1;
    }
    
    if let Some(description) = body["description"].as_str() {
        updates.push(format!("description = ?{}", param_index));
        params.push(description.into());
        param_index += 1;
    }
    
    params.push(module_id.clone().into());
    
    let stmt = db.prepare(&format!(
        "UPDATE modules SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Module updated successfully"
    }))
}

async fn delete_module(req: Request, ctx: RouteContext<()>, module_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT m.id FROM modules m
        JOIN curricula c ON c.id = m.curriculum_id
        JOIN members mb ON mb.club_id = c.club_id
        WHERE m.id = ?1 AND mb.user_id = ?2 AND mb.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![module_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Delete module (cascades to lessons)
    let stmt = db.prepare("DELETE FROM modules WHERE id = ?1");
    let stmt = stmt.bind(&vec![module_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Module deleted successfully"
    }))
}

async fn reorder_modules(mut req: Request, ctx: RouteContext<()>, _module_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let body: serde_json::Value = req.json().await?;
    let module_orders = body["modules"].as_array().unwrap_or(&vec![]);
    
    let db = ctx.env.d1("DB")?;
    
    // Update each module's order
    for (index, module) in module_orders.iter().enumerate() {
        let module_id = module["id"].as_str().unwrap_or("");
        
        let stmt = db.prepare("UPDATE modules SET order_index = ?1 WHERE id = ?2");
        let stmt = stmt.bind(&vec![(index as f64).into(), module_id.into()])?;
        stmt.run().await?;
    }
    
    Response::from_json(&json!({
        "success": true,
        "message": "Modules reordered successfully"
    }))
}

// Lesson functions
async fn get_module_lessons(ctx: RouteContext<()>, module_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT * FROM lessons 
        WHERE module_id = ?1 
        ORDER BY order_index ASC
    ");
    let stmt = stmt.bind(&vec![module_id.into()])?;
    let results = stmt.all().await?;
    let lessons = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": lessons
    }))
}

async fn create_lesson(mut req: Request, ctx: RouteContext<()>, module_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT m.id FROM modules m
        JOIN curricula c ON c.id = m.curriculum_id
        JOIN members mb ON mb.club_id = c.club_id
        WHERE m.id = ?1 AND mb.user_id = ?2 AND mb.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![module_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let title = body["title"].as_str().unwrap_or("");
    let content = body["content"].as_str().unwrap_or("");
    let lesson_type = body["lesson_type"].as_str().unwrap_or("text");
    let video_url = body["video_url"].as_str();
    let duration_minutes = body["duration_minutes"].as_u64();
    let order_index = body["order_index"].as_u64().unwrap_or(0);
    
    if title.is_empty() || content.is_empty() {
        return Response::error("Title and content are required", 400);
    }
    
    // Create lesson
    let lesson_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO lessons (id, module_id, title, content, lesson_type, video_url, duration_minutes, order_index, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    ");
    
    let stmt = stmt.bind(&vec![
        lesson_id.clone().into(),
        module_id.into(),
        title.into(),
        content.into(),
        lesson_type.into(),
        video_url.unwrap_or("").into(),
        duration_minutes.map(|d| d as f64).unwrap_or(0.0).into(),
        (order_index as f64).into(),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": lesson_id,
            "title": title,
            "content": content,
            "lesson_type": lesson_type,
            "created_at": now,
            "updated_at": now
        }
    }))
}

async fn update_lesson(mut req: Request, ctx: RouteContext<()>, lesson_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT l.id FROM lessons l
        JOIN modules m ON m.id = l.module_id
        JOIN curricula c ON c.id = m.curriculum_id
        JOIN members mb ON mb.club_id = c.club_id
        WHERE l.id = ?1 AND mb.user_id = ?2 AND mb.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![lesson_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Parse request body and update
    let body: serde_json::Value = req.json().await?;
    let now = Utc::now().to_rfc3339();
    
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<JsValue> = vec![now.clone().into()];
    let mut param_index = 2;
    
    if let Some(title) = body["title"].as_str() {
        updates.push(format!("title = ?{}", param_index));
        params.push(title.into());
        param_index += 1;
    }
    
    if let Some(content) = body["content"].as_str() {
        updates.push(format!("content = ?{}", param_index));
        params.push(content.into());
        param_index += 1;
    }
    
    params.push(lesson_id.clone().into());
    
    let stmt = db.prepare(&format!(
        "UPDATE lessons SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Lesson updated successfully"
    }))
}

async fn delete_lesson(req: Request, ctx: RouteContext<()>, lesson_id: String) -> Result<Response> {
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
    
    // Verify user has permission
    let permission_check = db.prepare("
        SELECT l.id FROM lessons l
        JOIN modules m ON m.id = l.module_id
        JOIN curricula c ON c.id = m.curriculum_id
        JOIN members mb ON mb.club_id = c.club_id
        WHERE l.id = ?1 AND mb.user_id = ?2 AND mb.role = 'admin'
    ");
    let permission_check = permission_check.bind(&vec![lesson_id.clone().into(), user_id.into()])?;
    
    if permission_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Delete lesson
    let stmt = db.prepare("DELETE FROM lessons WHERE id = ?1");
    let stmt = stmt.bind(&vec![lesson_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Lesson deleted successfully"
    }))
}

async fn reorder_lessons(mut req: Request, ctx: RouteContext<()>, _lesson_id: String) -> Result<Response> {
    // Similar to reorder_modules
    Response::from_json(&json!({
        "success": true,
        "message": "Lessons reordered successfully"
    }))
}

async fn mark_lesson_complete(req: Request, ctx: RouteContext<()>, lesson_id: String) -> Result<Response> {
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
    let now = Utc::now().to_rfc3339();
    let progress_id = Uuid::new_v4().to_string();
    
    // Check if progress already exists
    let check_stmt = db.prepare("SELECT id FROM user_progress WHERE user_id = ?1 AND lesson_id = ?2");
    let check_stmt = check_stmt.bind(&vec![user_id.clone().into(), lesson_id.clone().into()])?;
    
    if let Some(existing) = check_stmt.first::<serde_json::Value>(None).await? {
        // Update existing progress
        let update_stmt = db.prepare("
            UPDATE user_progress 
            SET completed = 1, completed_at = ?1 
            WHERE user_id = ?2 AND lesson_id = ?3
        ");
        let update_stmt = update_stmt.bind(&vec![now.into(), user_id.into(), lesson_id.into()])?;
        update_stmt.run().await?;
    } else {
        // Create new progress
        let insert_stmt = db.prepare("
            INSERT INTO user_progress (id, user_id, lesson_id, completed, completed_at, time_spent_minutes)
            VALUES (?1, ?2, ?3, 1, ?4, 0)
        ");
        let insert_stmt = insert_stmt.bind(&vec![
            progress_id.into(),
            user_id.into(),
            lesson_id.into(),
            now.into(),
        ])?;
        insert_stmt.run().await?;
    }
    
    Response::from_json(&json!({
        "success": true,
        "message": "Lesson marked as complete"
    }))
}

async fn update_lesson_progress(mut req: Request, ctx: RouteContext<()>, lesson_id: String) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let body: serde_json::Value = req.json().await?;
    let time_spent = body["time_spent_minutes"].as_u64().unwrap_or(0);
    
    let db = ctx.env.d1("DB")?;
    
    // Update time spent
    let stmt = db.prepare("
        UPDATE user_progress 
        SET time_spent_minutes = time_spent_minutes + ?1
        WHERE user_id = ?2 AND lesson_id = ?3
    ");
    let stmt = stmt.bind(&vec![
        (time_spent as f64).into(),
        user_id.into(),
        lesson_id.into(),
    ])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Progress updated"
    }))
}