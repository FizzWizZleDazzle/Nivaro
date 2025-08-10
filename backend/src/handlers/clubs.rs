use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;

pub async fn handle_clubs(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    
    match method {
        Method::Get => {
            // Get all clubs or specific club
            if let Some(club_id) = ctx.param("id") {
                get_club(club_id).await
            } else {
                get_clubs().await
            }
        },
        Method::Post => {
            // Create new club
            create_club(req).await
        },
        _ => Response::error("Method not allowed", 405)
    }
}

async fn get_clubs() -> Result<Response> {
    // Mock data - in real app this would query a database
    let clubs = vec![
        Club {
            id: "club-1".to_string(),
            name: "Tech Innovators".to_string(),
            description: Some("A community for technology enthusiasts and innovators".to_string()),
            avatar: None,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-15T00:00:00Z".to_string(),
            owner_id: "user-1".to_string(),
        }
    ];
    
    let response = ApiResponse {
        success: true,
        data: Some(clubs),
        error: None,
    };
    
    Response::from_json(&response)
}

async fn get_club(club_id: &str) -> Result<Response> {
    // Mock single club lookup
    if club_id == "club-1" {
        let club = Club {
            id: "club-1".to_string(),
            name: "Tech Innovators".to_string(),
            description: Some("A community for technology enthusiasts and innovators".to_string()),
            avatar: None,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-15T00:00:00Z".to_string(),
            owner_id: "user-1".to_string(),
        };
        
        let response = ApiResponse {
            success: true,
            data: Some(club),
            error: None,
        };
        
        Response::from_json(&response)
    } else {
        let response: ApiResponse<Club> = ApiResponse {
            success: false,
            data: None,
            error: Some("Club not found".to_string()),
        };
        Ok(Response::from_json(&response)?.with_status(404))
    }
}

async fn create_club(mut req: Request) -> Result<Response> {
    let create_request: CreateClubRequest = req.json().await?;
    
    // Mock club creation - in real app this would save to database
    let club = Club {
        id: Uuid::new_v4().to_string(),
        name: create_request.name,
        description: Some(create_request.description),
        avatar: None,
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
        owner_id: "user-1".to_string(), // Mock user ID
    };
    
    let response = ApiResponse {
        success: true,
        data: Some(club),
        error: None,
    };
    
    Ok(Response::from_json(&response)?.with_status(201))
}