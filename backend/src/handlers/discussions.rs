use worker::*;
use serde::{Deserialize, Serialize};
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct CreateDiscussionRequest {
    title: String,
    content: String,
    tags: Vec<String>,
    parent_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct UpdateDiscussionRequest {
    title: Option<String>,
    content: Option<String>,
    tags: Option<Vec<String>>,
    is_pinned: Option<bool>,
    is_locked: Option<bool>,
}

pub async fn handle_discussions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Parse club ID from path
    if path.contains("/api/clubs/") && path.contains("/discussions") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                match method {
                    Method::Get => return get_club_discussions(req, ctx, club_id.to_string()).await,
                    Method::Post => return create_discussion(req, ctx, club_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Handle individual discussion operations
    if path.contains("/api/discussions/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(disc_id_pos) = segments.iter().position(|&x| x == "discussions") {
            if let Some(disc_id) = segments.get(disc_id_pos + 1) {
                // Handle replies
                if path.ends_with("/replies") {
                    match method {
                        Method::Get => return get_discussion_replies(ctx, disc_id.to_string()).await,
                        Method::Post => return create_reply(req, ctx, disc_id.to_string()).await,
                        _ => return Response::error("Method not allowed", 405)
                    }
                }
                // Handle votes
                if path.ends_with("/vote") {
                    return vote_discussion(req, ctx, disc_id.to_string()).await;
                }
                // Handle mark as answer
                if path.ends_with("/answer") {
                    return mark_as_answer(req, ctx, disc_id.to_string()).await;
                }
                
                match method {
                    Method::Get => return get_discussion(ctx, disc_id.to_string()).await,
                    Method::Put => return update_discussion(req, ctx, disc_id.to_string()).await,
                    Method::Delete => return delete_discussion(req, ctx, disc_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Search discussions
    if path == "/api/discussions/search" {
        return search_discussions(req, ctx).await;
    }
    
    Response::error("Invalid discussion endpoint", 400)
}

async fn get_club_discussions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    // Parse query parameters
    let url = req.url()?;
    let params = url.query_pairs();
    let tag = params.filter(|(k, _)| k == "tag").map(|(_, v)| v.to_string()).next();
    let sort = params.filter(|(k, _)| k == "sort").map(|(_, v)| v.to_string()).next().unwrap_or("recent".to_string());
    
    // Build query based on filters
    let mut query = "
        SELECT d.*, u.name as author_name,
            (SELECT COUNT(*) FROM discussions WHERE parent_id = d.id) as reply_count,
            (SELECT SUM(CASE WHEN is_upvote = 1 THEN 1 ELSE -1 END) FROM discussion_votes WHERE discussion_id = d.id) as score
        FROM discussions d
        JOIN users u ON d.author_id = u.id
        WHERE d.club_id = ?1 AND d.parent_id IS NULL
    ".to_string();
    
    let mut bind_params: Vec<JsValue> = vec![ctx.param("club_id").unwrap_or("").into()];
    
    if let Some(tag_filter) = tag {
        query.push_str(" AND EXISTS (SELECT 1 FROM json_each(d.tags) WHERE value = ?2)");
        bind_params.push(tag_filter.into());
    }
    
    // Add sorting
    match sort.as_str() {
        "popular" => query.push_str(" ORDER BY score DESC, d.created_at DESC"),
        "unanswered" => query.push_str(" AND d.has_accepted_answer = 0 ORDER BY d.created_at DESC"),
        _ => query.push_str(" ORDER BY d.is_pinned DESC, d.created_at DESC"),
    }
    
    query.push_str(" LIMIT 50");
    
    let stmt = db.prepare(&query);
    let stmt = stmt.bind(&bind_params)?;
    
    let results = stmt.all().await?;
    let discussions = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": discussions
    }))
}

async fn create_discussion(mut req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
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
    
    // Verify user is club member
    let member_check = db.prepare("
        SELECT id FROM members 
        WHERE user_id = ?1 AND club_id = ?2
    ");
    let member_check = member_check.bind(&vec![user_id.clone().into(), club_id.clone().into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Must be a club member to create discussions", 403);
    }
    
    // Parse request body
    let body: CreateDiscussionRequest = req.json().await?;
    
    if body.title.is_empty() || body.content.is_empty() {
        return Response::error("Title and content are required", 400);
    }
    
    // Create discussion
    let discussion_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO discussions (
            id, club_id, author_id, title, content, tags, 
            parent_id, created_at, updated_at, is_pinned, 
            is_locked, has_accepted_answer
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0, 0, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        discussion_id.clone().into(),
        club_id.into(),
        user_id.into(),
        body.title.into(),
        body.content.into(),
        serde_json::to_string(&body.tags).unwrap().into(),
        body.parent_id.clone().map(|id| id.into()).unwrap_or(JsValue::NULL),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    // If this is a reply, notify the parent author
    if let Some(parent_id) = body.parent_id {
        let parent_stmt = db.prepare("
            SELECT author_id, title FROM discussions 
            WHERE id = ?1
        ");
        let parent_stmt = parent_stmt.bind(&vec![parent_id.clone().into()])?;
        
        if let Ok(Some(parent)) = parent_stmt.first::<serde_json::Value>(None).await {
            let parent_author = parent["author_id"].as_str().unwrap_or("");
            let parent_title = parent["title"].as_str().unwrap_or("");
            
            if parent_author != user_id {
                let notification_id = Uuid::new_v4().to_string();
                let notif_stmt = db.prepare("
                    INSERT INTO notifications (id, user_id, type, title, content, data, created_at, is_read)
                    VALUES (?1, ?2, 'discussion_reply', 'New Reply', ?3, ?4, ?5, 0)
                ");
                
                let notif_stmt = notif_stmt.bind(&vec![
                    notification_id.into(),
                    parent_author.into(),
                    format!("Someone replied to your discussion: {}", parent_title).into(),
                    json!({"discussion_id": parent_id}).to_string().into(),
                    now.clone().into(),
                ])?;
                
                notif_stmt.run().await?;
            }
        }
    }
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": discussion_id,
            "created_at": now
        }
    }))
}

async fn get_discussion(ctx: RouteContext<()>, discussion_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT d.*, u.name as author_name,
            (SELECT COUNT(*) FROM discussions WHERE parent_id = d.id) as reply_count,
            (SELECT SUM(CASE WHEN is_upvote = 1 THEN 1 ELSE -1 END) FROM discussion_votes WHERE discussion_id = d.id) as score
        FROM discussions d
        JOIN users u ON d.author_id = u.id
        WHERE d.id = ?1
    ");
    let stmt = stmt.bind(&vec![discussion_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(discussion)) => {
            Response::from_json(&json!({
                "success": true,
                "data": discussion
            }))
        }
        Ok(None) => Response::error("Discussion not found", 404),
        Err(_) => Response::error("Failed to fetch discussion", 500)
    }
}

async fn get_discussion_replies(ctx: RouteContext<()>, parent_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT d.*, u.name as author_name,
            (SELECT SUM(CASE WHEN is_upvote = 1 THEN 1 ELSE -1 END) FROM discussion_votes WHERE discussion_id = d.id) as score
        FROM discussions d
        JOIN users u ON d.author_id = u.id
        WHERE d.parent_id = ?1
        ORDER BY d.has_accepted_answer DESC, score DESC, d.created_at ASC
    ");
    let stmt = stmt.bind(&vec![parent_id.into()])?;
    
    let results = stmt.all().await?;
    let replies = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": replies
    }))
}

