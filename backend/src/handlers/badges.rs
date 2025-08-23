use worker::*;
use serde::{Deserialize, Serialize};
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use chrono::Utc;
use uuid::Uuid;
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct CreateBadgeRequest {
    name: String,
    description: String,
    icon: String,
    criteria: serde_json::Value,
    points: i32,
}

#[derive(Serialize, Deserialize)]
struct CreateCertificateRequest {
    name: String,
    description: String,
    template: String,
    requirements: serde_json::Value,
}

pub async fn handle_badges(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Parse club ID from path
    if path.contains("/api/clubs/") && path.contains("/badges") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                match method {
                    Method::Get => return get_club_badges(req, ctx, club_id.to_string()).await,
                    Method::Post => return create_badge(req, ctx, club_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Handle individual badge operations
    if path.contains("/api/badges/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(badge_id_pos) = segments.iter().position(|&x| x == "badges") {
            if let Some(badge_id) = segments.get(badge_id_pos + 1) {
                if path.ends_with("/award") {
                    return award_badge(req, ctx, badge_id.to_string()).await;
                }
                match method {
                    Method::Get => return get_badge(ctx, badge_id.to_string()).await,
                    Method::Put => return update_badge(req, ctx, badge_id.to_string()).await,
                    Method::Delete => return delete_badge(req, ctx, badge_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Get user badges
    if path == "/api/badges/user" {
        return get_user_badges(req, ctx).await;
    }
    
    Response::error("Invalid badge endpoint", 400)
}

pub async fn handle_certificates(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Parse club ID from path
    if path.contains("/api/clubs/") && path.contains("/certificates") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                match method {
                    Method::Get => return get_club_certificates(req, ctx, club_id.to_string()).await,
                    Method::Post => return create_certificate(req, ctx, club_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Handle individual certificate operations
    if path.contains("/api/certificates/") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(cert_id_pos) = segments.iter().position(|&x| x == "certificates") {
            if let Some(cert_id) = segments.get(cert_id_pos + 1) {
                if path.ends_with("/issue") {
                    return issue_certificate(req, ctx, cert_id.to_string()).await;
                }
                if path.ends_with("/verify") {
                    return verify_certificate(ctx, cert_id.to_string()).await;
                }
                match method {
                    Method::Get => return get_certificate(ctx, cert_id.to_string()).await,
                    Method::Put => return update_certificate(req, ctx, cert_id.to_string()).await,
                    Method::Delete => return delete_certificate(req, ctx, cert_id.to_string()).await,
                    _ => return Response::error("Method not allowed", 405)
                }
            }
        }
    }
    
    // Get user certificates
    if path == "/api/certificates/user" {
        return get_user_certificates(req, ctx).await;
    }
    
    Response::error("Invalid certificate endpoint", 400)
}

async fn get_club_badges(_req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT * FROM badges 
        WHERE club_id = ?1 
        ORDER BY points DESC, created_at DESC
    ");
    let stmt = stmt.bind(&vec![club_id.into()])?;
    
    let results = stmt.all().await?;
    let badges = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": badges
    }))
}

async fn create_badge(mut req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
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
    let member_check = member_check.bind(&vec![user_id.into(), club_id.clone().into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can create badges", 403);
    }
    
    // Parse request body
    let body: CreateBadgeRequest = req.json().await?;
    
    // Create badge
    let badge_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO badges (id, club_id, name, description, icon, criteria, points, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    ");
    
    let stmt = stmt.bind(&vec![
        badge_id.clone().into(),
        club_id.into(),
        body.name.into(),
        body.description.into(),
        body.icon.into(),
        serde_json::to_string(&body.criteria).unwrap().into(),
        body.points.into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": badge_id,
            "created_at": now
        }
    }))
}

async fn get_badge(ctx: RouteContext<()>, badge_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("SELECT * FROM badges WHERE id = ?1");
    let stmt = stmt.bind(&vec![badge_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(badge)) => {
            Response::from_json(&json!({
                "success": true,
                "data": badge
            }))
        }
        Ok(None) => Response::error("Badge not found", 404),
        Err(_) => Response::error("Failed to fetch badge", 500)
    }
}

async fn update_badge(mut req: Request, ctx: RouteContext<()>, badge_id: String) -> Result<Response> {
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
    let badge_check = db.prepare("
        SELECT b.club_id FROM badges b
        JOIN members m ON m.club_id = b.club_id
        WHERE b.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let badge_check = badge_check.bind(&vec![badge_id.clone().into(), user_id.into()])?;
    
    if badge_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can update badges", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    
    // Build update query
    let mut updates = vec![];
    let mut params: Vec<JsValue> = vec![];
    let mut param_index = 1;
    
    if let Some(name) = body["name"].as_str() {
        updates.push(format!("name = ?{}", param_index));
        params.push(name.into());
        param_index += 1;
    }
    
    if let Some(description) = body["description"].as_str() {
        updates.push(format!("description = ?{}", param_index));
        params.push(description.into());
        param_index += 1;
    }
    
    if let Some(icon) = body["icon"].as_str() {
        updates.push(format!("icon = ?{}", param_index));
        params.push(icon.into());
        param_index += 1;
    }
    
    if let Some(criteria) = body.get("criteria") {
        updates.push(format!("criteria = ?{}", param_index));
        params.push(serde_json::to_string(criteria).unwrap().into());
        param_index += 1;
    }
    
    if let Some(points) = body["points"].as_i64() {
        updates.push(format!("points = ?{}", param_index));
        params.push((points as i32).into());
        param_index += 1;
    }
    
    if updates.is_empty() {
        return Response::error("No updates provided", 400);
    }
    
    params.push(badge_id.into());
    
    let stmt = db.prepare(&format!(
        "UPDATE badges SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Badge updated successfully"
    }))
}

async fn delete_badge(req: Request, ctx: RouteContext<()>, badge_id: String) -> Result<Response> {
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
    let badge_check = db.prepare("
        SELECT b.club_id FROM badges b
        JOIN members m ON m.club_id = b.club_id
        WHERE b.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let badge_check = badge_check.bind(&vec![badge_id.clone().into(), user_id.into()])?;
    
    if badge_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can delete badges", 403);
    }
    
    // Delete badge
    let stmt = db.prepare("DELETE FROM badges WHERE id = ?1");
    let stmt = stmt.bind(&vec![badge_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Badge deleted successfully"
    }))
}

async fn award_badge(mut req: Request, ctx: RouteContext<()>, badge_id: String) -> Result<Response> {
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
    let recipient_id = body["user_id"].as_str().unwrap_or("");
    
    if recipient_id.is_empty() {
        return Response::error("User ID is required", 400);
    }
    
    // Verify user is club admin
    let badge_check = db.prepare("
        SELECT b.club_id, b.name FROM badges b
        JOIN members m ON m.club_id = b.club_id
        WHERE b.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let badge_check = badge_check.bind(&vec![badge_id.clone().into(), user_id.into()])?;
    
    let badge_info = match badge_check.first::<serde_json::Value>(None).await? {
        Some(info) => info,
        None => return Response::error("Only club admins can award badges", 403),
    };
    
    // Check if user already has this badge
    let existing_check = db.prepare("
        SELECT id FROM user_badges 
        WHERE user_id = ?1 AND badge_id = ?2
    ");
    let existing_check = existing_check.bind(&vec![recipient_id.into(), badge_id.clone().into()])?;
    
    if existing_check.first::<serde_json::Value>(None).await?.is_some() {
        return Response::error("User already has this badge", 400);
    }
    
    // Award badge
    let award_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO user_badges (id, user_id, badge_id, earned_at)
        VALUES (?1, ?2, ?3, ?4)
    ");
    
    let stmt = stmt.bind(&vec![
        award_id.clone().into(),
        recipient_id.into(),
        badge_id.clone().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    // Create notification
    let notification_id = Uuid::new_v4().to_string();
    let stmt = db.prepare("
        INSERT INTO notifications (id, user_id, type, title, content, data, created_at, is_read)
        VALUES (?1, ?2, 'badge', 'Badge Earned!', ?3, ?4, ?5, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        notification_id.into(),
        recipient_id.into(),
        format!("You earned the {} badge!", badge_info["name"].as_str().unwrap_or("")).into(),
        json!({"badge_id": badge_id}).to_string().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": award_id,
            "earned_at": now
        }
    }))
}

async fn get_user_badges(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT b.*, ub.earned_at 
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ?1
        ORDER BY ub.earned_at DESC
    ");
    let stmt = stmt.bind(&vec![user_id.into()])?;
    
    let results = stmt.all().await?;
    let badges = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": badges
    }))
}

async fn get_club_certificates(_req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT * FROM certificates 
        WHERE club_id = ?1 
        ORDER BY created_at DESC
    ");
    let stmt = stmt.bind(&vec![club_id.into()])?;
    
    let results = stmt.all().await?;
    let certificates = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": certificates
    }))
}

