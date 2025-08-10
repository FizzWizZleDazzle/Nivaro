use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};

// JWT Claims structure
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user ID
    email: String,
    name: String,
    exp: i64,    // expiration time
    iat: i64,    // issued at
}

// JWT Secret - in production, this should be from environment variables
const JWT_SECRET: &str = "your-secret-key-should-be-from-env";

pub async fn handle_auth(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let path = ctx.path();
    
    match (method, path.as_str()) {
        (Method::Post, "/api/auth/signup") => signup(req).await,
        (Method::Post, "/api/auth/login") => login(req).await,
        (Method::Post, "/api/auth/logout") => logout(req).await,
        (Method::Post, "/api/auth/forgot-password") => forgot_password(req).await,
        (Method::Post, "/api/auth/reset-password") => reset_password(req).await,
        (Method::Post, "/api/auth/change-password") => change_password(req).await,
        (Method::Post, "/api/auth/verify-email") => verify_email(req).await,
        (Method::Get, "/api/auth/me") => get_current_user(req).await,
        (Method::Put, "/api/auth/profile") => update_profile(req).await,
        (Method::Delete, "/api/auth/account") => delete_account(req).await,
        (Method::Post, "/api/auth/social") => social_login(req).await,
        (Method::Get, "/api/auth/sessions") => get_user_sessions(req).await,
        (Method::Delete, "/api/auth/sessions") => revoke_all_sessions(req).await,
        _ => Response::error("Not found", 404)
    }
}

async fn signup(mut req: Request) -> Result<Response> {
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

    // Check if user already exists (mock check)
    if user_exists(&signup_request.email).await {
        return Response::error("User with this email already exists", 409);
    }

    // Hash password
    let password_hash = match hash(&signup_request.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return Response::error("Failed to process password", 500),
    };

    // Create user
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let auth_user = AuthUser {
        id: user_id.clone(),
        email: signup_request.email.clone(),
        password_hash,
        name: signup_request.name.clone(),
        avatar: None,
        created_at: now.clone(),
        updated_at: now.clone(),
        email_verified: false,
        is_active: true,
        last_login: None,
        failed_login_attempts: 0,
        locked_until: None,
    };

    // Store user (mock storage)
    store_user(&auth_user).await;

    // Create email verification token
    let verification_token = create_email_verification_token(&user_id).await;

    // Send verification email (mock)
    send_verification_email(&signup_request.email, &verification_token).await;

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
        token: None, // Don't provide token until email is verified
        expires_at: None,
        error: None,
    };

    Ok(Response::from_json(&response)?.with_status(201))
}

async fn login(mut req: Request) -> Result<Response> {
    let login_request: LoginRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Rate limiting check (mock)
    if is_rate_limited(&req, "login").await {
        return Response::error("Too many login attempts. Please try again later", 429);
    }

    // Get user
    let auth_user = match get_user_by_email(&login_request.email).await {
        Some(user) => user,
        None => {
            increment_failed_attempt(&login_request.email).await;
            return Response::error("Invalid credentials", 401);
        }
    };

    // Check if account is locked
    if is_account_locked(&auth_user).await {
        return Response::error("Account is temporarily locked due to multiple failed attempts", 423);
    }

    // Verify password
    if !verify(&login_request.password, &auth_user.password_hash).unwrap_or(false) {
        increment_failed_attempt(&login_request.email).await;
        return Response::error("Invalid credentials", 401);
    }

    // Check if account is active
    if !auth_user.is_active {
        return Response::error("Account is deactivated", 403);
    }

    // Reset failed attempts
    reset_failed_attempts(&auth_user.id).await;

    // Create JWT token
    let token = match create_jwt_token(&auth_user) {
        Ok(token) => token,
        Err(_) => return Response::error("Failed to create session", 500),
    };

    // Create session
    let session = create_session(&auth_user.id, &token, &req).await;

    // Update last login
    update_last_login(&auth_user.id).await;

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
        token: Some(token),
        expires_at: Some(session.expires_at),
        error: None,
    };

    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter([
            ("Set-Cookie", &format!("auth_token={}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400", session.token))
        ]))
}

