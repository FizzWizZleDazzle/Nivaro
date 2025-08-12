use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use bcrypt::{hash, verify, DEFAULT_COST};
use wasm_bindgen::JsValue;

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
    if user_exists(&db, &signup_request.email).await? {
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

    // Insert user into database
    let result = db.prepare("
        INSERT INTO users (id, email, password_hash, name, created_at, updated_at, email_verified, is_active, failed_login_attempts)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, 1, 0)
    ")
    .bind(&[
        JsValue::from_str(&user_id),
        JsValue::from_str(&signup_request.email),
        JsValue::from_str(&password_hash),
        JsValue::from_str(&signup_request.name),
        JsValue::from_str(&now),
        JsValue::from_str(&now),
    ])?
    .run()
    .await;

    if result.is_err() {
        return Response::error("Failed to create user", 500);
    }

    // Create email verification token
    let verification_token = create_email_verification_token(&db, &user_id, &signup_request.email).await?;

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

    // Rate limiting check
    if is_rate_limited(&req, "login").await {
        return Response::error("Too many login attempts. Please try again later", 429);
    }

    // Basic validation
    if login_request.email.is_empty() || login_request.password.is_empty() {
        return Response::error("Email and password are required", 400);
    }

    let db = ctx.env.d1("DB")?;

    // Get user from database
    let user_result = get_user_by_email(&db, &login_request.email).await?;
    let auth_user = match user_result {
        Some(user) => user,
        None => return Response::error("Invalid credentials", 401),
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
        increment_failed_login_attempts(&db, &auth_user.id).await?;
        return Response::error("Invalid credentials", 401);
    }

    // Reset failed login attempts and update last login
    reset_failed_login_attempts(&db, &auth_user.id).await?;

    // Create JWT token
    let claims = Claims {
        sub: auth_user.id.clone(),
        email: auth_user.email.clone(),
        exp: (Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let secret = get_jwt_secret();
    let token = match encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())) {
        Ok(token) => token,
        Err(_) => return Response::error("Failed to generate token", 500),
    };

    // Create session
    let session_id = Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();
    let now = Utc::now().to_rfc3339();

    create_session(&db, &session_id, &auth_user.id, &token, &expires_at, &now).await?;

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
    
    // Set secure httpOnly cookie
    response = response.with_headers(
        Headers::from_iter(vec![
            ("Set-Cookie".to_string(), format!(
                "auth_token={}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400",
                token
            ))
        ])
    );

    Ok(response)
}

async fn logout(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    if let Some(token) = extract_token(&req) {
        let db = ctx.env.d1("DB")?;
        // Revoke the session in the database
        let _ = db.prepare("UPDATE sessions SET is_active = 0 WHERE token = ?1")
            .bind(&[JsValue::from_str(&token)])?
            .run()
            .await;
    }

    let response = ApiResponse::success("Logged out successfully");
    Ok(Response::from_json(&response)?
        .with_headers(
            Headers::from_iter(vec![
                ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
            ])
        ))
}

async fn forgot_password(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let forgot_request: ForgotPasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    // Rate limiting
    if is_rate_limited(&req, "forgot_password").await {
        return Response::error("Too many password reset requests. Please try again later", 429);
    }

    let db = ctx.env.d1("DB")?;
    
    // Check if user exists (but don't reveal this information)
    if let Ok(Some(_)) = get_user_by_email(&db, &forgot_request.email).await {
        // Create password reset token
        let _reset_token = create_password_reset_token(&db, &forgot_request.email).await?;
        // Send reset email (mock)
    }

    // Always return success to prevent email enumeration
    let response = ApiResponse::success("If an account with that email exists, a password reset link has been sent");
    Response::from_json(&response)
}

async fn reset_password(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let reset_request: ResetPasswordRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    if !is_strong_password(&reset_request.new_password) {
        return Response::error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", 400);
    }

    let db = ctx.env.d1("DB")?;

    // Validate reset token
    if let Ok(Some(reset_record)) = get_password_reset_by_token(&db, &reset_request.token).await {
        // Check if token is expired
        if let Ok(expires_at) = chrono::DateTime::parse_from_rfc3339(&reset_record.expires_at) {
            if expires_at < Utc::now() {
                return Response::error("Reset token has expired", 400);
            }

            // Hash new password
            let password_hash = match hash(&reset_request.new_password, DEFAULT_COST) {
                Ok(hash) => hash,
                Err(_) => return Response::error("Failed to process password", 500),
            };

            // Update user password
            let _ = db.prepare("UPDATE users SET password_hash = ?1, updated_at = ?2 WHERE id = ?3")
                .bind(&[
                    JsValue::from_str(&password_hash),
                    JsValue::from_str(&Utc::now().to_rfc3339()),
                    JsValue::from_str(&reset_record.user_id),
                ])?
                .run()
                .await;

            // Mark reset token as used
            let _ = db.prepare("UPDATE password_resets SET used_at = ?1 WHERE token = ?2")
                .bind(&[
                    JsValue::from_str(&Utc::now().to_rfc3339()),
                    JsValue::from_str(&reset_request.token),
                ])?
                .run()
                .await;

            let response = ApiResponse::success("Password reset successfully");
            return Response::from_json(&response);
        }
    }

    Response::error("Invalid or expired reset token", 400)
}

