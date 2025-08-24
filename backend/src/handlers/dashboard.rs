use crate::models::*;
use crate::handlers::auth::get_user_id_from_token;
use worker::*;
use chrono::{Utc, Duration};

pub async fn get_dashboard_stats(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Require authentication
    if get_user_id_from_token(&req, &ctx).is_none() {
        return Response::error("Unauthorized", 401);
    }
    
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Get total clubs count
    let clubs_stmt = db.prepare("SELECT COUNT(*) as count FROM clubs WHERE is_active = 1");
    let clubs_result = clubs_stmt.first::<serde_json::Value>(None).await;
    let total_clubs = clubs_result
        .ok()
        .and_then(|r| r)
        .and_then(|v| v["count"].as_i64())
        .unwrap_or(0) as u32;

    // Get total members count (unique users who are members of at least one club)
    let members_stmt = db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM members");
    let members_result = members_stmt.first::<serde_json::Value>(None).await;
    let total_members = members_result
        .ok()
        .and_then(|r| r)
        .and_then(|v| v["count"].as_i64())
        .unwrap_or(0) as u32;

    // Get active meetings count (scheduled or in_progress)
    let meetings_stmt = db.prepare("
        SELECT COUNT(*) as count FROM meetings 
        WHERE status IN ('scheduled', 'in_progress')
    ");
    let meetings_result = meetings_stmt.first::<serde_json::Value>(None).await;
    let active_meetings = meetings_result
        .ok()
        .and_then(|r| r)
        .and_then(|v| v["count"].as_i64())
        .unwrap_or(0) as u32;

    // Get upcoming events count (meetings scheduled for the future)
    let now = Utc::now().to_rfc3339();
    let upcoming_stmt = db.prepare("
        SELECT COUNT(*) as count FROM meetings 
        WHERE meeting_date > ?1 AND status = 'scheduled'
    ");
    let upcoming_stmt = match upcoming_stmt.bind(&vec![now.clone().into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to bind query", 500),
    };
    let upcoming_result = upcoming_stmt.first::<serde_json::Value>(None).await;
    let upcoming_events = upcoming_result
        .ok()
        .and_then(|r| r)
        .and_then(|v| v["count"].as_i64())
        .unwrap_or(0) as u32;

    // Get recent announcements (activities of type 'announcement')
    let announcements_stmt = db.prepare("
        SELECT a.id, a.title, a.created_at, c.name as club_name
        FROM activities a
        LEFT JOIN clubs c ON a.club_id = c.id
        WHERE a.activity_type = 'announcement'
        ORDER BY a.created_at DESC
        LIMIT 5
    ");
    let announcements_results = announcements_stmt.all().await
        .ok()
        .and_then(|r| r.results::<serde_json::Value>().ok())
        .unwrap_or_default();
    
    let recent_announcements: Vec<Activity> = announcements_results
        .into_iter()
        .filter_map(|row| {
            Some(Activity {
                id: row["id"].as_str()?.to_string(),
                club_id: row["club_id"].as_str().map(|s| s.to_string()),
                user_id: String::new(), // Not needed for dashboard
                activity_type: "announcement".to_string(),
                title: row["title"].as_str()?.to_string(),
                content: String::new(), // Not needed for dashboard
                data: None,
                is_pinned: false,
                created_at: row["created_at"].as_str()?.to_string(),
            })
        })
        .collect();

    // Get member activity for the last 7 days
    let seven_days_ago = (Utc::now() - Duration::days(7)).to_rfc3339();
    let activity_stmt = db.prepare("
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM activities
        WHERE created_at > ?1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
    ");
    let activity_stmt = match activity_stmt.bind(&vec![seven_days_ago.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to bind query", 500),
    };
    let activity_results = activity_stmt.all().await
        .ok()
        .and_then(|r| r.results::<serde_json::Value>().ok())
        .unwrap_or_default();
    
    let member_activity: Vec<ActivityData> = activity_results
        .into_iter()
        .filter_map(|row| {
            Some(ActivityData {
                date: row["date"].as_str()?.to_string(),
                count: row["count"].as_i64()? as u32,
            })
        })
        .collect();

    let stats = DashboardStats {
        total_clubs,
        total_members,
        active_meetings,
        upcoming_events,
        recent_announcements,
        member_activity,
    };

    let response = ApiResponse {
        success: true,
        data: Some(stats),
        error: None,
    };

    Response::from_json(&response)
}