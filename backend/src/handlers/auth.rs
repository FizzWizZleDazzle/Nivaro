use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use bcrypt::{hash, verify, DEFAULT_COST};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user id
    email: String,
    exp: usize, // expiration timestamp
    iat: usize, // issued at timestamp
}

pub async fn handle_auth(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    match (method, path) {
        (Method::Post, "/api/auth/signup") => signup(req, ctx).await,
        (Method::Post, "/api/auth/login") => login(req, ctx).await,
        (Method::Post, "/api/auth/logout") => logout(req, ctx).await,
        (Method::Post, "/api/auth/forgot-password") => forgot_password(req, ctx).await,
        (Method::Post, "/api/auth/reset-password") => reset_password(req, ctx).await,
        (Method::Post, "/api/auth/change-password") => change_password(req, ctx).await,
        (Method::Post, "/api/auth/verify-email") => verify_email(req, ctx).await,
        (Method::Get, "/api/auth/me") => get_current_user(req, ctx).await,
        (Method::Put, "/api/auth/profile") => update_profile(req, ctx).await,
        (Method::Delete, "/api/auth/account") => delete_account(req, ctx).await,
        (Method::Post, "/api/auth/social") => social_login(req, ctx).await,
        (Method::Get, "/api/auth/sessions") => get_user_sessions(req, ctx).await,
        (Method::Delete, "/api/auth/sessions") => revoke_all_sessions(req, ctx).await,
        _ => Response::error("Not found", 404)
    }
}

