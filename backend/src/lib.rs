use worker::*;

mod models;
mod handlers;
mod meetings;

use handlers::*;
use meetings::*;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let router = Router::new();
    
    router
        .get("/", |_, _| Response::ok("Nivaro API - Club Management Platform"))
        
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
        
        // Meeting endpoints
        .get_async("/api/meetings", |_, _| async move {
            let meetings = get_meetings().await;
            Response::from_json(&meetings)
        })
        
        .get_async("/api/meetings/:id", |_, ctx| async move {
            if let Some(id) = ctx.param("id") {
                if let Some(meeting) = get_meeting(id).await {
                    return Response::from_json(&meeting);
                }
            }
            Response::error("Meeting not found", 404)
        })
        
        .post_async("/api/meetings", |mut req, _| async move {
            match req.json::<CreateMeetingRequest>().await {
                Ok(meeting_data) => {
                    let meeting = create_meeting(meeting_data).await;
                    Response::from_json(&meeting)
                }
                Err(_) => Response::error("Invalid request body", 400),
            }
        })
        
        .put_async("/api/meetings/:id", |mut req, ctx| async move {
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
        
        .delete_async("/api/meetings/:id", |_, ctx| async move {
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
        
        .run(req, env)
        .await
}