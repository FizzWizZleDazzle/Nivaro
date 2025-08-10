use worker::*;
use crate::models::*;
use chrono::Utc;
use uuid::Uuid;

pub async fn handle_members(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let method = req.method();
    
    match method {
        Method::Get => {
            // Get members for a club
            if let Some(club_id) = ctx.param("club_id") {
                get_club_members(club_id).await
            } else {
                Response::error("Club ID required", 400)
            }
        },
        Method::Post => {
            // Join club with invite code
            join_club(req).await
        },
        _ => Response::error("Method not allowed", 405)
    }
}

async fn get_club_members(club_id: &str) -> Result<Response> {
    // Mock data - in real app this would query a database
    if club_id == "club-1" {
        let members = vec![
            Member {
                id: "member-1".to_string(),
                user_id: "user-1".to_string(),
                club_id: club_id.to_string(),
                role: MemberRole::Admin,
                joined_at: "2024-01-01T00:00:00Z".to_string(),
                user: User {
                    id: "user-1".to_string(),
                    email: "demo@nivaro.com".to_string(),
                    name: "Demo User".to_string(),
                    avatar: None,
                    created_at: "2024-01-01T00:00:00Z".to_string(),
                    updated_at: "2024-01-01T00:00:00Z".to_string(),
                    email_verified: true,
                    is_active: true,
                },
            },
            Member {
                id: "member-2".to_string(),
                user_id: "user-2".to_string(),
                club_id: club_id.to_string(),
                role: MemberRole::Member,
                joined_at: "2024-01-10T00:00:00Z".to_string(),
                user: User {
                    id: "user-2".to_string(),
                    email: "alice@example.com".to_string(),
                    name: "Alice Johnson".to_string(),
                    avatar: None,
                    created_at: "2024-01-02T00:00:00Z".to_string(),
                    updated_at: "2024-01-02T00:00:00Z".to_string(),
                    email_verified: true,
                    is_active: true,
                },
            },
        ];
        
        let response = ApiResponse {
            success: true,
            data: Some(members),
            error: None,
        };
        
        Response::from_json(&response)
    } else {
        let response: ApiResponse<Vec<Member>> = ApiResponse {
            success: false,
            data: None,
            error: Some("Club not found".to_string()),
        };
        Ok(Response::from_json(&response)?.with_status(404))
    }
}

async fn join_club(mut req: Request) -> Result<Response> {
    let join_request: JoinClubRequest = req.json().await?;
    
    // Mock invite code validation
    if join_request.invite_code.to_uppercase() == "TECH2024" {
        let member = Member {
            id: Uuid::new_v4().to_string(),
            user_id: "user-1".to_string(), // Mock current user
            club_id: "club-1".to_string(),
            role: MemberRole::Member,
            joined_at: Utc::now().to_rfc3339(),
            user: User {
                id: "user-1".to_string(),
                email: "demo@nivaro.com".to_string(),
                name: "Demo User".to_string(),
                avatar: None,
                created_at: "2024-01-01T00:00:00Z".to_string(),
                updated_at: "2024-01-01T00:00:00Z".to_string(),
                email_verified: true,
                is_active: true,
            },
        };
        
        let response = ApiResponse {
            success: true,
            data: Some(member),
            error: None,
        };
        
        Ok(Response::from_json(&response)?.with_status(201))
    } else {
        let response: ApiResponse<Member> = ApiResponse {
            success: false,
            data: None,
            error: Some("Invalid or expired invite code".to_string()),
        };
        Ok(Response::from_json(&response)?.with_status(400))
    }
}