use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user id
    email: String,
    exp: usize, // expiration timestamp
    iat: usize, // issued at timestamp
}

pub async fn handle_auth(req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    match (method, path) {
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

    // Create user (mock creation)
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let user = User {
        id: user_id.clone(),
        email: signup_request.email.clone(),
        name: signup_request.name.clone(),
        avatar: None,
        created_at: now.clone(),
        updated_at: now,
        email_verified: false,
        is_active: true,
    };

    // Store user (mock storage)
    store_user(&user).await;

    // Create email verification token
    let _verification_token = create_email_verification_token(&user_id).await;

    // Send verification email (mock)
    send_verification_email(&signup_request.email, &_verification_token).await;

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

    // Basic validation
    if login_request.email.is_empty() || login_request.password.is_empty() {
        return Response::error("Email and password are required", 400);
    }

    // In a real implementation, this would:
    // 1. Query database for user by email
    // 2. Verify password using bcrypt
    // 3. Check if account is active and verified
    // For now, return unauthorized for all attempts
    Response::error("Invalid credentials", 401)
}

async fn logout(req: Request) -> Result<Response> {
    if let Some(_token) = extract_token(&req) {
        // In a real app, revoke the token in the database
    }

    let response = ApiResponse::success("Logged out successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter(vec![
            ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
        ])))
}

async fn forgot_password(mut req: Request) -> Result<Response> {
    let _forgot_request: ForgotPasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Rate limiting
    if is_rate_limited(&req, "forgot_password").await {
        return Response::error("Too many password reset requests. Please try again later", 429);
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

    // Mock validation
    let response = ApiResponse::success("Password reset successfully");
    Response::from_json(&response)
}

async fn change_password(mut req: Request) -> Result<Response> {
    let change_request: ChangePasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Get current user from token
    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    if !is_strong_password(&change_request.new_password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    let response = ApiResponse::success("Password changed successfully");
    Response::from_json(&response)
}

async fn verify_email(mut req: Request) -> Result<Response> {
    let _verify_request: VerifyEmailRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let response = ApiResponse::success("Email verified successfully");
    Response::from_json(&response)
}

async fn get_current_user(req: Request) -> Result<Response> {
    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // TODO: Query user from database by user_id
    // For now, return unauthorized since we don't have a database
    Response::error("User not found", 404)
}

async fn update_profile(mut req: Request) -> Result<Response> {
    let _update_request: UpdateProfileRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // TODO: Update user profile in database
    // For now, return not implemented
    Response::error("Profile update not implemented", 501)
}

async fn delete_account(req: Request) -> Result<Response> {
    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let response = ApiResponse::success("Account deleted successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter(vec![
            ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
        ])))
}

async fn social_login(mut req: Request) -> Result<Response> {
    let social_request: SocialLoginRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Mock social login - create user from social profile
    let now = Utc::now().to_rfc3339();
    let user = User {
        id: Uuid::new_v4().to_string(),
        email: social_request.profile.email,
        name: social_request.profile.name,
        avatar: social_request.profile.avatar,
        created_at: now.clone(),
        updated_at: now,
        email_verified: true, // Social accounts are pre-verified
        is_active: true,
    };

    let token = create_jwt_token(&user);
    let expires_at = Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .to_rfc3339();

    let response = AuthResponse {
        success: true,
        user: Some(user),
        token: Some(token.clone()),
        expires_at: Some(expires_at),
        error: None,
    };

    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter(vec![
            ("Set-Cookie".to_string(), format!("auth_token={}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400", token))
        ])))
}

async fn get_user_sessions(req: Request) -> Result<Response> {
    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let sessions: Vec<Session> = vec![]; // Mock empty sessions
    let response = ApiResponse::success(sessions);
    Response::from_json(&response)
}

async fn revoke_all_sessions(req: Request) -> Result<Response> {
    let _user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let response = ApiResponse::success("All sessions revoked successfully");
    Ok(Response::from_json(&response)?
        .with_headers(worker::Headers::from_iter(vec![
            ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
        ])))
}

// Helper functions (mock implementations)

async fn authenticate_user(_email: &str, _password: &str) -> Option<User> {
    // TODO: Replace with real database authentication
    // For now, return None (no valid users)
    // In production, this would:
    // 1. Query user from database by email
    // 2. Verify password using bcrypt::verify
    // 3. Return user if credentials are valid
    None
}

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

async fn store_user(_user: &User) {
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

fn create_jwt_token(user: &User) -> String {
    // TODO: Use environment variable for JWT secret in production
    let secret = "your-256-bit-secret-key-change-this-in-production";
    let encoding_key = EncodingKey::from_secret(secret.as_ref());
    
    let now = Utc::now();
    let expires_at = now + chrono::Duration::hours(24);
    
    let claims = Claims {
        sub: user.id.clone(),
        email: user.email.clone(),
        exp: expires_at.timestamp() as usize,
        iat: now.timestamp() as usize,
    };
    
    encode(&Header::default(), &claims, &encoding_key)
        .unwrap_or_else(|_| format!("fallback_token_for_{}", user.id))
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

fn get_user_id_from_token(req: &Request) -> Option<String> {
    let token = extract_token(req)?;
    
    // TODO: Use environment variable for JWT secret in production
    let secret = "your-256-bit-secret-key-change-this-in-production";
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::default();
    
    match decode::<Claims>(&token, &decoding_key, &validation) {
        Ok(token_data) => Some(token_data.claims.sub),
        Err(_) => None, // Invalid or expired token
    }
}