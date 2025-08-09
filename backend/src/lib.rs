use worker::*;

mod forum;

#[event(fetch)]
async fn fetch(
    req: Request,
    _env: Env,
    _ctx: Context,
) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let url = req.url()?;
    let path = url.path();
    
    // CORS headers
    let mut headers = worker::Headers::new();
    headers.set("Access-Control-Allow-Origin", "*")?;
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "Content-Type")?;
    
    // Handle preflight requests
    if req.method() == Method::Options {
        return Ok(Response::empty()?.with_headers(headers));
    }
    
    // Route API requests
    let response = match (req.method(), path) {
        (Method::Get, "/api/forum/questions") => forum::get_questions().await,
        (Method::Post, "/api/forum/questions") => forum::create_question(req).await,
        (Method::Put, path) if path.starts_with("/api/forum/questions/") && path.ends_with("/claim") => {
            let id = path.split('/').nth(4).unwrap_or("");
            forum::claim_question(id, req).await
        },
        (Method::Put, path) if path.starts_with("/api/forum/questions/") && path.ends_with("/resolve") => {
            let id = path.split('/').nth(4).unwrap_or("");
            forum::resolve_question(id).await
        },
        (Method::Get, "/api/forum/tags") => forum::get_tags().await,
        _ => Response::error("Not Found", 404),
    };
    
    match response {
        Ok(mut resp) => {
            for (key, value) in headers.entries() {
                resp.headers_mut().set(&key, &value)?;
            }
            Ok(resp)
        },
        Err(e) => {
            let mut error_resp = Response::error(format!("Error: {}", e), 500)?;
            for (key, value) in headers.entries() {
                error_resp.headers_mut().set(&key, &value)?;
            }
            Ok(error_resp)
        }
    }
}