async fn create_certificate(mut req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
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
    let member_check = member_check.bind(&vec![user_id.into(), club_id.clone().into()])?;
    
    if member_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can create certificates", 403);
    }
    
    // Parse request body
    let body: CreateCertificateRequest = req.json().await?;
    
    // Create certificate
    let cert_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO certificates (id, club_id, name, description, template, requirements, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ");
    
    let stmt = stmt.bind(&vec![
        cert_id.clone().into(),
        club_id.into(),
        body.name.into(),
        body.description.into(),
        body.template.into(),
        serde_json::to_string(&body.requirements).unwrap().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": cert_id,
            "created_at": now
        }
    }))
}

async fn get_certificate(ctx: RouteContext<()>, cert_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("SELECT * FROM certificates WHERE id = ?1");
    let stmt = stmt.bind(&vec![cert_id.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(certificate)) => {
            Response::from_json(&json!({
                "success": true,
                "data": certificate
            }))
        }
        Ok(None) => Response::error("Certificate not found", 404),
        Err(_) => Response::error("Failed to fetch certificate", 500)
    }
}

async fn update_certificate(mut req: Request, ctx: RouteContext<()>, cert_id: String) -> Result<Response> {
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
    let cert_check = db.prepare("
        SELECT c.club_id FROM certificates c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let cert_check = cert_check.bind(&vec![cert_id.clone().into(), user_id.into()])?;
    
    if cert_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can update certificates", 403);
    }
    
    // Parse request body
    let body: serde_json::Value = req.json().await?;
    
    // Build update query
    let mut updates = vec![];
    let mut params: Vec<JsValue> = vec![];
    let mut param_index = 1;
    
    if let Some(name) = body["name"].as_str() {
        updates.push(format!("name = ?{}", param_index));
        params.push(name.into());
        param_index += 1;
    }
    
    if let Some(description) = body["description"].as_str() {
        updates.push(format!("description = ?{}", param_index));
        params.push(description.into());
        param_index += 1;
    }
    
    if let Some(template) = body["template"].as_str() {
        updates.push(format!("template = ?{}", param_index));
        params.push(template.into());
        param_index += 1;
    }
    
    if let Some(requirements) = body.get("requirements") {
        updates.push(format!("requirements = ?{}", param_index));
        params.push(serde_json::to_string(requirements).unwrap().into());
        param_index += 1;
    }
    
    if updates.is_empty() {
        return Response::error("No updates provided", 400);
    }
    
    params.push(cert_id.into());
    
    let stmt = db.prepare(&format!(
        "UPDATE certificates SET {} WHERE id = ?{}",
        updates.join(", "),
        param_index
    ));
    
    let stmt = stmt.bind(&params)?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Certificate updated successfully"
    }))
}

