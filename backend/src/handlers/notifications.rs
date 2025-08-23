use worker::*;
use serde_json::json;
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;

pub async fn handle_notifications(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Get user notifications
    if path == "/api/notifications" {
        match method {
            Method::Get => return get_notifications(req, ctx).await,
            _ => return Response::error("Method not allowed", 405)
        }
    }
    
    // Mark notification as read
    if path.contains("/api/notifications/") && path.ends_with("/read") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(notif_id_pos) = segments.iter().position(|&x| x == "notifications") {
            if let Some(notif_id) = segments.get(notif_id_pos + 1) {
                return mark_as_read(req, ctx, notif_id.to_string()).await;
            }
        }
    }
    
    // Mark all notifications as read
    if path == "/api/notifications/read-all" {
        return mark_all_as_read(req, ctx).await;
    }
    
    // Delete notification
    if path.contains("/api/notifications/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(notif_id_pos) = segments.iter().position(|&x| x == "notifications") {
            if let Some(notif_id) = segments.get(notif_id_pos + 1) {
                if method == Method::Delete {
                    return delete_notification(req, ctx, notif_id.to_string()).await;
                }
            }
        }
    }
    
    // Get notification preferences
    if path == "/api/notifications/preferences" {
        match method {
            Method::Get => return get_preferences(req, ctx).await,
            Method::Put => return update_preferences(req, ctx).await,
            _ => return Response::error("Method not allowed", 405)
        }
    }
    
    Response::error("Invalid notification endpoint", 400)
}

async fn get_notifications(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Parse query parameters
    let url = req.url()?;
    let params = url.query_pairs();
    let unread_only = params
        .filter(|(k, _)| k == "unread")
        .map(|(_, v)| v == "true")
        .next()
        .unwrap_or(false);
    
    let mut query = "
        SELECT * FROM notifications 
        WHERE user_id = ?1
    ".to_string();
    
    if unread_only {
        query.push_str(" AND is_read = 0");
    }
    
    query.push_str(" ORDER BY created_at DESC LIMIT 50");
    
    let stmt = db.prepare(&query);
    let stmt = stmt.bind(&vec![user_id.into()])?;
    
    let results = stmt.all().await?;
    let notifications = results.results::<serde_json::Value>()?;
    
    // Get unread count
    let count_stmt = db.prepare("
        SELECT COUNT(*) as unread_count 
        FROM notifications 
        WHERE user_id = ?1 AND is_read = 0
    ");
    let count_stmt = count_stmt.bind(&vec![user_id.into()])?;
    let count_result = count_stmt.first::<serde_json::Value>(None).await?;
    let unread_count = count_result
        .and_then(|r| r["unread_count"].as_i64())
        .unwrap_or(0);
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "notifications": notifications,
            "unread_count": unread_count
        }
    }))
}

async fn mark_as_read(req: Request, ctx: RouteContext<()>, notification_id: String) -> Result<Response> {
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
    
    // Update notification
    let stmt = db.prepare("
        UPDATE notifications 
        SET is_read = 1, read_at = ?1 
        WHERE id = ?2 AND user_id = ?3
    ");
    
    let stmt = stmt.bind(&vec![
        Utc::now().to_rfc3339().into(),
        notification_id.into(),
        user_id.into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Notification marked as read"
    }))
}

async fn mark_all_as_read(req: Request, ctx: RouteContext<()>) -> Result<Response> {
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
    
    // Update all unread notifications
    let stmt = db.prepare("
        UPDATE notifications 
        SET is_read = 1, read_at = ?1 
        WHERE user_id = ?2 AND is_read = 0
    ");
    
    let stmt = stmt.bind(&vec![
        Utc::now().to_rfc3339().into(),
        user_id.into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "All notifications marked as read"
    }))
}

async fn delete_notification(req: Request, ctx: RouteContext<()>, notification_id: String) -> Result<Response> {
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
    
    // Delete notification
    let stmt = db.prepare("
        DELETE FROM notifications 
        WHERE id = ?1 AND user_id = ?2
    ");
    
    let stmt = stmt.bind(&vec![
        notification_id.into(),
        user_id.into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Notification deleted"
    }))
}

async fn get_preferences(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Get user notification preferences
    let stmt = db.prepare("
        SELECT notification_preferences 
        FROM users 
        WHERE id = ?1
    ");
    let stmt = stmt.bind(&vec![user_id.into()])?;
    
    let result = stmt.first::<serde_json::Value>(None).await?;
    
    let preferences = result
        .and_then(|r| r["notification_preferences"].as_str())
        .and_then(|s| serde_json::from_str::<serde_json::Value>(s).ok())
        .unwrap_or_else(|| json!({
            "email": {
                "enabled": true,
                "assignments": true,
                "peer_reviews": true,
                "badges": true,
                "discussions": true,
                "announcements": true
            },
            "in_app": {
                "enabled": true,
                "assignments": true,
                "peer_reviews": true,
                "badges": true,
                "discussions": true,
                "announcements": true
            }
        }));
    
    Response::from_json(&json!({
        "success": true,
        "data": preferences
    }))
}

async fn update_preferences(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
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
    let preferences: serde_json::Value = req.json().await?;
    
    let db = ctx.env.d1("DB")?;
    
    // Update user preferences
    let stmt = db.prepare("
        UPDATE users 
        SET notification_preferences = ?1 
        WHERE id = ?2
    ");
    
    let stmt = stmt.bind(&vec![
        serde_json::to_string(&preferences).unwrap().into(),
        user_id.into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Notification preferences updated"
    }))
}