async fn logout(req: Request) -> Result<Response> {
    if let Some(token) = extract_token(&req) {
        revoke_session(&token).await;
    }

    let response = ApiResponse::success("Logged out successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter([
            ("Set-Cookie", "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0")
        ]))
}

async fn forgot_password(mut req: Request) -> Result<Response> {
    let forgot_request: ForgotPasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Rate limiting
    if is_rate_limited(&req, "forgot_password").await {
        return Response::error("Too many password reset requests. Please try again later", 429);
    }

    // Check if user exists
    if let Some(user) = get_user_by_email(&forgot_request.email).await {
        // Create password reset token
        let reset_token = create_password_reset_token(&user.id).await;
        
        // Send reset email (mock)
        send_password_reset_email(&user.email, &reset_token).await;
    }

    // Always return success to prevent email enumeration
    let response = ApiResponse::success("If an account with that email exists, a password reset link has been sent");
    Response::from_json(&response)
}

async fn reset_password(mut req: Request) -> Result<Response> {
    let reset_request: ResetPasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    if !is_strong_password(&reset_request.new_password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    // Validate reset token
    let user_id = match validate_password_reset_token(&reset_request.token).await {
        Some(user_id) => user_id,
        None => return Response::error("Invalid or expired reset token", 400),
    };

    // Hash new password
    let password_hash = match hash(&reset_request.new_password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return Response::error("Failed to process password", 500),
    };

    // Update password
    update_user_password(&user_id, &password_hash).await;

    // Mark reset token as used
    mark_reset_token_used(&reset_request.token).await;

    // Revoke all existing sessions
    revoke_user_sessions(&user_id).await;

    let response = ApiResponse::success("Password reset successfully");
    Response::from_json(&response)
}

async fn change_password(mut req: Request) -> Result<Response> {
    let change_request: ChangePasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Get current user from token
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let auth_user = match get_user_by_id(&user_id).await {
        Some(user) => user,
        None => return Response::error("User not found", 404),
    };

    // Verify current password
    if !verify(&change_request.current_password, &auth_user.password_hash).unwrap_or(false) {
        return Response::error("Current password is incorrect", 400);
    }

    if !is_strong_password(&change_request.new_password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    // Hash new password
    let password_hash = match hash(&change_request.new_password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return Response::error("Failed to process password", 500),
    };

    // Update password
    update_user_password(&user_id, &password_hash).await;

    // Revoke other sessions (keep current one)
    let current_token = extract_token(&req).unwrap_or_default();
    revoke_user_sessions_except(&user_id, &current_token).await;

    let response = ApiResponse::success("Password changed successfully");
    Response::from_json(&response)
}

async fn verify_email(mut req: Request) -> Result<Response> {
    let verify_request: VerifyEmailRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Validate verification token
    let user_id = match validate_email_verification_token(&verify_request.token).await {
        Some(user_id) => user_id,
        None => return Response::error("Invalid or expired verification token", 400),
    };

    // Mark email as verified
    mark_email_verified(&user_id).await;

    let response = ApiResponse::success("Email verified successfully");
    Response::from_json(&response)
}

async fn get_current_user(req: Request) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let auth_user = match get_user_by_id(&user_id).await {
        Some(user) => user,
        None => return Response::error("User not found", 404),
    };

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

    let response = ApiResponse::success(user);
    Response::from_json(&response)
}

async fn update_profile(mut req: Request) -> Result<Response> {
    let update_request: UpdateProfileRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // Update user profile (mock update)
    let updated_user = update_user_profile(&user_id, &update_request).await;

    let response = ApiResponse::success(updated_user);
    Response::from_json(&response)
}

async fn delete_account(req: Request) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // Deactivate account instead of hard delete
    deactivate_user_account(&user_id).await;

    // Revoke all sessions
    revoke_user_sessions(&user_id).await;

    let response = ApiResponse::success("Account deleted successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter([
            ("Set-Cookie", "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0")
        ])))
}

