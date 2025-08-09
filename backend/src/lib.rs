use worker::*;

mod models;
mod handlers;

use handlers::*;

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let router = Router::new();
    
    router
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
        .get("/", |_, _| Response::ok("Nivaro API - Club Management Platform"))
        .run(req, env)
        .await
}