async fn change_password(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
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

    let db = ctx.env.d1("DB")?;

    // Get current user
    if let Ok(Some(user)) = get_user_by_id(&db, &user_id).await {
        // Verify current password
        if !verify(&change_request.current_password, &user.password_hash).unwrap_or(false) {
            return Response::error("Current password is incorrect", 400);
        }
        
        // Hash new password
        let password_hash = match hash(&change_request.new_password, DEFAULT_COST) {
            Ok(hash) => hash,
            Err(_) => return Response::error("Failed to process new password", 500),
        };

        // Update password
        let _ = db.prepare("UPDATE users SET password_hash = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(&[
                JsValue::from_str(&password_hash),
                JsValue::from_str(&Utc::now().to_rfc3339()),
                JsValue::from_str(&user_id),
            ])?
            .run()
            .await;
        
        let response = ApiResponse::success("Password changed successfully");
        return Response::from_json(&response);
    }

    Response::error("User not found", 404)
}

async fn verify_email(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let verify_request: VerifyEmailRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = ctx.env.d1("DB")?;

    // Find and validate verification token
    if let Ok(Some(verification)) = get_email_verification_by_token(&db, &verify_request.token).await {
        // Check if token is expired
        if let Ok(expires_at) = chrono::DateTime::parse_from_rfc3339(&verification.expires_at) {
            if expires_at < Utc::now() {
                return Response::error("Verification token has expired", 400);
            }
            
            // Mark user as verified
            let _ = db.prepare("UPDATE users SET email_verified = 1, updated_at = ?1 WHERE id = ?2")
                .bind(&[
                    JsValue::from_str(&Utc::now().to_rfc3339()),
                    JsValue::from_str(&verification.user_id),
                ])?
                .run()
                .await;
            
            // Remove the verification token (one-time use)
            let _ = db.prepare("DELETE FROM email_verifications WHERE token = ?1")
                .bind(&[JsValue::from_str(&verify_request.token)])?
                .run()
                .await;
            
            let response = ApiResponse::success("Email verified successfully");
            return Response::from_json(&response);
        }
    }

    Response::error("Invalid or expired verification token", 400)
}

