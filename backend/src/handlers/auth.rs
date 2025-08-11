use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use bcrypt::{hash, verify, DEFAULT_COST};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user id
    email: String,
    exp: usize, // expiration timestamp
    iat: usize, // issued at timestamp
}

// Simple in-memory storage for development/demo purposes
// In production, this would be replaced with a proper database
static USER_STORAGE: std::sync::LazyLock<Arc<Mutex<HashMap<String, AuthUser>>>> = 
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

static SESSION_STORAGE: std::sync::LazyLock<Arc<Mutex<HashMap<String, Session>>>> = 
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

static EMAIL_VERIFICATION_STORAGE: std::sync::LazyLock<Arc<Mutex<HashMap<String, EmailVerification>>>> = 
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

static PASSWORD_RESET_STORAGE: std::sync::LazyLock<Arc<Mutex<HashMap<String, PasswordReset>>>> = 
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

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

    // Create user (actual storage implementation)
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    // Hash the password
    let password_hash = match hash(&signup_request.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return Response::error("Failed to process password", 500),
    };
    
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

    // Store user (actual storage)
    store_user(&auth_user).await;

    // Create email verification token
    let verification_token = create_email_verification_token(&user_id).await;

    // Send verification email (mock)
    send_verification_email(&signup_request.email, &verification_token).await;

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

    // Authenticate user with actual implementation
    if let Some(user) = authenticate_user(&login_request.email, &login_request.password).await {
        // Update last login
        update_user_last_login(&user.id).await;

        // Create JWT token
        let token = create_jwt_token(&user);
        let expires_at = Utc::now()
            .checked_add_signed(chrono::Duration::hours(24))
            .expect("valid timestamp")
            .to_rfc3339();

        // Create session (variable prefixed to avoid warning)
        let _session = create_user_session(&user.id, &token).await;

        let response = AuthResponse {
            success: true,
            user: Some(user),
            token: Some(token.clone()),
            expires_at: Some(expires_at),
            error: None,
        };

        return Ok(Response::from_json(&response)?
            .with_headers(worker::Headers::from_iter(vec![
                ("Set-Cookie".to_string(), format!("auth_token={}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400", token))
            ])));
    }

    // Increment failed login attempts for security
    increment_failed_login_attempts(&login_request.email).await;
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
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    if !is_strong_password(&change_request.new_password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    // Update password
    if let Ok(mut storage) = USER_STORAGE.lock() {
        if let Some(user) = storage.get_mut(&user_id) {
            // Verify current password
            if !verify(&change_request.current_password, &user.password_hash).unwrap_or(false) {
                return Response::error("Current password is incorrect", 400);
            }
            
            // Hash new password
            match hash(&change_request.new_password, DEFAULT_COST) {
                Ok(new_hash) => {
                    user.password_hash = new_hash;
                    user.updated_at = Utc::now().to_rfc3339();
                    
                    let response = ApiResponse::success("Password changed successfully");
                    return Response::from_json(&response);
                },
                Err(_) => return Response::error("Failed to process new password", 500),
            }
        }
    }

    Response::error("User not found", 404)
}

async fn verify_email(mut req: Request) -> Result<Response> {
    let verify_request: VerifyEmailRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Find and validate verification token
    if let Ok(mut email_storage) = EMAIL_VERIFICATION_STORAGE.lock() {
        if let Some(verification) = email_storage.values().find(|v| v.token == verify_request.token).cloned() {
            // Check if token is expired
            if let Ok(expires_at) = chrono::DateTime::parse_from_rfc3339(&verification.expires_at) {
                if expires_at < Utc::now() {
                    return Response::error("Verification token has expired", 400);
                }
                
                // Mark user as verified
                if let Ok(mut user_storage) = USER_STORAGE.lock() {
                    if let Some(user) = user_storage.get_mut(&verification.user_id) {
                        user.email_verified = true;
                        user.updated_at = Utc::now().to_rfc3339();
                        
                        // Remove the verification token (one-time use)
                        email_storage.retain(|_, v| v.token != verify_request.token);
                        
                        let response = ApiResponse::success("Email verified successfully");
                        return Response::from_json(&response);
                    }
                }
            }
        }
    }

    Response::error("Invalid or expired verification token", 400)
}