async fn create_reply(mut req: Request, ctx: RouteContext<()>, parent_id: String) -> Result<Response> {
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
    
    // Get parent discussion info
    let parent_stmt = db.prepare("
        SELECT club_id, author_id, title, is_locked 
        FROM discussions 
        WHERE id = ?1
    ");
    let parent_stmt = parent_stmt.bind(&vec![parent_id.clone().into()])?;
    
    let parent = match parent_stmt.first::<serde_json::Value>(None).await? {
        Some(p) => p,
        None => return Response::error("Parent discussion not found", 404),
    };
    
    if parent["is_locked"].as_i64().unwrap_or(0) == 1 {
        return Response::error("Discussion is locked", 403);
    }
    
    let club_id = parent["club_id"].as_str().unwrap_or("");
    
    // Verify user is club member
    let member_check = db.prepare("
        SELECT id FROM members 
        WHERE user_id = ?1 AND club_id = ?2
    ");
    let member_check = member_check.bind(&vec![user_id.clone().into(), club_id.into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Must be a club member to reply", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let content = body["content"].as_str().unwrap_or("");
    
    if content.is_empty() {
        return Response::error("Content is required", 400);
    }
    
    // Create reply
    let reply_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO discussions (
            id, club_id, author_id, title, content, tags, 
            parent_id, created_at, updated_at, is_pinned, 
            is_locked, has_accepted_answer
        )
        VALUES (?1, ?2, ?3, '', ?4, '[]', ?5, ?6, ?7, 0, 0, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        reply_id.clone().into(),
        club_id.into(),
        user_id.clone().into(),
        content.into(),
        parent_id.clone().into(),
        now.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    // Notify parent author
    let parent_author = parent["author_id"].as_str().unwrap_or("");
    if parent_author != user_id {
        let notification_id = Uuid::new_v4().to_string();
        let notif_stmt = db.prepare("
            INSERT INTO notifications (id, user_id, type, title, content, data, created_at, is_read)
            VALUES (?1, ?2, 'discussion_reply', 'New Reply', ?3, ?4, ?5, 0)
        ");
        
        let notif_stmt = notif_stmt.bind(&vec![
            notification_id.into(),
            parent_author.into(),
            format!("New reply to: {}", parent["title"].as_str().unwrap_or("")).into(),
            json!({"discussion_id": parent_id}).to_string().into(),
            now.clone().into(),
        ])?;
        
        notif_stmt.run().await?;
    }
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": reply_id,
            "created_at": now
        }
    }))
}

async fn update_discussion(mut req: Request, ctx: RouteContext<()>, discussion_id: String) -> Result<Response> {
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
    
    // Get discussion info
    let check_stmt = db.prepare("
        SELECT d.author_id, d.club_id, m.role 
        FROM discussions d
        JOIN members m ON m.user_id = ?1 AND m.club_id = d.club_id
        WHERE d.id = ?2
    ");
    let check_stmt = check_stmt.bind(&vec![user_id.clone().into(), discussion_id.clone().into()])?;
    
    let discussion_info = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(info) => info,
        None => return Response::error("Discussion not found or unauthorized", 404),
    };
    
    let is_author = discussion_info["author_id"].as_str().unwrap_or("") == user_id;
    let is_admin = discussion_info["role"].as_str().unwrap_or("") == "admin";
    
    // Parse request body
    let body: UpdateDiscussionRequest = req.json().await?;
    
    // Build update query
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<JsValue> = vec![Utc::now().to_rfc3339().into()];
    let mut param_index = 2;
    
    // Author can update title, content, tags
    if is_author {
        if let Some(title) = body.title {
            updates.push(format!("title = ?{}", param_index));
            params.push(title.into());
            param_index += 1;
        }
        
        if let Some(content) = body.content {
            updates.push(format!("content = ?{}", param_index));
            params.push(content.into());
            param_index += 1;
        }
        
        if let Some(tags) = body.tags {
            updates.push(format!("tags = ?{}", param_index));
            params.push(serde_json::to_string(&tags).unwrap().into());
            param_index += 1;
        }
    }
    
    // Admin can pin/lock discussions
    if is_admin {
        if let Some(is_pinned) = body.is_pinned {
            updates.push(format!("is_pinned = ?{}", param_index));
            params.push((is_pinned as i32).into());
            param_index += 1;
        }
        
        if let Some(is_locked) = body.is_locked {
            updates.push(format!("is_locked = ?{}", param_index));
            params.push((is_locked as i32).into());
            param_index += 1;
        }
    }
    
    if updates.len() == 1 {
        return Response::error("No authorized updates provided", 400);
    }
    
    params.push(discussion_id.into());
    
    let stmt = db.prepare(&format!(
        "UPDATE discussions SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Discussion updated successfully"
    }))
}

async fn delete_discussion(req: Request, ctx: RouteContext<()>, discussion_id: String) -> Result<Response> {
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
    
    // Verify user owns the discussion or is admin
    let check_stmt = db.prepare("
        SELECT d.author_id, m.role 
        FROM discussions d
        JOIN members m ON m.user_id = ?1 AND m.club_id = d.club_id
        WHERE d.id = ?2
    ");
    let check_stmt = check_stmt.bind(&vec![user_id.into(), discussion_id.clone().into()])?;
    
    let discussion_info = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(info) => info,
        None => return Response::error("Discussion not found or unauthorized", 404),
    };
    
    let is_author = discussion_info["author_id"].as_str().unwrap_or("") == user_id;
    let is_admin = discussion_info["role"].as_str().unwrap_or("") == "admin";
    
    if !is_author && !is_admin {
        return Response::error("Only author or admin can delete discussions", 403);
    }
    
    // Delete discussion and all replies
    let stmt = db.prepare("DELETE FROM discussions WHERE id = ?1 OR parent_id = ?1");
    let stmt = stmt.bind(&vec![discussion_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Discussion deleted successfully"
    }))
}