async fn get_current_user(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Get user from database
    if let Ok(Some(auth_user)) = get_user_by_id(&db, &user_id).await {
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

async fn update_profile(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let update_request: UpdateProfileRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Check if email is already taken (if email update is requested)
    if let Some(ref email) = update_request.email {
        if !email.trim().is_empty() && is_valid_email(email) {
            if user_exists(&db, email).await? {
                return Response::error("Email is already taken", 409);
            }
        }
    }
    
    let mut update_parts = Vec::new();
    let mut bind_values = Vec::new();
    let mut bind_index = 1;

    if let Some(name) = update_request.name {
        if !name.trim().is_empty() {
            update_parts.push(format!("name = ?{}", bind_index));
            bind_values.push(JsValue::from_str(&name));
            bind_index += 1;
        }
    }
    
    if let Some(email) = update_request.email {
        if !email.trim().is_empty() && is_valid_email(&email) {
            update_parts.push(format!("email = ?{}", bind_index));
            update_parts.push(format!("email_verified = 0")); // Require re-verification
            bind_values.push(JsValue::from_str(&email));
            bind_index += 1;
        }
    }
    
    if !update_parts.is_empty() {
        update_parts.push(format!("updated_at = ?{}", bind_index));
        bind_values.push(JsValue::from_str(&Utc::now().to_rfc3339()));
        bind_index += 1;
        
        update_parts.push(format!("id = ?{}", bind_index));
        bind_values.push(JsValue::from_str(&user_id));
        
        let query = format!("UPDATE users SET {} WHERE {}", 
                          update_parts[..update_parts.len()-1].join(", "), 
                          update_parts.last().unwrap());
        
        let _ = db.prepare(&query)
            .bind(&bind_values)?
            .run()
            .await;
        
        let response = ApiResponse::success("Profile updated successfully");
        return Response::from_json(&response);
    }

    Response::error("No valid updates provided", 400)
}

async fn delete_account(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Delete user (cascades will handle related records)
    let _ = db.prepare("DELETE FROM users WHERE id = ?1")
        .bind(&[JsValue::from_str(&user_id)])?
        .run()
        .await;

    let response = ApiResponse::success("Account deleted successfully");
    Ok(Response::from_json(&response)?
        .with_headers(
            Headers::from_iter(vec![
                ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
            ])
        ))
}

async fn social_login(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let social_request: SocialLoginRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = ctx.env.d1("DB")?;

    // Check if user exists by email
    let user = if let Ok(Some(existing_user)) = get_user_by_email(&db, &social_request.profile.email).await {
        // User exists, update social account info
        existing_user
    } else {
        // Create new user from social profile
        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        
        let _ = db.prepare("
            INSERT INTO users (id, email, password_hash, name, avatar, created_at, updated_at, email_verified, is_active, failed_login_attempts)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1, 1, 0)
        ")
        .bind(&[
            JsValue::from_str(&user_id),
            JsValue::from_str(&social_request.profile.email),
            JsValue::from_str(""), // No password for social accounts
            JsValue::from_str(&social_request.profile.name),
            JsValue::from(social_request.profile.avatar.as_ref().map(|s| s.as_str()).unwrap_or("")),
            JsValue::from_str(&now),
            JsValue::from_str(&now),
        ])?
        .run()
        .await;

        AuthUser {
            id: user_id,
            email: social_request.profile.email.clone(),
            password_hash: String::new(),
            name: social_request.profile.name.clone(),
            avatar: social_request.profile.avatar.clone(),
            created_at: now.clone(),
            updated_at: now,
            email_verified: true,
            is_active: true,
            last_login: None,
            failed_login_attempts: 0,
            locked_until: None,
        }
    };

    let token = create_jwt_token(&user);
    let expires_at = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();

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
        token: Some(token.clone()),
        expires_at: Some(expires_at),
        error: None,
    };

    Ok(Response::from_json(&response)?
        .with_headers(
            Headers::from_iter(vec![
                ("Set-Cookie".to_string(), format!("auth_token={}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400", token))
            ])
        ))
}

async fn get_user_sessions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    let sessions = get_user_sessions_from_db(&db, &user_id).await?;
    let response = ApiResponse::success(sessions);
    Response::from_json(&response)
}

async fn revoke_all_sessions(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let user_id = match get_user_id_from_token(&req) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = ctx.env.d1("DB")?;

    // Deactivate all sessions for this user
    let _ = db.prepare("UPDATE sessions SET is_active = 0 WHERE user_id = ?1")
        .bind(&[JsValue::from_str(&user_id)])?
        .run()
        .await;

    let response = ApiResponse::success("All sessions revoked successfully");
    Ok(Response::from_json(&response)?
        .with_headers(
            Headers::from_iter(vec![
                ("Set-Cookie".to_string(), "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0".to_string())
            ])
        ))
}

// Helper functions for D1 database operations

async fn user_exists(db: &D1Database, email: &str) -> Result<bool> {
    let result = db.prepare("SELECT COUNT(*) as count FROM users WHERE email = ?1")
        .bind(&[JsValue::from_str(email)])?
        .first::<serde_json::Value>(None)
        .await?;
        
    Ok(result.is_some() && result.unwrap()["count"].as_u64().unwrap_or(0) > 0)
}

async fn get_user_by_email(db: &D1Database, email: &str) -> Result<Option<AuthUser>> {
    let result = db.prepare("SELECT * FROM users WHERE email = ?1")
        .bind(&[JsValue::from_str(email)])?
        .first::<serde_json::Value>(None)
        .await?;
        
    match result {
        Some(row) => {
            let user = AuthUser {
                id: row["id"].as_str().unwrap_or("").to_string(),
                email: row["email"].as_str().unwrap_or("").to_string(),
                password_hash: row["password_hash"].as_str().unwrap_or("").to_string(),
                name: row["name"].as_str().unwrap_or("").to_string(),
                avatar: row["avatar"].as_str().map(|s| s.to_string()),
                created_at: row["created_at"].as_str().unwrap_or("").to_string(),
                updated_at: row["updated_at"].as_str().unwrap_or("").to_string(),
                email_verified: row["email_verified"].as_i64().unwrap_or(0) == 1,
                is_active: row["is_active"].as_i64().unwrap_or(0) == 1,
                last_login: row["last_login"].as_str().map(|s| s.to_string()),
                failed_login_attempts: row["failed_login_attempts"].as_u64().unwrap_or(0) as u32,
                locked_until: row["locked_until"].as_str().map(|s| s.to_string()),
            };
            Ok(Some(user))
        }
        None => Ok(None),
    }
}