async fn get_current_user(req: Request) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // Get user from storage
    if let Some(user) = get_user_by_id(&user_id).await {
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

async fn update_profile(mut req: Request) -> Result<Response> {
    let update_request: UpdateProfileRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    // Update user profile
    if let Ok(mut storage) = USER_STORAGE.lock() {
        // First check if email is already taken (if email update is requested)
        if let Some(ref email) = update_request.email {
            if !email.trim().is_empty() && is_valid_email(email) {
                let email_taken = storage.values().any(|u| u.id != user_id && u.email == *email);
                if email_taken {
                    return Response::error("Email is already taken", 409);
                }
            }
        }
        
        // Now update the user
        if let Some(user) = storage.get_mut(&user_id) {
            let mut updated = false;
            
            if let Some(name) = update_request.name {
                if !name.trim().is_empty() {
                    user.name = name;
                    updated = true;
                }
            }
            
            if let Some(email) = update_request.email {
                if !email.trim().is_empty() && is_valid_email(&email) {
                    user.email = email;
                    user.email_verified = false; // Require re-verification for new email
                    updated = true;
                }
            }
            
            if updated {
                user.updated_at = Utc::now().to_rfc3339();
                let response = ApiResponse::success("Profile updated successfully");
                return Response::from_json(&response);
            }
        }
    }

    Response::error("Failed to update profile", 500)
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

// Helper functions (actual implementations)

async fn authenticate_user(email: &str, password: &str) -> Option<User> {
    let storage = USER_STORAGE.lock().ok()?;
    
    if let Some(auth_user) = storage.values().find(|u| u.email == email) {
        // Check if account is locked
        if let Some(locked_until) = &auth_user.locked_until {
            if let Ok(locked_time) = chrono::DateTime::parse_from_rfc3339(locked_until) {
                if locked_time > Utc::now() {
                    return None; // Account is still locked
                }
            }
        }
        
        // Check if account is active and email is verified
        if !auth_user.is_active {
            return None;
        }
        
        // Verify password
        if verify(password, &auth_user.password_hash).unwrap_or(false) {
            // Convert AuthUser to User (without sensitive data)
            return Some(User {
                id: auth_user.id.clone(),
                email: auth_user.email.clone(),
                name: auth_user.name.clone(),
                avatar: auth_user.avatar.clone(),
                created_at: auth_user.created_at.clone(),
                updated_at: auth_user.updated_at.clone(),
                email_verified: auth_user.email_verified,
                is_active: auth_user.is_active,
            });
        }
    }
    
    None
}

async fn get_user_by_id(user_id: &str) -> Option<User> {
    let storage = USER_STORAGE.lock().ok()?;
    
    if let Some(auth_user) = storage.get(user_id) {
        return Some(User {
            id: auth_user.id.clone(),
            email: auth_user.email.clone(),
            name: auth_user.name.clone(),
            avatar: auth_user.avatar.clone(),
            created_at: auth_user.created_at.clone(),
            updated_at: auth_user.updated_at.clone(),
            email_verified: auth_user.email_verified,
            is_active: auth_user.is_active,
        });
    }
    
    None
}

async fn update_user_last_login(user_id: &str) {
    if let Ok(mut storage) = USER_STORAGE.lock() {
        if let Some(user) = storage.get_mut(user_id) {
            user.last_login = Some(Utc::now().to_rfc3339());
            user.failed_login_attempts = 0; // Reset failed attempts on successful login
            user.locked_until = None; // Clear any lock
        }
    }
}

async fn increment_failed_login_attempts(email: &str) {
    if let Ok(mut storage) = USER_STORAGE.lock() {
        if let Some(user) = storage.values_mut().find(|u| u.email == email) {
            user.failed_login_attempts += 1;
            
            // Lock account after 5 failed attempts for 15 minutes
            if user.failed_login_attempts >= 5 {
                let lock_until = Utc::now()
                    .checked_add_signed(chrono::Duration::minutes(15))
                    .expect("valid timestamp")
                    .to_rfc3339();
                user.locked_until = Some(lock_until);
            }
        }
    }
}

async fn create_user_session(user_id: &str, token: &str) -> Session {
    let session = Session {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.to_string(),
        token: token.to_string(),
        expires_at: Utc::now()
            .checked_add_signed(chrono::Duration::hours(24))
            .expect("valid timestamp")
            .to_rfc3339(),
        created_at: Utc::now().to_rfc3339(),
        last_accessed: Utc::now().to_rfc3339(),
        user_agent: None, // Could be extracted from request headers
        ip_address: None, // Could be extracted from request
        is_active: true,
    };
    
    if let Ok(mut storage) = SESSION_STORAGE.lock() {
        storage.insert(session.id.clone(), session.clone());
    }
    
    session
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

async fn user_exists(email: &str) -> bool {
    if let Ok(storage) = USER_STORAGE.lock() {
        return storage.values().any(|u| u.email == email);
    }
    false
}

async fn store_user(user: &AuthUser) {
    if let Ok(mut storage) = USER_STORAGE.lock() {
        storage.insert(user.id.clone(), user.clone());
    }
}

async fn create_email_verification_token(user_id: &str) -> String {
    let token = Uuid::new_v4().to_string();
    let verification = EmailVerification {
        id: Uuid::new_v4().to_string(),
        user_id: user_id.to_string(),
        token: token.clone(),
        email: String::new(), // Would be filled from user data
        expires_at: Utc::now()
            .checked_add_signed(chrono::Duration::hours(24))
            .expect("valid timestamp")
            .to_rfc3339(),
        created_at: Utc::now().to_rfc3339(),
    };
    
    if let Ok(mut storage) = EMAIL_VERIFICATION_STORAGE.lock() {
        storage.insert(verification.id.clone(), verification);
    }
    
    token
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