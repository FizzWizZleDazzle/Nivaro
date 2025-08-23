use worker::*;
use serde_json::json;
use crate::handlers::auth::get_user_id_from_token;

pub async fn handle_progress(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let _method = req.method();
    let url = req.url()?;
    let path = url.path();
    
    // Get overall progress for a user in a club
    if path.contains("/api/clubs/") && path.contains("/progress") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                return get_club_progress(req, ctx, club_id.to_string()).await;
            }
        }
    }
    
    // Get curriculum progress
    if path.contains("/api/curriculum/") && path.contains("/progress") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(curr_id_pos) = segments.iter().position(|&x| x == "curriculum") {
            if let Some(curriculum_id) = segments.get(curr_id_pos + 1) {
                return get_curriculum_progress(req, ctx, curriculum_id.to_string()).await;
            }
        }
    }
    
    // Get leaderboard
    if path.contains("/api/clubs/") && path.contains("/leaderboard") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                return get_club_leaderboard(ctx, club_id.to_string()).await;
            }
        }
    }
    
    // Get activity feed
    if path.contains("/api/clubs/") && path.contains("/activity") {
        let segments: Vec<&str> = path.split('/').collect();
        if let Some(club_id_pos) = segments.iter().position(|&x| x == "clubs") {
            if let Some(club_id) = segments.get(club_id_pos + 1) {
                return get_club_activity(ctx, club_id.to_string()).await;
            }
        }
    }
    
    Response::error("Invalid progress endpoint", 400)
}

async fn get_club_progress(req: Request, ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Get overall stats
    let stats_stmt = db.prepare("
        SELECT 
            (SELECT COUNT(*) FROM lesson_progress lp
             JOIN lessons l ON lp.lesson_id = l.id
             JOIN modules m ON l.module_id = m.id
             JOIN curricula c ON m.curriculum_id = c.id
             WHERE lp.student_id = ?1 AND c.club_id = ?2) as lessons_completed,
            (SELECT COUNT(*) FROM submissions s
             JOIN assignments a ON s.assignment_id = a.id
             WHERE s.student_id = ?1 AND a.club_id = ?2) as assignments_submitted,
            (SELECT COUNT(*) FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?1 AND b.club_id = ?2) as badges_earned,
            (SELECT COUNT(*) FROM user_certificates uc
             JOIN certificates c ON uc.certificate_id = c.id
             WHERE uc.user_id = ?1 AND c.club_id = ?2) as certificates_earned,
            (SELECT SUM(b.points) FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?1 AND b.club_id = ?2) as total_points
    ");
    
    let stats_stmt = stats_stmt.bind(&vec![
        user_id.clone().into(),
        club_id.clone().into(),
    ])?;
    
    let stats = stats_stmt.first::<serde_json::Value>(None).await?.unwrap_or(json!({}));
    
    // Get recent achievements
    let achievements_stmt = db.prepare("
        SELECT 'badge' as type, b.name, b.icon, ub.earned_at as date
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ?1 AND b.club_id = ?2
        UNION ALL
        SELECT 'certificate' as type, c.name, '' as icon, uc.issued_at as date
        FROM user_certificates uc
        JOIN certificates c ON uc.certificate_id = c.id
        WHERE uc.user_id = ?1 AND c.club_id = ?2
        ORDER BY date DESC
        LIMIT 10
    ");
    
    let achievements_stmt = achievements_stmt.bind(&vec![
        user_id.clone().into(),
        club_id.clone().into(),
    ])?;
    
    let achievements_results = achievements_stmt.all().await?;
    let achievements = achievements_results.results::<serde_json::Value>()?;
    
    // Get current streaks
    let streak_stmt = db.prepare("
        SELECT 
            COUNT(DISTINCT DATE(lp.completed_at)) as learning_streak
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        JOIN curricula c ON m.curriculum_id = c.id
        WHERE lp.student_id = ?1 
        AND c.club_id = ?2
        AND lp.completed_at >= date('now', '-7 days')
    ");
    
    let streak_stmt = streak_stmt.bind(&vec![
        user_id.into(),
        club_id.into(),
    ])?;
    
    let streak = streak_stmt.first::<serde_json::Value>(None).await?.unwrap_or(json!({"learning_streak": 0}));
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "stats": stats,
            "recent_achievements": achievements,
            "streak": streak["learning_streak"]
        }
    }))
}

