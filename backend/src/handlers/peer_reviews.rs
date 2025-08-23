use worker::*;
use serde::{Deserialize, Serialize};
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;
use worker::wasm_bindgen::JsValue;

#[derive(Serialize, Deserialize)]
struct CreatePeerReviewRequest {
    submission_id: String,
    rubric_scores: serde_json::Value,
    feedback: String,
}

#[derive(Serialize, Deserialize)]
struct UpdatePeerReviewRequest {
    rubric_scores: Option<serde_json::Value>,
    feedback: Option<String>,
}

pub async fn handle_peer_reviews(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Parse assignment ID from path for getting available reviews
    if path.contains("/api/assignments/") && path.contains("/peer-reviews/available") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(assignment_id_pos) = segments.iter().position(|&x| x == "assignments") {
            if let Some(assignment_id) = segments.get(assignment_id_pos + 1) {
                return get_available_peer_reviews(req, ctx, assignment_id.to_string()).await;
            }
        }
    }
    
    // Parse assignment ID for getting peer reviews
    if path.contains("/api/assignments/") && path.contains("/peer-reviews") && !path.contains("/available") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(assignment_id_pos) = segments.iter().position(|&x| x == "assignments") {
            if let Some(assignment_id) = segments.get(assignment_id_pos + 1) {
                if method == Method::Get {
                    return get_peer_reviews(req, ctx, assignment_id.to_string()).await;
                } else if method == Method::Post {
                    return create_peer_review(req, ctx).await;
                }
            }
        }
    }
    
    // Handle individual peer review operations
    if path.contains("/api/peer-reviews/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(review_id_pos) = segments.iter().position(|&x| x == "peer-reviews") {
            if let Some(review_id) = segments.get(review_id_pos + 1) {
                match method {
                    Method::Get => return get_peer_review(req, ctx, review_id.to_string()).await,
                    Method::Put => return update_peer_review(req, ctx, review_id.to_string()).await,
                    Method::Delete => return delete_peer_review(req, ctx, review_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    Response::error("Invalid peer review endpoint", 400)
}

async fn get_available_peer_reviews(req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Get submissions that the user hasn't reviewed yet (excluding their own)
    let stmt = db.prepare("
        SELECT s.*, u.name as student_name 
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.assignment_id = ?1 
        AND s.student_id != ?2
        AND s.id NOT IN (
            SELECT submission_id FROM peer_reviews WHERE reviewer_id = ?2
        )
        LIMIT 5
    ");
    
    let stmt = stmt.bind(&vec![
        assignment_id.into(),
        user_id.clone().into(),
    ])?;
    
    let results = stmt.all().await?;
    let submissions = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": submissions
    }))
}

async fn get_peer_reviews(req: Request, ctx: RouteContext<()>, assignment_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Get peer reviews for the user's submission
    let stmt = db.prepare("
        SELECT pr.*, u.name as reviewer_name 
        FROM peer_reviews pr
        JOIN users u ON pr.reviewer_id = u.id
        JOIN submissions s ON pr.submission_id = s.id
        WHERE s.assignment_id = ?1 AND s.student_id = ?2
        ORDER BY pr.created_at DESC
    ");
    
    let stmt = stmt.bind(&vec![
        assignment_id.into(),
        user_id.into(),
    ])?;
    
    let results = stmt.all().await?;
    let reviews = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": reviews
    }))
}

async fn get_peer_review(_req: Request, ctx: RouteContext<()>, review_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT pr.*, u.name as reviewer_name, s.content as submission_content
        FROM peer_reviews pr
        JOIN users u ON pr.reviewer_id = u.id
        JOIN submissions s ON pr.submission_id = s.id
        WHERE pr.id = ?1
    ");
    
    let stmt = stmt.bind(&vec![review_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(review)) => {
            Response::from_json(&json!({
                "success": true,
                "data": review
            }))
        }
        Ok(None) => Response::error("Peer review not found", 404),
        Err(_) => Response::error("Failed to fetch peer review", 500)
    }
}

async fn create_peer_review(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
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
    let body: CreatePeerReviewRequest = req.json().await?;
    
    let db = ctx.env.d1("DB")?;
    
    // Verify the submission exists and user hasn't already reviewed it
    let check_stmt = db.prepare("
        SELECT s.id, s.student_id, s.assignment_id
        FROM submissions s
        WHERE s.id = ?1 
        AND s.student_id != ?2
        AND NOT EXISTS (
            SELECT 1 FROM peer_reviews 
            WHERE submission_id = ?1 AND reviewer_id = ?2
        )
    ");
    
    let check_stmt = check_stmt.bind(&vec![
        body.submission_id.clone().into(),
        user_id.clone().into(),
    ])?;
    
    let submission = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(s) => s,
        None => return Response::error("Submission not found or already reviewed", 400),
    };
    
    // Calculate score from rubric
    let mut total_score = 0.0;
    let mut max_score = 0.0;
    
    if let Some(scores) = body.rubric_scores.as_object() {
        for (_key, value) in scores {
            if let Some(score) = value["score"].as_f64() {
                total_score += score;
            }
            if let Some(max) = value["max"].as_f64() {
                max_score += max;
            }
        }
    }
    
    let calculated_score = if max_score > 0.0 {
        (total_score / max_score * 100.0) as i32
    } else {
        0
    };
    
    // Create peer review
    let review_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO peer_reviews (
            id, submission_id, reviewer_id, rubric_scores, 
            feedback, score, created_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ");
    
    let stmt = stmt.bind(&vec![
        review_id.clone().into(),
        body.submission_id.into(),
        user_id.clone().into(),
        serde_json::to_string(&body.rubric_scores).unwrap().into(),
        body.feedback.into(),
        calculated_score.into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    // Update submission's average peer score
    let assignment_id = submission["assignment_id"].as_str().unwrap_or("");
    update_submission_peer_score(&db, &submission["id"].as_str().unwrap_or("")).await?;
    
    // Create notification for the submission owner
    create_notification(
        &db,
        submission["student_id"].as_str().unwrap_or(""),
        "peer_review",
        "New Peer Review",
        "You received a new peer review on your submission",
        Some(&json!({
            "assignment_id": assignment_id,
            "review_id": review_id
        }))
    ).await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": review_id,
            "score": calculated_score,
            "created_at": now
        }
    }))
}