async fn delete_certificate(req: Request, ctx: RouteContext<()>, cert_id: String) -> Result<Response> {
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
    let cert_check = db.prepare("
        SELECT c.club_id FROM certificates c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let cert_check = cert_check.bind(&vec![cert_id.clone().into(), user_id.into()])?;
    
    if cert_check.first::<serde_json::Value>(None).await?.is_none() {
        return Response::error("Only club admins can delete certificates", 403);
    }
    
    // Delete certificate
    let stmt = db.prepare("DELETE FROM certificates WHERE id = ?1");
    let stmt = stmt.bind(&vec![cert_id.into()])?;
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "message": "Certificate deleted successfully"
    }))
}

async fn issue_certificate(mut req: Request, ctx: RouteContext<()>, cert_id: String) -> Result<Response> {
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
    let recipient_id = body["user_id"].as_str().unwrap_or("");
    
    if recipient_id.is_empty() {
        return Response::error("User ID is required", 400);
    }
    
    // Verify user is club admin
    let cert_check = db.prepare("
        SELECT c.club_id, c.name FROM certificates c
        JOIN members m ON m.club_id = c.club_id
        WHERE c.id = ?1 AND m.user_id = ?2 AND m.role = 'admin'
    ");
    let cert_check = cert_check.bind(&vec![cert_id.clone().into(), user_id.clone().into()])?;
    
    let cert_info = match cert_check.first::<serde_json::Value>(None).await? {
        Some(info) => info,
        None => return Response::error("Only club admins can issue certificates", 403),
    };
    
    // Check if user already has this certificate
    let existing_check = db.prepare("
        SELECT id FROM user_certificates 
        WHERE user_id = ?1 AND certificate_id = ?2
    ");
    let existing_check = existing_check.bind(&vec![recipient_id.into(), cert_id.clone().into()])?;
    
    if existing_check.first::<serde_json::Value>(None).await?.is_some() {
        return Response::error("User already has this certificate", 400);
    }
    
    // Issue certificate
    let issue_id = Uuid::new_v4().to_string();
    let verification_code = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO user_certificates (id, user_id, certificate_id, issued_at, issued_by, verification_code)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ");
    
    let stmt = stmt.bind(&vec![
        issue_id.clone().into(),
        recipient_id.into(),
        cert_id.clone().into(),
        now.clone().into(),
        user_id.into(),
        verification_code.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    // Create notification
    let notification_id = Uuid::new_v4().to_string();
    let stmt = db.prepare("
        INSERT INTO notifications (id, user_id, type, title, content, data, created_at, is_read)
        VALUES (?1, ?2, 'certificate', 'Certificate Issued!', ?3, ?4, ?5, 0)
    ");
    
    let stmt = stmt.bind(&vec![
        notification_id.into(),
        recipient_id.into(),
        format!("You received the {} certificate!", cert_info["name"].as_str().unwrap_or("")).into(),
        json!({"certificate_id": cert_id, "verification_code": verification_code}).to_string().into(),
        now.clone().into(),
    ])?;
    
    stmt.run().await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "id": issue_id,
            "verification_code": verification_code,
            "issued_at": now
        }
    }))
}

async fn verify_certificate(ctx: RouteContext<()>, verification_code: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT uc.*, c.name, c.description, u.name as recipient_name, issuer.name as issuer_name
        FROM user_certificates uc
        JOIN certificates c ON uc.certificate_id = c.id
        JOIN users u ON uc.user_id = u.id
        JOIN users issuer ON uc.issued_by = issuer.id
        WHERE uc.verification_code = ?1
    ");
    let stmt = stmt.bind(&vec![verification_code.into()])?;
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(cert_data)) => {
            Response::from_json(&json!({
                "success": true,
                "valid": true,
                "data": cert_data
            }))
        }
        Ok(None) => {
            Response::from_json(&json!({
                "success": true,
                "valid": false,
                "message": "Invalid verification code"
            }))
        }
        Err(_) => Response::error("Failed to verify certificate", 500)
    }
}

async fn get_user_certificates(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    let stmt = db.prepare("
        SELECT c.*, uc.issued_at, uc.verification_code 
        FROM user_certificates uc
        JOIN certificates c ON uc.certificate_id = c.id
        WHERE uc.user_id = ?1
        ORDER BY uc.issued_at DESC
    ");
    let stmt = stmt.bind(&vec![user_id.into()])?;
    
    let results = stmt.all().await?;
    let certificates = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": certificates
    }))
}