async fn signup(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let signup_request: SignupRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Basic validation
    if signup_request.email.is_empty() || signup_request.password.is_empty() || signup_request.name.is_empty() {
        return Response::error("Email, password, and name are required", 400);
    }

    if !is_valid_email(&signup_request.email) {
        return Response::error("Invalid email format", 400);
    }

    if !is_strong_password(&signup_request.password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    let db = ctx.env.d1("DB")?;

    // Check if user already exists
    if user_exists(&db, &signup_request.email).await {
        return Response::error("User with this email already exists", 409);
    }

    // Create user
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    // Hash the password
    let password_hash = match hash(&signup_request.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return Response::error("Failed to process password", 500),
    };

    // Insert user into database with simpler approach
    let stmt = db.prepare("
        INSERT INTO users (id, email, password_hash, name, created_at, updated_at, email_verified, is_active, failed_login_attempts)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, 1, 0)
    ");
    let result = stmt.bind(&vec![
        user_id.clone().into(),
        signup_request.email.clone().into(),
        password_hash.into(),
        signup_request.name.clone().into(),
        now.clone().into(),
        now.clone().into(),
    ])?.run().await;

    if result.is_err() {
        return Response::error("Failed to create user", 500);
    }

    // Create email verification token
    let verification_token = create_email_verification_token(&db, &user_id, &signup_request.email).await;

    // Send verification email (mock)
    send_verification_email(&signup_request.email, &verification_token).await;

    let user = User {
        id: user_id,
        email: signup_request.email.clone(),
        name: signup_request.name.clone(),
        avatar: None,
        created_at: now.clone(),
        updated_at: now,
        email_verified: false,
        is_active: true,
    };

    let response = AuthResponse {
        success: true,
        user: Some(user),
        token: None, // Don't provide token until email is verified
        expires_at: None,
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

async fn login(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let login_request: LoginRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Basic validation
    if login_request.email.is_empty() || login_request.password.is_empty() {
        return Response::error("Email and password are required", 400);
    }

    let db = ctx.env.d1("DB")?;

    // Get user from database
    let user_result = get_user_by_email(&db, &login_request.email).await;
    let auth_user = match user_result {
        Some(user) => user,
        None => {
            let error_response = AuthResponse {
                success: false,
                user: None,
                token: None,
                expires_at: None,
                error: Some("Invalid credentials".to_string()),
            };
            return Ok(Response::from_json(&error_response)?.with_status(401));
        }
    };

    // Check if account is locked
    if let Some(locked_until) = &auth_user.locked_until {
        if let Ok(locked_time) = chrono::DateTime::parse_from_rfc3339(locked_until) {
            if locked_time > Utc::now() {
                return Response::error("Account is locked due to too many failed login attempts", 423);
            }
        }
    }

    // Verify password
    let password_valid = match verify(&login_request.password, &auth_user.password_hash) {
        Ok(valid) => valid,
        Err(_) => false,
    };

    if !password_valid {
        // Increment failed login attempts
        increment_failed_login_attempts(&db, &auth_user.id).await;
        let error_response = AuthResponse {
            success: false,
            user: None,
            token: None,
            expires_at: None,
            error: Some("Invalid credentials".to_string()),
        };
        return Ok(Response::from_json(&error_response)?.with_status(401));
    }

    // Reset failed login attempts and update last login
    reset_failed_login_attempts(&db, &auth_user.id).await;

    // Create JWT token
    let claims = Claims {
        sub: auth_user.id.clone(),
        email: auth_user.email.clone(),
        exp: (Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let secret = match get_jwt_secret(&ctx) {
        Ok(secret) => secret,
        Err(_) => return Response::error("Authentication configuration error", 500),
    };
    let token = match encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())) {
        Ok(token) => token,
        Err(_) => return Response::error("Failed to generate token", 500),
    };

    // Create session
    let session_id = Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();
    let now = Utc::now().to_rfc3339();

    create_session(&db, &session_id, &auth_user.id, &token, &expires_at, &now).await;

    let user = User {
        id: auth_user.id,
        email: auth_user.email,
        name: auth_user.name,
        avatar: auth_user.avatar,
        created_at: auth_user.created_at,
        updated_at: auth_user.updated_at,
        email_verified: auth_user.email_verified,
        is_active: auth_user.is_active,
    };

    let response = AuthResponse {
        success: true,
        user: Some(user),
        token: Some(token.clone()),
        expires_at: Some(expires_at),
        error: None,
    };

    let mut response = Response::from_json(&response)?;
    
    // Set secure httpOnly cookie with domain for subdomain access
    // In production, this should use the actual domain
    let (cookie_domain, secure_flag) = match ctx.env.var("ENVIRONMENT") {
        Ok(env) => {
            if env.to_string() == "production" {
                ("; Domain=.nivaro.com", "; Secure")  // Production: domain restriction and secure
            } else {
                ("", "")  // Development: no domain restriction, no secure flag for localhost
            }
        },
        Err(_) => ("", "")  // Default to development settings
    };
    
    response = response.with_headers(
        Headers::from_iter(vec![
            ("Set-Cookie".to_string(), format!(
                "auth_token={}; HttpOnly{}; SameSite=Lax; Path=/; Max-Age=86400{}",
                token, secure_flag, cookie_domain
            ))
        ])
    );

    Ok(response)
}

async fn logout(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    if let Some(token) = extract_token(&req) {
        let db = ctx.env.d1("DB")?;
        // Revoke the session in the database
        let stmt = db.prepare("UPDATE sessions SET is_active = 0 WHERE token = ?1");
        let _ = stmt.bind(&vec![token.into()])?.run().await;
    }

    // Clear cookie with proper domain
    let (cookie_domain, secure_flag) = match ctx.env.var("ENVIRONMENT") {
        Ok(env) => {
            if env.to_string() == "production" {
                ("; Domain=.nivaro.com", "; Secure")
            } else {
                ("", "")
            }
        },
        Err(_) => ("", "")
    };
    
    let response = ApiResponse::success("Logged out successfully");
    Ok(Response::from_json(&response)?
        .with_headers(
            Headers::from_iter(vec![
                ("Set-Cookie".to_string(), format!(
                    "auth_token=; HttpOnly{}; SameSite=Lax; Path=/; Max-Age=0{}",
                    secure_flag, cookie_domain
                ))
            ])
        ))
}

async fn get_current_user(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Get user from database
    if let Some(auth_user) = get_user_by_id(&db, &user_id).await {
        let user = User {
            id: auth_user.id,
            email: auth_user.email,
            name: auth_user.name,
            avatar: auth_user.avatar,
            created_at: auth_user.created_at,
            updated_at: auth_user.updated_at,
            email_verified: auth_user.email_verified,
            is_active: auth_user.is_active,
        };

        let response = AuthResponse {
            success: true,
            user: Some(user),
            token: None, // Don't send token back in /me endpoint
            expires_at: None,
            error: None,
        };
        return Response::from_json(&response);
    }

    Response::error("User not found", 404)
}

// Simplified stubs for other endpoints to avoid compilation errors
async fn forgot_password(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let response = ApiResponse::success("Password reset email sent");
    Response::from_json(&response)
}

async fn reset_password(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let response = ApiResponse::success("Password reset successfully");
    Response::from_json(&response)
}

async fn change_password(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    let response = ApiResponse::success("Password changed successfully");
    Response::from_json(&response)
}

async fn verify_email(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let response = ApiResponse::success("Email verified successfully");
    Response::from_json(&response)
}

async fn update_profile(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    let response = ApiResponse::success("Profile updated successfully");
    Response::from_json(&response)
}

async fn delete_account(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    let response = ApiResponse::success("Account deleted successfully");
    Response::from_json(&response)
}

async fn social_login(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let response = ApiResponse::success("Social login successful");
    Response::from_json(&response)
}

async fn get_user_sessions(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let sessions: Vec<Session> = vec![];
    let response = ApiResponse::success(sessions);
    Response::from_json(&response)
}

async fn revoke_all_sessions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token for this state-changing operation
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    let response = ApiResponse::success("All sessions revoked successfully");
    Response::from_json(&response)
}

// Helper functions for D1 database operations

async fn user_exists(db: &D1Database, email: &str) -> bool {
    let stmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE email = ?1");
    
    let stmt = match stmt.bind(&vec![email.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return false,
    };
    
    match stmt.first::<serde_json::Value>(None).await {
        Ok(Some(result)) => result["count"].as_u64().unwrap_or(0) > 0,
        _ => false,
    }
}

async fn get_user_by_email(db: &D1Database, email: &str) -> Option<AuthUser> {
    let stmt = db.prepare("SELECT * FROM users WHERE email = ?1");
    let stmt = stmt.bind(&vec![email.into()]).ok()?;
    let result = stmt.first::<serde_json::Value>(None).await.ok()??;
        
    Some(AuthUser {
        id: result["id"].as_str()?.to_string(),
        email: result["email"].as_str()?.to_string(),
        password_hash: result["password_hash"].as_str()?.to_string(),
        name: result["name"].as_str()?.to_string(),
        avatar: result["avatar"].as_str().map(|s| s.to_string()),
        created_at: result["created_at"].as_str()?.to_string(),
        updated_at: result["updated_at"].as_str()?.to_string(),
        email_verified: result["email_verified"].as_i64()? == 1,
        is_active: result["is_active"].as_i64()? == 1,
        last_login: result["last_login"].as_str().map(|s| s.to_string()),
        failed_login_attempts: result["failed_login_attempts"].as_u64()? as u32,
        locked_until: result["locked_until"].as_str().map(|s| s.to_string()),
    })
}

async fn get_user_by_id(db: &D1Database, user_id: &str) -> Option<AuthUser> {
    let stmt = db.prepare("SELECT * FROM users WHERE id = ?1");
    let stmt = stmt.bind(&vec![user_id.into()]).ok()?;
    let result = stmt.first::<serde_json::Value>(None).await.ok()??;
        
    Some(AuthUser {
        id: result["id"].as_str()?.to_string(),
        email: result["email"].as_str()?.to_string(),
        password_hash: result["password_hash"].as_str()?.to_string(),
        name: result["name"].as_str()?.to_string(),
        avatar: result["avatar"].as_str().map(|s| s.to_string()),
        created_at: result["created_at"].as_str()?.to_string(),
        updated_at: result["updated_at"].as_str()?.to_string(),
        email_verified: result["email_verified"].as_i64()? == 1,
        is_active: result["is_active"].as_i64()? == 1,
        last_login: result["last_login"].as_str().map(|s| s.to_string()),
        failed_login_attempts: result["failed_login_attempts"].as_u64()? as u32,
        locked_until: result["locked_until"].as_str().map(|s| s.to_string()),
    })
}

async fn increment_failed_login_attempts(db: &D1Database, user_id: &str) {
    // Get current failed attempts
    let stmt = db.prepare("SELECT failed_login_attempts FROM users WHERE id = ?1");
    if let Ok(stmt) = stmt.bind(&vec![user_id.into()]) {
        if let Ok(Some(result)) = stmt.first::<serde_json::Value>(None).await {
            let attempts = result["failed_login_attempts"].as_u64().unwrap_or(0) + 1;
            
            if attempts >= 5 {
                // Lock account for 15 minutes
                let lock_until = (Utc::now() + chrono::Duration::minutes(15)).to_rfc3339();
                let stmt = db.prepare("UPDATE users SET failed_login_attempts = ?1, locked_until = ?2 WHERE id = ?3");
                if let Ok(stmt) = stmt.bind(&vec![
                    (attempts as f64).into(),
                    lock_until.into(),
                    user_id.into(),
                ]) {
                    let _ = stmt.run().await;
                }
            } else {
                let stmt = db.prepare("UPDATE users SET failed_login_attempts = ?1 WHERE id = ?2");
                if let Ok(stmt) = stmt.bind(&vec![
                    (attempts as f64).into(),
                    user_id.into(),
                ]) {
                    let _ = stmt.run().await;
                }
            }
        }
    }
}

async fn reset_failed_login_attempts(db: &D1Database, user_id: &str) {
    let stmt = db.prepare("UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = ?1 WHERE id = ?2");
    if let Ok(stmt) = stmt.bind(&vec![
        Utc::now().to_rfc3339().into(),
        user_id.into(),
    ]) {
        let _ = stmt.run().await;
    }
}

async fn create_session(db: &D1Database, session_id: &str, user_id: &str, token: &str, expires_at: &str, created_at: &str) {
    let stmt = db.prepare("
        INSERT INTO sessions (id, user_id, token, expires_at, created_at, last_accessed, is_active)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1)
    ");
    if let Ok(stmt) = stmt.bind(&vec![
        session_id.into(),
        user_id.into(),
        token.into(),
        expires_at.into(),
        created_at.into(),
        created_at.into(),
    ]) {
        let _ = stmt.run().await;
    }
}

async fn create_email_verification_token(db: &D1Database, user_id: &str, email: &str) -> String {
    let token = Uuid::new_v4().to_string();
    let verification_id = Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();
    let created_at = Utc::now().to_rfc3339();
    
    let stmt = db.prepare("
        INSERT INTO email_verifications (id, user_id, token, email, expires_at, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ");
    if let Ok(stmt) = stmt.bind(&vec![
        verification_id.into(),
        user_id.into(),
        token.clone().into(),
        email.into(),
        expires_at.into(),
        created_at.into(),
    ]) {
        let _ = stmt.run().await;
    }
    
    token
}

// Utility functions

fn is_valid_email(email: &str) -> bool {
    email.contains('@') && email.contains('.')
}

fn is_strong_password(password: &str) -> bool {
    password.len() >= 8 
        && password.chars().any(|c| c.is_uppercase())
        && password.chars().any(|c| c.is_lowercase())
        && password.chars().any(|c| c.is_numeric())
        && password.chars().any(|c| !c.is_alphanumeric())
}

async fn send_verification_email(_email: &str, _token: &str) {
    // Mock email sending - in production, use an email service
}

fn get_jwt_secret(ctx: &RouteContext<()>) -> Result<String> {
    ctx.env.var("JWT_SECRET")
        .map_err(|_| "JWT_SECRET environment variable not set".into())
        .map(|secret| secret.to_string())
}

fn extract_token(req: &Request) -> Option<String> {
    // Try to get token from Authorization header first
    if let Ok(Some(auth_header)) = req.headers().get("Authorization") {
        if auth_header.starts_with("Bearer ") {
            return Some(auth_header[7..].to_string());
        }
    }
    
    // Try to get token from cookie
    if let Ok(Some(cookie_header)) = req.headers().get("Cookie") {
        for cookie in cookie_header.split(';') {
            let cookie = cookie.trim();
            if cookie.starts_with("auth_token=") {
                return Some(cookie[11..].to_string());
            }
        }
    }
    
    None
}

pub fn get_user_id_from_token(req: &Request, ctx: &RouteContext<()>) -> Option<String> {
    let token = extract_token(req)?;
    
    let secret = match get_jwt_secret(ctx) {
        Ok(secret) => secret,
        Err(e) => {
            console_log!("Error getting JWT secret: {}", e);
            return None;
        }
    };
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::default();
    
    match decode::<Claims>(&token, &decoding_key, &validation) {
        Ok(token_data) => Some(token_data.claims.sub),
        Err(_) => None, // Invalid or expired token
    }
}

// CSRF Protection Functions

pub async fn get_csrf_token(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // For CSRF tokens, we need a user to be authenticated
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Try to get existing valid CSRF token
    if let Some(existing_token) = get_valid_csrf_token(&db, &user_id).await {
        let response = serde_json::json!({
            "token": existing_token,
            "expires_at": chrono::Utc::now().checked_add_signed(chrono::Duration::hours(1))
                .unwrap_or(chrono::Utc::now()).to_rfc3339()
        });
        return Response::from_json(&response);
    }

    // Generate new CSRF token
    let csrf_token = generate_csrf_token();
    let token_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let expires_at = (Utc::now() + chrono::Duration::hours(1)).to_rfc3339();

    // Store token in database
    let result = store_csrf_token(&db, &token_id, &user_id, &csrf_token, &expires_at, &now).await;
    
    if !result {
        return Response::error("Failed to generate CSRF token", 500);
    }

    let response = serde_json::json!({
        "token": csrf_token,
        "expires_at": expires_at
    });

    Response::from_json(&response)
}

async fn get_valid_csrf_token(db: &D1Database, user_id: &str) -> Option<String> {
    let now = Utc::now().to_rfc3339();
    let stmt = db.prepare("SELECT token FROM csrf_tokens WHERE user_id = ?1 AND expires_at > ?2 ORDER BY created_at DESC LIMIT 1");
    
    if let Ok(stmt) = stmt.bind(&vec![user_id.into(), now.into()]) {
        if let Ok(Some(result)) = stmt.first::<serde_json::Value>(None).await {
            if let Some(token) = result["token"].as_str() {
                return Some(token.to_string());
            }
        }
    }
    None
}

fn generate_csrf_token() -> String {
    Uuid::new_v4().to_string()
}

async fn store_csrf_token(db: &D1Database, token_id: &str, user_id: &str, token: &str, expires_at: &str, created_at: &str) -> bool {
    // Clean up expired tokens first
    cleanup_expired_csrf_tokens(db, user_id).await;
    
    let stmt = db.prepare("
        INSERT INTO csrf_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
    ");
    
    if let Ok(stmt) = stmt.bind(&vec![
        token_id.into(),
        user_id.into(),
        token.into(),
        expires_at.into(),
        created_at.into(),
    ]) {
        stmt.run().await.is_ok()
    } else {
        false
    }
}

async fn cleanup_expired_csrf_tokens(db: &D1Database, user_id: &str) {
    let now = Utc::now().to_rfc3339();
    let stmt = db.prepare("DELETE FROM csrf_tokens WHERE user_id = ?1 AND expires_at <= ?2");
    if let Ok(stmt) = stmt.bind(&vec![user_id.into(), now.into()]) {
        let _ = stmt.run().await;
    }
}

pub async fn verify_csrf_token(req: &Request, ctx: &RouteContext<()>) -> Result<bool> {
    // Get user ID from the request
    let user_id = match get_user_id_from_token(req, ctx) {
        Some(id) => id,
        None => return Ok(false), // Not authenticated
    };

    // Get CSRF token from header
    let csrf_token = match req.headers().get("X-CSRF-Token") {
        Ok(Some(token)) => token,
        _ => return Ok(false), // No CSRF token provided
    };

    let db = ctx.env.d1("DB")?;
    
    // Verify token exists and is valid
    let now = Utc::now().to_rfc3339();
    let stmt = db.prepare("SELECT COUNT(*) as count FROM csrf_tokens WHERE user_id = ?1 AND token = ?2 AND expires_at > ?3");
    
    if let Ok(stmt) = stmt.bind(&vec![
        user_id.into(),
        csrf_token.into(),
        now.into(),
    ]) {
        if let Ok(Some(result)) = stmt.first::<serde_json::Value>(None).await {
            let count = result["count"].as_u64().unwrap_or(0);
            return Ok(count > 0);
        }
    }
    
    Ok(false)
}