use worker::*;

mod forum;
mod handlers;
mod meetings;
pub mod models;

use handlers::*;
use meetings::*;

fn get_allowed_origin(origin: Option<&str>) -> String {
    match origin {
        Some("http://localhost:3000") => "http://localhost:3000".to_string(),
        Some("http://localhost:3001") => "http://localhost:3001".to_string(),
        Some("http://192.168.1.245:3000") => "http://192.168.1.245:3000".to_string(),
        Some("http://192.168.1.245:3001") => "http://192.168.1.245:3001".to_string(),
        Some(other) if other.starts_with("http://localhost:") || other.starts_with("http://192.168.") => {
            other.to_string() // Allow any localhost or local network origin
        },
        _ => "http://localhost:3000".to_string(), // Default fallback
    }
}

fn handle_cors_preflight_with_origin(origin: Option<&str>) -> Result<Response> {
    let mut headers = worker::Headers::new();
    let allowed_origin = get_allowed_origin(origin);
    headers.set("Access-Control-Allow-Origin", &allowed_origin)?;
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")?;
    headers.set("Access-Control-Allow-Credentials", "true")?;
    headers.set("Access-Control-Max-Age", "86400")?;
    
    Ok(Response::empty()?
        .with_status(200)
        .with_headers(headers))
}

fn add_cors_headers_with_origin(mut response: Response, origin: Option<&str>) -> Result<Response> {
    let headers = response.headers_mut();
    let allowed_origin = get_allowed_origin(origin);
    headers.set("Access-Control-Allow-Origin", &allowed_origin)?;
    headers.set("Access-Control-Allow-Credentials", "true")?;
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")?;
    Ok(response)
}

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    // Extract origin header before router consumes the request
    let origin = req.headers().get("Origin").ok().flatten();
    
    // Handle preflight CORS requests
    if req.method() == Method::Options {
        return handle_cors_preflight_with_origin(origin.as_deref());
    }

    let router = Router::new();

    router
        .get("/", |_, _| {
            Response::ok("Nivaro API - Club Management Platform")
        })
        // CSRF token endpoint
        .get_async("/api/csrf-token", |req, ctx| async move {
            get_csrf_token(req, ctx).await
        })
        // Auth endpoints
        .post_async("/api/auth/signup", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/login", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/logout", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/forgot-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/reset-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/change-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/verify-email", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .get_async("/api/auth/me", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .put_async("/api/auth/profile", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .delete_async("/api/auth/account", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/api/auth/social", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .get_async("/api/auth/sessions", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .delete_async("/api/auth/sessions", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        // Club endpoints
        .get_async("/api/clubs", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .get_async("/api/clubs/:id", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .post_async("/api/clubs", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .get_async("/api/clubs/:club_id/members", |req, ctx| async move {
            handle_members(req, ctx).await
        })
        .post_async("/api/members/join", |req, ctx| async move {
            handle_members(req, ctx).await
        })
        // Event endpoints
        .get_async("/api/clubs/:club_id/events", |req, ctx| async move {
            handle_events(req, ctx).await
        })
        .post_async("/api/events", |req, ctx| async move {
            handle_events(req, ctx).await
        })
        // Announcement endpoints
        .get_async("/api/clubs/:club_id/announcements", |req, ctx| async move {
            handle_announcements(req, ctx).await
        })
        .post_async("/api/announcements", |req, ctx| async move {
            handle_announcements(req, ctx).await
        })
        // Project endpoints
        .get_async("/api/clubs/:club_id/projects", |req, ctx| async move {
            handle_projects(req, ctx).await
        })
        .post_async("/api/projects", |req, ctx| async move {
            handle_projects(req, ctx).await
        })
        // Meeting endpoints
        .get_async("/api/meetings", |req, ctx| async move {
            // Require authentication for viewing meetings
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            let meetings = get_meetings().await;
            Response::from_json(&meetings)
        })
        .get_async("/api/meetings/:id", |req, ctx| async move {
            // Require authentication for viewing meeting details
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            if let Some(id) = ctx.param("id") {
                if let Some(meeting) = get_meeting(id).await {
                    return Response::from_json(&meeting);
                }
            }
            Response::error("Meeting not found", 404)
        })
        .post_async("/api/meetings", |mut req, ctx| async move {
            // CSRF protection for meeting creation
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            match req.json::<CreateMeetingRequest>().await {
                Ok(meeting_data) => {
                    let meeting = create_meeting(meeting_data).await;
                    Response::from_json(&meeting)
                }
                Err(_) => Response::error("Invalid request body", 400),
            }
        })
        .put_async("/api/meetings/:id", |mut req, ctx| async move {
            // CSRF protection for meeting updates
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            if let Some(id) = ctx.param("id") {
                match req.json::<UpdateMeetingRequest>().await {
                    Ok(updates) => {
                        if let Some(meeting) = update_meeting(id, updates).await {
                            return Response::from_json(&meeting);
                        }
                    }
                    Err(_) => return Response::error("Invalid request body", 400),
                }
            }
            Response::error("Meeting not found", 404)
        })
        .delete_async("/api/meetings/:id", |req, ctx| async move {
            // CSRF protection for meeting deletion
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            if let Some(id) = ctx.param("id") {
                if delete_meeting(id).await {
                    return Response::ok("Meeting deleted");
                }
            }
            Response::error("Meeting not found", 404)
        })
        // RSVP endpoints
        .get_async("/api/meetings/:id/rsvps", |_, ctx| async move {
            if let Some(id) = ctx.param("id") {
                let rsvps = get_rsvps(id).await;
                return Response::from_json(&rsvps);
            }
            Response::error("Meeting not found", 404)
        })
        .post_async("/api/meetings/:id/rsvps", |mut req, ctx| async move {
            // CSRF protection for RSVP creation
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            if let Some(id) = ctx.param("id") {
                match req.json::<CreateRSVPRequest>().await {
                    Ok(rsvp_data) => {
                        let rsvp = create_rsvp(id, rsvp_data).await;
                        return Response::from_json(&rsvp);
                    }
                    Err(_) => return Response::error("Invalid request body", 400),
                }
            }
            Response::error("Meeting not found", 404)
        })
        // Forum endpoints
        .get_async("/api/forum/questions", |req, ctx| async move {
            // Require authentication for viewing forum questions
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            forum::get_questions().await
        })
        .post_async("/api/forum/questions", |req, ctx| async move {
            // CSRF protection for question creation
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            forum::create_question(req).await
        })
        .put_async("/api/forum/questions/:id/claim", |req, ctx| async move {
            // CSRF protection for question claiming
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            if let Some(id) = ctx.param("id") {
                forum::claim_question(id, req).await
            } else {
                Response::error("Invalid question ID", 400)
            }
        })
        .put_async("/api/forum/questions/:id/resolve", |req, ctx| async move {
            // CSRF protection for question resolution
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            if let Some(id) = ctx.param("id") {
                forum::resolve_question(id).await
            } else {
                Response::error("Invalid question ID", 400)
            }
        })
        .get_async("/api/forum/tags", |req, ctx| async move {
            // Require authentication for viewing forum tags
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            forum::get_tags().await
        })
        .run(req, env)
        .await
        .and_then(|response| {
            add_cors_headers_with_origin(response, origin.as_deref())
        })
}