async fn update_peer_review(mut req: Request, ctx: RouteContext<()>, review_id: String) -> Result<Response> {
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
    
    // Verify user owns the review
    let check_stmt = db.prepare("
        SELECT submission_id FROM peer_reviews 
        WHERE id = ?1 AND reviewer_id = ?2
    ");
    let check_stmt = check_stmt.bind(&vec![review_id.clone().into(), user_id.into()])?;
    
    let submission_id = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(r) => r["submission_id"].as_str().unwrap_or("").to_string(),
        None => return Response::error("Review not found or unauthorized", 404),
    };
    
    // Parse request body
    let body: UpdatePeerReviewRequest = req.json().await?;
    
    // Build update query
    let mut updates = vec![];
    let mut params: Vec<JsValue> = vec![];
    let mut param_index = 1;
    
    if let Some(rubric_scores) = body.rubric_scores {
        // Recalculate score
        let mut total_score = 0.0;
        let mut max_score = 0.0;
        
        if let Some(scores) = rubric_scores.as_object() {
            for (_key, value) in scores {
                if let Some(score) = value["score"].as_f64() {
                    total_score += score;
                }
                if let Some(max) = value["max"].as_f64() {
                    max_score += max;
                }
            }
        }
        
        let calculated_score = if max_score > 0.0 {
            (total_score / max_score * 100.0) as i32
        } else {
            0
        };
        
        updates.push(format!("rubric_scores = ?{}", param_index));
        params.push(serde_json::to_string(&rubric_scores).unwrap().into());
        param_index += 1;
        
        updates.push(format!("score = ?{}", param_index));
        params.push(calculated_score.into());
        param_index += 1;
    }
    
    if let Some(feedback) = body.feedback {
        updates.push(format!("feedback = ?{}", param_index));
        params.push(feedback.into());
        param_index += 1;
    }
    
    if updates.is_empty() {
        return Response::error("No updates provided", 400);
    }
    
    params.push(review_id.clone().into());
    
    let stmt = db.prepare(&format!(
        "UPDATE peer_reviews SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    // Update submission's average peer score
    update_submission_peer_score(&db, &submission_id).await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Peer review updated successfully"
    }))
}

async fn delete_peer_review(req: Request, ctx: RouteContext<()>, review_id: String) -> Result<Response> {
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
    
    // Verify user owns the review
    let check_stmt = db.prepare("
        SELECT submission_id FROM peer_reviews 
        WHERE id = ?1 AND reviewer_id = ?2
    ");
    let check_stmt = check_stmt.bind(&vec![review_id.clone().into(), user_id.into()])?;
    
    let submission_id = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(r) => r["submission_id"].as_str().unwrap_or("").to_string(),
        None => return Response::error("Review not found or unauthorized", 404),
    };
    
    // Delete the review
    let stmt = db.prepare("DELETE FROM peer_reviews WHERE id = ?1");
    let stmt = stmt.bind(&vec![review_id.into()])?;
    stmt.run().await?;
    
    // Update submission's average peer score
    update_submission_peer_score(&db, &submission_id).await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Peer review deleted successfully"
    }))
}

async fn update_submission_peer_score(db: &D1Database, submission_id: &str) -> Result<()> {
    // Calculate average peer score
    let avg_stmt = db.prepare("
        SELECT AVG(score) as avg_score 
        FROM peer_reviews 
        WHERE submission_id = ?1
    ");
    let avg_stmt = avg_stmt.bind(&vec![submission_id.into()])?;
    
    let avg_result = avg_stmt.first::<serde_json::Value>(None).await?;
    let avg_score = avg_result
        .and_then(|r| r["avg_score"].as_f64())
        .unwrap_or(0.0) as i32;
    
    // Update submission
    let update_stmt = db.prepare("
        UPDATE submissions 
        SET peer_score = ?1 
        WHERE id = ?2
    ");
    let update_stmt = update_stmt.bind(&vec![avg_score.into(), submission_id.into()])?;
    update_stmt.run().await?;
    
    Ok(())
}

async fn create_notification(
    db: &D1Database,
    user_id: &str,
    notification_type: &str,
    title: &str,
    content: &str,
    data: Option<&serde_json::Value>
) -> Result<()> {
    let notification_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO notifications (id, user_id, type, title, content, data, created_at, is_read)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        notification_id.into(),
        user_id.into(),
        notification_type.into(),
        title.into(),
        content.into(),
        data.map(|d| serde_json::to_string(d).unwrap()).unwrap_or_else(|| "{}".to_string()).into(),
        now.into(),
    ])?;
    
    stmt.run().await?;
    Ok(())
}