async fn social_login(mut req: Request) -> Result<Response> {
    let social_request: SocialLoginRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Validate social token with provider (mock validation)
    if !validate_social_token(&social_request.provider, &social_request.access_token).await {
        return Response::error("Invalid social login token", 401);
    }

    // Check if social account exists
    let user = if let Some(existing_user) = get_user_by_social_id(&social_request.provider, &social_request.profile.id).await {
        existing_user
    } else {
        // Create new user from social profile
        create_user_from_social(&social_request).await
    };

    // Create JWT token
    let token = match create_jwt_token(&user) {
        Ok(token) => token,
        Err(_) => return Response::error("Failed to create session", 500),
    };

    // Create session
    let session = create_session(&user.id, &token, &req).await;

    let user_response = User {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_verified: user.email_verified,
        is_active: user.is_active,
    };

    let response = AuthResponse {
        success: true,
        user: Some(user_response),
        token: Some(token),
        expires_at: Some(session.expires_at),
        error: None,
    };

    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter([
            ("Set-Cookie", &format!("auth_token={}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400", session.token))
        ]))
}

async fn get_user_sessions(req: Request) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let sessions = get_active_user_sessions(&user_id).await;
    let response = ApiResponse::success(sessions);
    Response::from_json(&response)
}

async fn revoke_all_sessions(req: Request) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    revoke_user_sessions(&user_id).await;

    let response = ApiResponse::success("All sessions revoked successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter([
            ("Set-Cookie", "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0")
        ]))
}

// Helper functions (mock implementations)
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

async fn user_exists(_email: &str) -> bool {
    // Mock check - in real app, query database
    false
}

async fn store_user(_user: &AuthUser) {
    // Mock storage - in real app, save to database
}

async fn create_email_verification_token(_user_id: &str) -> String {
    Uuid::new_v4().to_string()
}

async fn send_verification_email(_email: &str, _token: &str) {
    // Mock email sending
}

async fn is_rate_limited(_req: &Request, _action: &str) -> bool {
    // Mock rate limiting
    false
}

async fn get_user_by_email(_email: &str) -> Option<AuthUser> {
    // Mock user lookup - return demo user for testing
    if _email == "demo@nivaro.com" {
        let now = Utc::now().to_rfc3339();
        Some(AuthUser {
            id: "user-1".to_string(),
            email: "demo@nivaro.com".to_string(),
            password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBh.y8h6nHgr.6".to_string(), // "password123"
            name: "Demo User".to_string(),
            avatar: None,
            created_at: now.clone(),
            updated_at: now,
            email_verified: true,
            is_active: true,
            last_login: None,
            failed_login_attempts: 0,
            locked_until: None,
        })
    } else {
        None
    }
}

async fn increment_failed_attempt(_email: &str) {
    // Mock increment
}

async fn is_account_locked(_user: &AuthUser) -> bool {
    if let Some(locked_until) = &_user.locked_until {
        // Check if still locked
        return Utc::now().to_rfc3339() < *locked_until;
    }
    false
}

async fn reset_failed_attempts(_user_id: &str) {
    // Mock reset
}

fn create_jwt_token(user: &AuthUser) -> Result<String> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user.id.clone(),
        email: user.email.clone(),
        name: user.name.clone(),
        exp: expiration,
        iat: Utc::now().timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref()),
    ).map_err(|_| worker::Error::RustError("Failed to create JWT token".to_string()))
}

async fn create_session(user_id: &str, token: &str, req: &Request) -> Session {
    let now = Utc::now().to_rfc3339();
    let expires_at = Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .to_rfc3339();

    Session {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.to_string(),
        token: token.to_string(),
        expires_at,
        created_at: now.clone(),
        last_accessed: now,
        user_agent: req.headers().get("User-Agent").unwrap_or_default(),
        ip_address: req.headers().get("CF-Connecting-IP").ok().flatten()
            .or_else(|| req.headers().get("X-Forwarded-For").ok().flatten()),
        is_active: true,
    }
}

