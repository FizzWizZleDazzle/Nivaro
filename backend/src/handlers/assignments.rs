use worker::*;
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;
use worker::wasm_bindgen::JsValue;

pub async fn handle_assignments(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Handle club assignments
    if path.contains("/api/clubs/") && path.contains("/assignments") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_pos + 1) {
                let club_id = club_id.to_string();
                
                match method {
                    Method::Get => return get_club_assignments(ctx, club_id).await,
                    Method::Post => return create_assignment(req, ctx, club_id).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Handle specific assignment
    if path.contains("/api/assignments/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(assign_pos) = segments.iter().position(|&x| x == "assignments") {
            if let Some(assignment_id) = segments.get(assign_pos + 1) {
                let assignment_id = assignment_id.to_string();
                
                // Check for sub-endpoints
                if path.ends_with("/submissions") {
                    return get_assignment_submissions(req, ctx, assignment_id).await;
                } else if path.ends_with("/submission") {
                    return get_user_submission(req, ctx, assignment_id).await;
                } else if path.ends_with("/submit") {
                    return submit_assignment(req, ctx, assignment_id).await;
                } else {
                    match method {
                        Method::Get => return get_assignment(ctx, assignment_id).await,
                        Method::Put => return update_assignment(req, ctx, assignment_id).await,
                        Method::Delete => return delete_assignment(req, ctx, assignment_id).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                }
            }
        }
    }
    
    // Handle submission endpoints
    if path.contains("/api/submissions/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(sub_pos) = segments.iter().position(|&x| x == "submissions") {
            if let Some(submission_id) = segments.get(sub_pos + 1) {
                let submission_id = submission_id.to_string();
                
                if path.ends_with("/grade") {
                    return grade_submission(req, ctx, submission_id).await;
                } else {
                    match method {
                        Method::Get => return get_submission(ctx, submission_id).await,
                        Method::Put => return update_submission(req, ctx, submission_id).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                }
            }
        }
    }
    
    Response::error("Invalid assignment endpoint", 400)
}

async fn get_club_assignments(ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT a.*, u.name as creator_name
        FROM assignments a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.club_id = ?1
        ORDER BY a.created_at DESC
    ");
    let stmt = stmt.bind(&vec![club_id.into()])?;
    let results = stmt.all().await?;
    let assignments = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": assignments
    }))
}

async fn create_assignment(mut req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
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
    let member_check = member_check.bind(&vec![user_id.clone().into(), club_id.clone().into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can create assignments", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let title = body["title"].as_str().unwrap_or("");
    let description = body["description"].as_str().unwrap_or("");
    let lesson_id = body["lesson_id"].as_str();
    let due_date = body["due_date"].as_str();
    let max_points = body["max_points"].as_u64().unwrap_or(100);
    
    if title.is_empty() || description.is_empty() {
        return Response::error("Title and description are required", 400);
    }
    
    // Create assignment
    let assignment_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO assignments (id, club_id, lesson_id, title, description, due_date, max_points, created_by, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    ");
    
    let stmt = stmt.bind(&vec![
        assignment_id.clone().into(),
        club_id.into(),
        lesson_id.unwrap_or("").into(),
        title.into(),
        description.into(),
        due_date.unwrap_or("").into(),
        (max_points as f64).into(),
        user_id.into(),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": assignment_id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "max_points": max_points,
            "created_at": now,
            "updated_at": now
        }
    }))
}

async fn get_assignment(ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT a.*, u.name as creator_name
        FROM assignments a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.id = ?1
    ");
    let stmt = stmt.bind(&vec![assignment_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await? {
        Some(assignment) => {
            Response::from_json(&json!({
                "success": true,
                "data": assignment
            }))
        }
        None => Response::error("Assignment not found", 404)
    }
}

async fn update_assignment(mut req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
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
    
    // Verify user owns the assignment
    let ownership_check = db.prepare("
        SELECT a.id FROM assignments a
        JOIN members m ON m.club_id = a.club_id
        WHERE a.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let ownership_check = ownership_check.bind(&vec![assignment_id.clone().into(), user_id.into()])?;
    
    if ownership_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Parse request body and update
    let body: serde_json::Value = req.json().await?;
    let now = Utc::now().to_rfc3339();
    
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<JsValue> = vec![now.into()];
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
    
    if let Some(due_date) = body["due_date"].as_str() {
        updates.push(format!("due_date = ?{}", param_index));
        params.push(due_date.into());
        param_index += 1;
    }
    
    if let Some(max_points) = body["max_points"].as_u64() {
        updates.push(format!("max_points = ?{}", param_index));
        params.push((max_points as f64).into());
        param_index += 1;
    }
    
    params.push(assignment_id.into());
    
    let stmt = db.prepare(&format!(
        "UPDATE assignments SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Assignment updated successfully"
    }))
}

async fn delete_assignment(req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
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
    
    // Verify user owns the assignment
    let ownership_check = db.prepare("
        SELECT a.id FROM assignments a
        JOIN members m ON m.club_id = a.club_id
        WHERE a.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let ownership_check = ownership_check.bind(&vec![assignment_id.clone().into(), user_id.into()])?;
    
    if ownership_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Permission denied", 403);
    }
    
    // Delete assignment (cascades to submissions)
    let stmt = db.prepare("DELETE FROM assignments WHERE id = ?1");
    let stmt = stmt.bind(&vec![assignment_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Assignment deleted successfully"
    }))
}

async fn get_assignment_submissions(req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Verify user is club admin
    let admin_check = db.prepare("
        SELECT m.role FROM assignments a
        JOIN members m ON m.club_id = a.club_id
        WHERE a.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let admin_check = admin_check.bind(&vec![assignment_id.clone().into(), user_id.into()])?;
    
    if admin_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only admins can view all submissions", 403);
    }
    
    // Get all submissions for the assignment
    let stmt = db.prepare("
        SELECT s.*, u.name as student_name
        FROM submissions s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.assignment_id = ?1
        ORDER BY s.submitted_at DESC
    ");
    let stmt = stmt.bind(&vec![assignment_id.into()])?;
    let results = stmt.all().await?;
    let submissions = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": submissions
    }))
}