async fn get_user_by_id(db: &D1Database, user_id: &str) -> Result<Option<AuthUser>> {
    let result = db.prepare("SELECT * FROM users WHERE id = ?1")
        .bind(&[JsValue::from_str(user_id)])?
        .first::<serde_json::Value>(None)
        .await?;
        
    match result {
        Some(row) => {
            let user = AuthUser {
                id: row["id"].as_str().unwrap_or("").to_string(),
                email: row["email"].as_str().unwrap_or("").to_string(),
                password_hash: row["password_hash"].as_str().unwrap_or("").to_string(),
                name: row["name"].as_str().unwrap_or("").to_string(),
                avatar: row["avatar"].as_str().map(|s| s.to_string()),
                created_at: row["created_at"].as_str().unwrap_or("").to_string(),
                updated_at: row["updated_at"].as_str().unwrap_or("").to_string(),
                email_verified: row["email_verified"].as_i64().unwrap_or(0) == 1,
                is_active: row["is_active"].as_i64().unwrap_or(0) == 1,
                last_login: row["last_login"].as_str().map(|s| s.to_string()),
                failed_login_attempts: row["failed_login_attempts"].as_u64().unwrap_or(0) as u32,
                locked_until: row["locked_until"].as_str().map(|s| s.to_string()),
            };
            Ok(Some(user))
        }
        None => Ok(None),
    }
}

async fn increment_failed_login_attempts(db: &D1Database, user_id: &str) -> Result<()> {
    // Get current failed attempts
    let current_attempts = db.prepare("SELECT failed_login_attempts FROM users WHERE id = ?1")
        .bind(&[JsValue::from_str(user_id)])?
        .first::<serde_json::Value>(None)
        .await?;
    
    if let Some(row) = current_attempts {
        let attempts = row["failed_login_attempts"].as_u64().unwrap_or(0) + 1;
        
        if attempts >= 5 {
            // Lock account for 15 minutes
            let lock_until = (Utc::now() + chrono::Duration::minutes(15)).to_rfc3339();
            let _ = db.prepare("UPDATE users SET failed_login_attempts = ?1, locked_until = ?2 WHERE id = ?3")
                .bind(&[
                    JsValue::from_f64(attempts as f64),
                    JsValue::from_str(&lock_until),
                    JsValue::from_str(user_id),
                ])?
                .run()
                .await;
        } else {
            let _ = db.prepare("UPDATE users SET failed_login_attempts = ?1 WHERE id = ?2")
                .bind(&[
                    JsValue::from_f64(attempts as f64),
                    JsValue::from_str(user_id),
                ])?
                .run()
                .await;
        }
    }
    
    Ok(())
}

async fn reset_failed_login_attempts(db: &D1Database, user_id: &str) -> Result<()> {
    let _ = db.prepare("UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = ?1 WHERE id = ?2")
        .bind(&[
            JsValue::from_str(&Utc::now().to_rfc3339()),
            JsValue::from_str(user_id),
        ])?
        .run()
        .await;
    Ok(())
}

async fn create_session(db: &D1Database, session_id: &str, user_id: &str, token: &str, expires_at: &str, created_at: &str) -> Result<()> {
    let _ = db.prepare("
        INSERT INTO sessions (id, user_id, token, expires_at, created_at, last_accessed, is_active)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1)
    ")
    .bind(&[
        JsValue::from_str(session_id),
        JsValue::from_str(user_id),
        JsValue::from_str(token),
        JsValue::from_str(expires_at),
        JsValue::from_str(created_at),
        JsValue::from_str(created_at),
    ])?
    .run()
    .await;
    Ok(())
}