async fn get_curriculum_progress(req: Request, ctx: RouteContext<()>, curriculum_id: String) -> Result<Response> {
    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };
    
    let db = ctx.env.d1("DB")?;
    
    // Get modules with lesson progress
    let modules_stmt = db.prepare("
        SELECT 
            m.id,
            m.title,
            m.order_index,
            COUNT(l.id) as total_lessons,
            COUNT(lp.id) as completed_lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?1
        WHERE m.curriculum_id = ?2
        GROUP BY m.id, m.title, m.order_index
        ORDER BY m.order_index
    ");
    
    let modules_stmt = modules_stmt.bind(&vec![
        user_id.clone().into(),
        curriculum_id.clone().into(),
    ])?;
    
    let modules_results = modules_stmt.all().await?;
    let modules = modules_results.results::<serde_json::Value>()?;
    
    // Calculate overall progress
    let total_lessons: i64 = modules.iter()
        .map(|m| m["total_lessons"].as_i64().unwrap_or(0))
        .sum();
    
    let completed_lessons: i64 = modules.iter()
        .map(|m| m["completed_lessons"].as_i64().unwrap_or(0))
        .sum();
    
    let progress_percentage = if total_lessons > 0 {
        ((completed_lessons as f64 / total_lessons as f64) * 100.0) as i32
    } else {
        0
    };
    
    // Get next lesson to complete
    let next_lesson_stmt = db.prepare("
        SELECT l.id, l.title, m.title as module_title
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.curriculum_id = ?1
        AND l.id NOT IN (
            SELECT lesson_id FROM lesson_progress 
            WHERE student_id = ?2
        )
        ORDER BY m.order_index, l.order_index
        LIMIT 1
    ");
    
    let next_lesson_stmt = next_lesson_stmt.bind(&vec![
        curriculum_id.into(),
        user_id.into(),
    ])?;
    
    let next_lesson = next_lesson_stmt.first::<serde_json::Value>(None).await?;
    
    Response::from_json(&json!({
        "success": true,
        "data": {
            "modules": modules,
            "overall_progress": {
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "percentage": progress_percentage
            },
            "next_lesson": next_lesson
        }
    }))
}

async fn get_club_leaderboard(ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    // Get top performers by points
    let leaderboard_stmt = db.prepare("
        SELECT 
            u.id,
            u.name,
            u.avatar_url,
            COALESCE(SUM(b.points), 0) as total_points,
            COUNT(DISTINCT ub.badge_id) as badges_count,
            COUNT(DISTINCT uc.certificate_id) as certificates_count,
            (SELECT COUNT(*) FROM lesson_progress lp
             JOIN lessons l ON lp.lesson_id = l.id
             JOIN modules m ON l.module_id = m.id
             JOIN curricula c ON m.curriculum_id = c.id
             WHERE lp.student_id = u.id AND c.club_id = ?1) as lessons_completed
        FROM members mb
        JOIN users u ON mb.user_id = u.id
        LEFT JOIN user_badges ub ON u.id = ub.user_id
        LEFT JOIN badges b ON ub.badge_id = b.id AND b.club_id = ?1
        LEFT JOIN user_certificates uc ON u.id = uc.user_id
        LEFT JOIN certificates c ON uc.certificate_id = c.id AND c.club_id = ?1
        WHERE mb.club_id = ?1
        GROUP BY u.id, u.name, u.avatar_url
        ORDER BY total_points DESC, lessons_completed DESC
        LIMIT 20
    ");
    
    let leaderboard_stmt = leaderboard_stmt.bind(&vec![club_id.into()])?;
    
    let results = leaderboard_stmt.all().await?;
    let leaderboard = results.results::<serde_json::Value>()?;
    
    // Add rank to each entry
    let ranked_leaderboard: Vec<serde_json::Value> = leaderboard
        .into_iter()
        .enumerate()
        .map(|(index, mut entry)| {
            entry["rank"] = json!(index + 1);
            entry
        })
        .collect();
    
    Response::from_json(&json!({
        "success": true,
        "data": ranked_leaderboard
    }))
}

async fn get_club_activity(ctx: RouteContext<()>, club_id: String) -> Result<Response> {
    let db = ctx.env.d1("DB")?;
    
    // Get recent activity feed
    let activity_stmt = db.prepare("
        SELECT * FROM (
            SELECT 'lesson_completed' as type, u.name as user_name, l.title as item_name, 
                   lp.completed_at as timestamp, u.avatar_url
            FROM lesson_progress lp
            JOIN users u ON lp.student_id = u.id
            JOIN lessons l ON lp.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            JOIN curricula c ON m.curriculum_id = c.id
            WHERE c.club_id = ?1
            
            UNION ALL
            
            SELECT 'assignment_submitted' as type, u.name as user_name, a.title as item_name,
                   s.submitted_at as timestamp, u.avatar_url
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            JOIN assignments a ON s.assignment_id = a.id
            WHERE a.club_id = ?1
            
            UNION ALL
            
            SELECT 'badge_earned' as type, u.name as user_name, b.name as item_name,
                   ub.earned_at as timestamp, u.avatar_url
            FROM user_badges ub
            JOIN users u ON ub.user_id = u.id
            JOIN badges b ON ub.badge_id = b.id
            WHERE b.club_id = ?1
            
            UNION ALL
            
            SELECT 'certificate_issued' as type, u.name as user_name, c.name as item_name,
                   uc.issued_at as timestamp, u.avatar_url
            FROM user_certificates uc
            JOIN users u ON uc.user_id = u.id
            JOIN certificates c ON uc.certificate_id = c.id
            WHERE c.club_id = ?1
            
            UNION ALL
            
            SELECT 'discussion_created' as type, u.name as user_name, d.title as item_name,
                   d.created_at as timestamp, u.avatar_url
            FROM discussions d
            JOIN users u ON d.author_id = u.id
            WHERE d.club_id = ?1 AND d.parent_id IS NULL
        )
        ORDER BY timestamp DESC
        LIMIT 50
    ");
    
    let activity_stmt = activity_stmt.bind(&vec![club_id.into()])?;
    
    let results = activity_stmt.all().await?;
    let activities = results.results::<serde_json::Value>()?;
    
    Response::from_json(&json!({
        "success": true,
        "data": activities
    }))
}