async fn update_last_login(_user_id: &str) {
    // Mock update
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

async fn revoke_session(_token: &str) {
    // Mock revoke
}

async fn create_password_reset_token(_user_id: &str) -> String {
    Uuid::new_v4().to_string()
}

async fn send_password_reset_email(_email: &str, _token: &str) {
    // Mock email sending
}

async fn validate_password_reset_token(_token: &str) -> Option<String> {
    // Mock validation - always return user-1 for demo
    Some("user-1".to_string())
}

async fn update_user_password(_user_id: &str, _password_hash: &str) {
    // Mock update
}

async fn mark_reset_token_used(_token: &str) {
    // Mock update
}

async fn revoke_user_sessions(_user_id: &str) {
    // Mock revoke
}

fn get_user_id_from_token(req: &Request) -> Option<String> {
    let token = extract_token(req)?;
    
    let validation = Validation::default();
    match decode::<Claims>(
        &token,
        &DecodingKey::from_secret(JWT_SECRET.as_ref()),
        &validation,
    ) {
        Ok(token_data) => Some(token_data.claims.sub),
        Err(_) => None,
    }
}

async fn get_user_by_id(_user_id: &str) -> Option<AuthUser> {
    // Mock lookup - return demo user for testing
    if _user_id == "user-1" {
        let now = Utc::now().to_rfc3339();
        Some(AuthUser {
            id: "user-1".to_string(),
            email: "demo@nivaro.com".to_string(),
            password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBh.y8h6nHgr.6".to_string(),
            name: "Demo User".to_string(),
            avatar: None,
            created_at: now.clone(),
            updated_at: now,
            email_verified: true,
            is_active: true,
            last_login: None,
            failed_login_attempts: 0,
            locked_until: None,
        })
    } else {
        None
    }
}

async fn revoke_user_sessions_except(_user_id: &str, _except_token: &str) {
    // Mock revoke
}

async fn validate_email_verification_token(_token: &str) -> Option<String> {
    // Mock validation - always return user-1 for demo
    Some("user-1".to_string())
}

async fn mark_email_verified(_user_id: &str) {
    // Mock update
}

async fn update_user_profile(_user_id: &str, _update: &UpdateProfileRequest) -> User {
    // Mock update - return demo user
    let now = Utc::now().to_rfc3339();
    User {
        id: "user-1".to_string(),
        email: "demo@nivaro.com".to_string(),
        name: _update.name.clone().unwrap_or("Demo User".to_string()),
        avatar: None,
        created_at: now.clone(),
        updated_at: now,
        email_verified: true,
        is_active: true,
    }
}

async fn deactivate_user_account(_user_id: &str) {
    // Mock deactivation
}

async fn validate_social_token(_provider: &SocialProvider, _token: &str) -> bool {
    // Mock validation - always return true for demo
    true
}

async fn get_user_by_social_id(_provider: &SocialProvider, _social_id: &str) -> Option<AuthUser> {
    // Mock lookup
    None
}

async fn create_user_from_social(social_request: &SocialLoginRequest) -> AuthUser {
    let now = Utc::now().to_rfc3339();
    AuthUser {
        id: Uuid::new_v4().to_string(),
        email: social_request.profile.email.clone(),
        password_hash: "".to_string(), // No password for social accounts
        name: social_request.profile.name.clone(),
        avatar: social_request.profile.avatar.clone(),
        created_at: now.clone(),
        updated_at: now,
        email_verified: true, // Social accounts are pre-verified
        is_active: true,
        last_login: None,
        failed_login_attempts: 0,
        locked_until: None,
    }
}

async fn get_active_user_sessions(_user_id: &str) -> Vec<Session> {
    // Mock sessions
    vec![]
}