async fn get_user_submission(req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT * FROM submissions
        WHERE assignment_id = ?1 AND user_id = ?2
    ");
    let stmt = stmt.bind(&vec![assignment_id.into(), user_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await? {
        Some(submission) => {
            Response::from_json(&json!({
                "success": true,
                "data": submission
            }))
        }
        None => {
            Response::from_json(&json!({
                "success": true,
                "data": null
            }))
        }
    }
}

async fn submit_assignment(mut req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
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
    
    // Check if submission already exists
    let check_stmt = db.prepare("SELECT id FROM submissions WHERE assignment_id = ?1 AND user_id = ?2");
    let check_stmt = check_stmt.bind(&vec![assignment_id.clone().into(), user_id.clone().into()])?;
    
    let body: serde_json::Value = req.json().await?;
    let content = body["content"].as_str();
    let file_url = body["file_url"].as_str();
    let now = Utc::now().to_rfc3339();
    
    if let Some(existing) = check_stmt.first::<serde_json::Value>(None).await? {
        // Update existing submission
        let submission_id = existing["id"].as_str().unwrap_or("");
        
        let update_stmt = db.prepare("
            UPDATE submissions 
            SET content = ?1, file_url = ?2, status = 'submitted', submitted_at = ?3, updated_at = ?4
            WHERE id = ?5
        ");
        let update_stmt = update_stmt.bind(&vec![
            content.unwrap_or("").into(),
            file_url.unwrap_or("").into(),
            now.clone().into(),
            now.clone().into(),
            submission_id.into(),
        ])?;
        update_stmt.run().await?;
        
        Response::from_json(&json!({
            "success": true,
            "data": {
                "id": submission_id,
                "status": "submitted",
                "submitted_at": now
            }
        }))
    } else {
        // Create new submission
        let submission_id = Uuid::new_v4().to_string();
        
        let insert_stmt = db.prepare("
            INSERT INTO submissions (id, assignment_id, user_id, content, file_url, status, submitted_at, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, 'submitted', ?6, ?7, ?8)
        ");
        let insert_stmt = insert_stmt.bind(&vec![
            submission_id.clone().into(),
            assignment_id.into(),
            user_id.into(),
            content.unwrap_or("").into(),
            file_url.unwrap_or("").into(),
            now.clone().into(),
            now.clone().into(),
            now.clone().into(),
        ])?;
        insert_stmt.run().await?;
        
        Response::from_json(&json!({
            "success": true,
            "data": {
                "id": submission_id,
                "status": "submitted",
                "submitted_at": now
            }
        }))
    }
}

async fn get_submission(ctx: RouteContext<()>, submission_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT s.*, u.name as student_name
        FROM submissions s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?1
    ");
    let stmt = stmt.bind(&vec![submission_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await? {
        Some(submission) => {
            Response::from_json(&json!({
                "success": true,
                "data": submission
            }))
        }
        None => Response::error("Submission not found", 404)
    }
}

async fn update_submission(mut req: Request, ctx: RouteContext<()>, submission_id: String) -> Result<Response> {
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
    
    // Verify user owns the submission
    let ownership_check = db.prepare("SELECT id FROM submissions WHERE id = ?1 AND user_id = ?2 AND status = 'draft'");
    let ownership_check = ownership_check.bind(&vec![submission_id.clone().into(), user_id.into()])?;
    
    if ownership_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Can only update own draft submissions", 403);
    }
    
    let body: serde_json::Value = req.json().await?;
    let content = body["content"].as_str();
    let file_url = body["file_url"].as_str();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        UPDATE submissions 
        SET content = ?1, file_url = ?2, updated_at = ?3
        WHERE id = ?4
    ");
    let stmt = stmt.bind(&vec![
        content.unwrap_or("").into(),
        file_url.unwrap_or("").into(),
        now.into(),
        submission_id.into(),
    ])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Submission updated successfully"
    }))
}

async fn grade_submission(mut req: Request, ctx: RouteContext<()>, submission_id: String) -> Result<Response> {
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
    
    // Verify user is admin for this assignment
    let admin_check = db.prepare("
        SELECT m.role FROM submissions s
        JOIN assignments a ON a.id = s.assignment_id
        JOIN members m ON m.club_id = a.club_id
        WHERE s.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let admin_check = admin_check.bind(&vec![submission_id.clone().into(), user_id.clone().into()])?;
    
    if admin_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only admins can grade submissions", 403);
    }
    
    let body: serde_json::Value = req.json().await?;
    let points_earned = body["points_earned"].as_u64().unwrap_or(0);
    let feedback = body["feedback"].as_str();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        UPDATE submissions 
        SET points_earned = ?1, feedback = ?2, status = 'graded', graded_at = ?3, graded_by = ?4, updated_at = ?5
        WHERE id = ?6
    ");
    let stmt = stmt.bind(&vec![
        (points_earned as f64).into(),
        feedback.unwrap_or("").into(),
        now.clone().into(),
        user_id.into(),
        now.into(),
        submission_id.into(),
    ])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Submission graded successfully"
    }))
}