async fn create_email_verification_token(db: &D1Database, user_id: &str, email: &str) -> Result<String> {
    let token = Uuid::new_v4().to_string();
    let verification_id = Uuid::new_v4().to_string();
    let expires_at = (Utc::now() + chrono::Duration::hours(24)).to_rfc3339();
    let created_at = Utc::now().to_rfc3339();
    
    let _ = db.prepare("
        INSERT INTO email_verifications (id, user_id, token, email, expires_at, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ")
    .bind(&[
        JsValue::from_str(&verification_id),
        JsValue::from_str(user_id),
        JsValue::from_str(&token),
        JsValue::from_str(email),
        JsValue::from_str(&expires_at),
        JsValue::from_str(&created_at),
    ])?
    .run()
    .await;
    
    Ok(token)
}

async fn get_email_verification_by_token(db: &D1Database, token: &str) -> Result<Option<EmailVerification>> {
    let result = db.prepare("SELECT * FROM email_verifications WHERE token = ?1")
        .bind(&[JsValue::from_str(token)])?
        .first::<serde_json::Value>(None)
        .await?;
        
    match result {
        Some(row) => {
            let verification = EmailVerification {
                id: row["id"].as_str().unwrap_or("").to_string(),
                user_id: row["user_id"].as_str().unwrap_or("").to_string(),
                token: row["token"].as_str().unwrap_or("").to_string(),
                email: row["email"].as_str().unwrap_or("").to_string(),
                expires_at: row["expires_at"].as_str().unwrap_or("").to_string(),
                created_at: row["created_at"].as_str().unwrap_or("").to_string(),
            };
            Ok(Some(verification))
        }
        None => Ok(None),
    }
}

async fn create_password_reset_token(db: &D1Database, email: &str) -> Result<String> {
    // First find the user by email
    if let Some(user) = get_user_by_email(db, email).await? {
        let token = Uuid::new_v4().to_string();
        let reset_id = Uuid::new_v4().to_string();
        let expires_at = (Utc::now() + chrono::Duration::hours(1)).to_rfc3339(); // 1 hour expiry
        let created_at = Utc::now().to_rfc3339();
        
        let _ = db.prepare("
            INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5)
        ")
        .bind(&[
            JsValue::from_str(&reset_id),
            JsValue::from_str(&user.id),
            JsValue::from_str(&token),
            JsValue::from_str(&expires_at),
            JsValue::from_str(&created_at),
        ])?
        .run()
        .await;
        
        Ok(token)
    } else {
        // Return a dummy token to prevent email enumeration
        Ok(Uuid::new_v4().to_string())
    }
}

async fn get_password_reset_by_token(db: &D1Database, token: &str) -> Result<Option<PasswordReset>> {
    let result = db.prepare("SELECT * FROM password_resets WHERE token = ?1 AND used_at IS NULL")
        .bind(&[JsValue::from_str(token)])?
        .first::<serde_json::Value>(None)
        .await?;
        
    match result {
        Some(row) => {
            let reset = PasswordReset {
                id: row["id"].as_str().unwrap_or("").to_string(),
                user_id: row["user_id"].as_str().unwrap_or("").to_string(),
                token: row["token"].as_str().unwrap_or("").to_string(),
                expires_at: row["expires_at"].as_str().unwrap_or("").to_string(),
                created_at: row["created_at"].as_str().unwrap_or("").to_string(),
                used_at: row["used_at"].as_str().map(|s| s.to_string()),
            };
            Ok(Some(reset))
        }
        None => Ok(None),
    }
}

async fn get_user_sessions_from_db(db: &D1Database, user_id: &str) -> Result<Vec<Session>> {
    let result = db.prepare("SELECT * FROM sessions WHERE user_id = ?1 AND is_active = 1 ORDER BY created_at DESC")
        .bind(&[JsValue::from_str(user_id)])?
        .all()
        .await?;
        
    let mut sessions = Vec::new();
    for row in result.results()? {
        let session = Session {
            id: row.get("id").unwrap_or("".into()),
            user_id: row.get("user_id").unwrap_or("".into()),
            token: row.get("token").unwrap_or("".into()),
            expires_at: row.get("expires_at").unwrap_or("".into()),
            created_at: row.get("created_at").unwrap_or("".into()),
            last_accessed: row.get("last_accessed").unwrap_or("".into()),
            user_agent: row.get("user_agent"),
            ip_address: row.get("ip_address"),
            is_active: row.get("is_active").unwrap_or("0".into()) == "1",
        };
        sessions.push(session);
    }
    Ok(sessions)
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

async fn is_rate_limited(_req: &Request, _action: &str) -> bool {
    // Mock rate limiting - in production, implement proper rate limiting
    false
}

fn get_jwt_secret() -> String {
    // TODO: Use environment variable for JWT secret in production
    "your-256-bit-secret-key-change-this-in-production".to_string()
}

fn create_jwt_token(user: &AuthUser) -> String {
    let secret = get_jwt_secret();
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
    
    let secret = get_jwt_secret();
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::default();
    
    match decode::<Claims>(&token, &decoding_key, &validation) {
        Ok(token_data) => Some(token_data.claims.sub),
        Err(_) => None, // Invalid or expired token
    }
}