async fn vote_discussion(mut req: Request, ctx: RouteContext<()>, discussion_id: String) -> Result<Response> {
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
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    let is_upvote = body["is_upvote"].as_bool().unwrap_or(true);
    
    // Check if user already voted
    let existing_vote = db.prepare("
        SELECT id, is_upvote FROM discussion_votes 
        WHERE discussion_id = ?1 AND user_id = ?2
    ");
    let existing_vote = existing_vote.bind(&vec![discussion_id.clone().into(), user_id.clone().into()])?;
    
    if let Ok(Some(vote)) = existing_vote.first::<serde_json::Value>(None).await {
        // Update existing vote
        let stmt = db.prepare("
            UPDATE discussion_votes 
            SET is_upvote = ?1 
            WHERE id = ?2
        ");
        let stmt = stmt.bind(&vec![(is_upvote as i32).into(), vote["id"].as_str().unwrap_or("").into()])?;
        stmt.run().await?;
    } else {
        // Create new vote
        let vote_id = Uuid::new_v4().to_string();
        let stmt = db.prepare("
            INSERT INTO discussion_votes (id, discussion_id, user_id, is_upvote, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5)
        ");
        let stmt = stmt.bind(&vec![
            vote_id.into(),
            discussion_id.into(),
            user_id.into(),
            (is_upvote as i32).into(),
            Utc::now().to_rfc3339().into(),
        ])?;
        stmt.run().await?;
    }
    
    Response::from_json(&json!({
        "success": true,
        "message": "Vote recorded successfully"
    }))
}

async fn mark_as_answer(req: Request, ctx: RouteContext<()>, reply_id: String) -> Result<Response> {
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
    
    // Get reply and parent discussion info
    let check_stmt = db.prepare("
        SELECT r.parent_id, p.author_id 
        FROM discussions r
        JOIN discussions p ON r.parent_id = p.id
        WHERE r.id = ?1
    ");
    let check_stmt = check_stmt.bind(&vec![reply_id.clone().into()])?;
    
    let discussion_info = match check_stmt.first::<serde_json::Value>(None).await? {
        Some(info) => info,
        None => return Response::error("Reply not found", 404),
    };
    
    // Only parent author can mark as answer
    if discussion_info["author_id"].as_str().unwrap_or("") != user_id {
        return Response::error("Only question author can mark answers", 403);
    }
    
    let parent_id = discussion_info["parent_id"].as_str().unwrap_or("");
    
    // Clear any existing accepted answer for this parent
    let clear_stmt = db.prepare("
        UPDATE discussions 
        SET has_accepted_answer = 0 
        WHERE parent_id = ?1
    ");
    let clear_stmt = clear_stmt.bind(&vec![parent_id.into()])?;
    clear_stmt.run().await?;
    
    // Mark this reply as accepted answer
    let stmt = db.prepare("
        UPDATE discussions 
        SET has_accepted_answer = 1 
        WHERE id = ?1
    ");
    let stmt = stmt.bind(&vec![reply_id.into()])?;
    stmt.run().await?;
    
    // Update parent discussion to indicate it has an accepted answer
    let parent_stmt = db.prepare("
        UPDATE discussions 
        SET has_accepted_answer = 1 
        WHERE id = ?1
    ");
    let parent_stmt = parent_stmt.bind(&vec![parent_id.into()])?;
    parent_stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Reply marked as answer"
    }))
}

async fn search_discussions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    // Parse query parameters
    let url = req.url()?;
    let params = url.query_pairs();
    let query = params.filter(|(k, _)| k == "q").map(|(_, v)| v.to_string()).next().unwrap_or_default();
    let club_id = params.filter(|(k, _)| k == "club_id").map(|(_, v)| v.to_string()).next();
    
    if query.is_empty() {
        return Response::error("Search query is required", 400);
    }
    
    let mut sql = "
        SELECT d.*, u.name as author_name,
            (SELECT COUNT(*) FROM discussions WHERE parent_id = d.id) as reply_count,
            (SELECT SUM(CASE WHEN is_upvote = 1 THEN 1 ELSE -1 END) FROM discussion_votes WHERE discussion_id = d.id) as score
        FROM discussions d
        JOIN users u ON d.author_id = u.id
        WHERE (d.title LIKE ?1 OR d.content LIKE ?1)
        AND d.parent_id IS NULL
    ".to_string();
    
    let search_pattern = format!("%{}%", query);
    let mut bind_params: Vec<JsValue> = vec![search_pattern.into()];
    
    if let Some(cid) = club_id {
        sql.push_str(" AND d.club_id = ?2");
        bind_params.push(cid.into());
    }
    
    sql.push_str(" ORDER BY score DESC, d.created_at DESC LIMIT 20");
    
    let stmt = db.prepare(&sql);
    let stmt = stmt.bind(&bind_params)?;
    
    let results = stmt.all().await?;
    let discussions = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": discussions
    }))
}