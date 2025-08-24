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
    let headers = worker::Headers::new();
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
        .get_async("/csrf-token", |req, ctx| async move {
            get_csrf_token(req, ctx).await
        })
        // Auth endpoints
        .post_async("/auth/signup", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/login", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/logout", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/forgot-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/reset-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/change-password", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/verify-email", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .get_async("/auth/me", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .put_async("/auth/profile", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .delete_async("/auth/account", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .post_async("/auth/social", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .get_async("/auth/sessions", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        .delete_async("/auth/sessions", |req, ctx| async move {
            handle_auth(req, ctx).await
        })
        // Club endpoints
        .get_async("/clubs", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .get_async("/clubs/:id", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .post_async("/clubs", |req, ctx| async move {
            handle_clubs(req, ctx).await
        })
        .get_async("/clubs/:club_id/members", |req, ctx| async move {
            handle_members(req, ctx).await
        })
        .post_async("/members/join", |req, ctx| async move {
            handle_members(req, ctx).await
        })
        // Project endpoints
        .get_async("/clubs/:club_id/projects", |req, ctx| async move {
            handle_projects(req, ctx).await
        })
        .post_async("/projects", |req, ctx| async move {
            handle_projects(req, ctx).await
        })
        // General project endpoints (not club-specific)
        .get_async("/projects", |req, ctx| async move {
            get_all_projects(req, ctx).await
        })
        .get_async("/projects/user", |req, ctx| async move {
            get_user_projects(req, ctx).await
        })
        .get_async("/projects/starred", |req, ctx| async move {
            get_starred_projects(req, ctx).await
        })
        .get_async("/projects/activities", |req, ctx| async move {
            get_project_activities(req, ctx).await
        })
        .get_async("/projects/stats", |req, ctx| async move {
            get_project_stats(req, ctx).await
        })
        .post_async("/projects/star", |req, ctx| async move {
            toggle_project_star(req, ctx).await
        })
        .post_async("/projects/join", |req, ctx| async move {
            join_project(req, ctx).await
        })
        // Curriculum endpoints
        .get_async("/clubs/:club_id/curriculum", |req, ctx| async move {
            handle_curriculum(req, ctx).await
        })
        .post_async("/clubs/:club_id/curriculum", |req, ctx| async move {
            handle_curriculum(req, ctx).await
        })
        .put_async("/clubs/:club_id/curriculum/:curriculum_id", |req, ctx| async move {
            handle_curriculum(req, ctx).await
        })
        .delete_async("/curriculum/:id", |req, ctx| async move {
            handle_curriculum(req, ctx).await
        })
        .post_async("/curriculum/:id/publish", |req, ctx| async move {
            handle_curriculum(req, ctx).await
        })
        // Module endpoints
        .get_async("/curriculum/:id/modules", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .post_async("/curriculum/:id/modules", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .put_async("/modules/:id", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .delete_async("/modules/:id", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .put_async("/modules/:id/reorder", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        // Lesson endpoints
        .get_async("/modules/:id/lessons", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .post_async("/modules/:id/lessons", |req, ctx| async move {
            handle_modules(req, ctx).await
        })
        .put_async("/lessons/:id", |req, ctx| async move {
            handle_lessons(req, ctx).await
        })
        .delete_async("/lessons/:id", |req, ctx| async move {
            handle_lessons(req, ctx).await
        })
        .put_async("/lessons/:id/reorder", |req, ctx| async move {
            handle_lessons(req, ctx).await
        })
        .post_async("/lessons/:id/complete", |req, ctx| async move {
            handle_lessons(req, ctx).await
        })
        .post_async("/lessons/:id/progress", |req, ctx| async move {
            handle_lessons(req, ctx).await
        })
        // Assignment endpoints
        .get_async("/clubs/:club_id/assignments", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .post_async("/clubs/:club_id/assignments", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .get_async("/assignments/:id", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .put_async("/assignments/:id", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .delete_async("/assignments/:id", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        // Submission endpoints
        .get_async("/assignments/:id/submissions", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .get_async("/assignments/:id/submission", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .post_async("/assignments/:id/submit", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .get_async("/submissions/:id", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .put_async("/submissions/:id", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        .put_async("/submissions/:id/grade", |req, ctx| async move {
            handle_assignments(req, ctx).await
        })
        // Meeting endpoints
        .get_async("/meetings", |req, ctx| async move {
            // Require authentication for viewing meetings
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            let meetings = get_meetings().await;
            Response::from_json(&meetings)
        })
        .get_async("/meetings/:id", |req, ctx| async move {
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
        .post_async("/meetings", |mut req, ctx| async move {
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
        .put_async("/meetings/:id", |mut req, ctx| async move {
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
        .delete_async("/meetings/:id", |req, ctx| async move {
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
        .get_async("/meetings/:id/rsvps", |_, ctx| async move {
            if let Some(id) = ctx.param("id") {
                let rsvps = get_rsvps(id).await;
                return Response::from_json(&rsvps);
            }
            Response::error("Meeting not found", 404)
        })
        .post_async("/meetings/:id/rsvps", |mut req, ctx| async move {
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
        .get_async("/forum/questions", |req, ctx| async move {
            // Require authentication for viewing forum questions
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            forum::get_questions().await
        })
        .post_async("/forum/questions", |req, ctx| async move {
            // CSRF protection for question creation
            if !crate::handlers::auth::verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
                return Response::error("CSRF token validation failed", 403);
            }
            
            forum::create_question(req).await
        })
        .put_async("/forum/questions/:id/claim", |req, ctx| async move {
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
        .put_async("/forum/questions/:id/resolve", |req, ctx| async move {
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
        .get_async("/forum/tags", |req, ctx| async move {
            // Require authentication for viewing forum tags
            if crate::handlers::auth::get_user_id_from_token(&req, &ctx).is_none() {
                return Response::error("Unauthorized", 401);
            }
            
            forum::get_tags().await
        })
        // Peer review endpoints
        .get_async("/assignments/:id/peer-reviews/available", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        .get_async("/assignments/:id/peer-reviews", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        .post_async("/assignments/:id/peer-reviews", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        .get_async("/peer-reviews/:id", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        .put_async("/peer-reviews/:id", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        .delete_async("/peer-reviews/:id", |req, ctx| async move {
            handle_peer_reviews(req, ctx).await
        })
        // Badge endpoints
        .get_async("/clubs/:club_id/badges", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .post_async("/clubs/:club_id/badges", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .get_async("/badges/:id", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .put_async("/badges/:id", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .delete_async("/badges/:id", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .post_async("/badges/:id/award", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        .get_async("/badges/user", |req, ctx| async move {
            handle_badges(req, ctx).await
        })
        // Certificate endpoints
        .get_async("/clubs/:club_id/certificates", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .post_async("/clubs/:club_id/certificates", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .get_async("/certificates/:id", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .put_async("/certificates/:id", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .delete_async("/certificates/:id", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .post_async("/certificates/:id/issue", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .get_async("/certificates/:code/verify", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        .get_async("/certificates/user", |req, ctx| async move {
            handle_certificates(req, ctx).await
        })
        // Discussion endpoints
        .get_async("/clubs/:club_id/discussions", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .post_async("/clubs/:club_id/discussions", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .get_async("/discussions/:id", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .put_async("/discussions/:id", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .delete_async("/discussions/:id", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .get_async("/discussions/:id/replies", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .post_async("/discussions/:id/replies", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .post_async("/discussions/:id/vote", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .post_async("/discussions/:id/answer", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        .get_async("/discussions/search", |req, ctx| async move {
            handle_discussions(req, ctx).await
        })
        // Progress tracking endpoints
        .get_async("/clubs/:club_id/progress", |req, ctx| async move {
            handle_progress(req, ctx).await
        })
        .get_async("/curriculum/:id/progress", |req, ctx| async move {
            handle_progress(req, ctx).await
        })
        .get_async("/clubs/:club_id/leaderboard", |req, ctx| async move {
            handle_progress(req, ctx).await
        })
        .get_async("/clubs/:club_id/activity", |req, ctx| async move {
            handle_progress(req, ctx).await
        })
        // Dashboard endpoints
        .get_async("/dashboard/stats", |req, ctx| async move {
            get_dashboard_stats(req, ctx).await
        })
        // Courses/Learning endpoints
        .get_async("/courses", |req, ctx| async move {
            get_courses(req, ctx).await
        })
        .get_async("/courses/enrolled", |req, ctx| async move {
            get_enrolled_courses(req, ctx).await
        })
        .get_async("/courses/progress", |req, ctx| async move {
            get_course_progress(req, ctx).await
        })
        .get_async("/learning-paths", |req, ctx| async move {
            get_learning_paths(req, ctx).await
        })
        .get_async("/courses/saved", |req, ctx| async move {
            get_saved_courses(req, ctx).await
        })
        .post_async("/courses/enroll", |req, ctx| async move {
            enroll_in_course(req, ctx).await
        })
        .post_async("/courses/save", |req, ctx| async move {
            save_course(req, ctx).await
        })
        // Notification endpoints
        .get_async("/notifications", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .put_async("/notifications/:id/read", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .put_async("/notifications/read-all", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .delete_async("/notifications/:id", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .get_async("/notifications/preferences", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .put_async("/notifications/preferences", |req, ctx| async move {
            handle_notifications(req, ctx).await
        })
        .run(req, env)
        .await
        .and_then(|response| {
            add_cors_headers_with_origin(response, origin.as_deref())
        })
}
