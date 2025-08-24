use crate::models::*;
use crate::handlers::auth::{get_user_id_from_token, verify_csrf_token};
use worker::*;
use chrono::Utc;
use uuid::Uuid;

pub async fn get_courses(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Get user ID if authenticated (to check enrollment status)
    let user_id = get_user_id_from_token(&req, &ctx);

    // Query all published courses
    let stmt = db.prepare("
        SELECT id, title, description, instructor_id, club_id, category, 
               difficulty, duration_hours, thumbnail_url, lessons, 
               is_published, rating, enrolled_count, created_at, updated_at
        FROM courses 
        WHERE is_published = 1
        ORDER BY created_at DESC
    ");
    
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch courses", 500),
    };

    let mut courses: Vec<Course> = Vec::new();
    
    for row in results {
        let course_id = row["id"].as_str().unwrap_or("").to_string();
        
        // Check if user is enrolled (if authenticated)
        let mut is_enrolled = false;
        let mut completion_percentage = 0.0;
        
        if let Some(ref uid) = user_id {
            let enroll_stmt = db.prepare("
                SELECT completion_percentage FROM enrollments 
                WHERE user_id = ?1 AND course_id = ?2
            ");
            if let Ok(stmt) = enroll_stmt.bind(&vec![uid.clone().into(), course_id.clone().into()]) {
                if let Ok(Some(enroll_row)) = stmt.first::<serde_json::Value>(None).await {
                    is_enrolled = true;
                    completion_percentage = enroll_row["completion_percentage"].as_f64().unwrap_or(0.0) as f32;
                }
            }
        }
        
        // Parse lessons from JSON
        let lessons: Vec<Lesson> = row["lessons"].as_str()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default();
        
        courses.push(Course {
            id: course_id,
            title: row["title"].as_str().unwrap_or("").to_string(),
            description: row["description"].as_str().map(|s| s.to_string()),
            instructor_id: row["instructor_id"].as_str().unwrap_or("").to_string(),
            club_id: row["club_id"].as_str().map(|s| s.to_string()),
            category: row["category"].as_str().map(|s| s.to_string()),
            difficulty: row["difficulty"].as_str().map(|s| s.to_string()),
            duration_hours: row["duration_hours"].as_i64().map(|n| n as u32),
            thumbnail_url: row["thumbnail_url"].as_str().map(|s| s.to_string()),
            lessons,
            requirements: row["requirements"].as_str()
                .and_then(|s| serde_json::from_str(s).ok()),
            learning_outcomes: row["learning_outcomes"].as_str()
                .and_then(|s| serde_json::from_str(s).ok()),
            is_published: true,
            rating: row["rating"].as_f64().unwrap_or(0.0) as f32,
            enrolled_count: row["enrolled_count"].as_i64().unwrap_or(0) as u32,
            created_at: row["created_at"].as_str().unwrap_or("").to_string(),
            updated_at: row["updated_at"].as_str().unwrap_or("").to_string(),
        });
    }

    let response = ApiResponse {
        success: true,
        data: Some(courses),
        error: None,
    };

    Response::from_json(&response)
}

pub async fn get_enrolled_courses(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Require authentication
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query enrolled courses with progress
    let stmt = db.prepare("
        SELECT e.*, c.title, c.description, c.instructor_id, c.category, 
               c.difficulty, c.duration_hours, c.thumbnail_url, c.lessons,
               c.rating, c.enrolled_count, c.created_at as course_created,
               c.updated_at as course_updated
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?1
        ORDER BY e.last_accessed DESC
    ");
    
    let stmt = match stmt.bind(&vec![user_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };
    
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch enrolled courses", 500),
    };

    let mut enrollments: Vec<Enrollment> = Vec::new();
    
    for row in results {
        // Parse lessons from JSON
        let lessons: Vec<Lesson> = row["lessons"].as_str()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default();
        
        // Parse progress from JSON
        let progress: Option<UserProgress> = row["progress"].as_str()
            .and_then(|s| serde_json::from_str(s).ok());
        
        enrollments.push(Enrollment {
            id: row["id"].as_str().unwrap_or("").to_string(),
            user_id: row["user_id"].as_str().unwrap_or("").to_string(),
            course_id: row["course_id"].as_str().unwrap_or("").to_string(),
            enrolled_at: row["enrolled_at"].as_str().unwrap_or("").to_string(),
            completed_at: row["completed_at"].as_str().map(|s| s.to_string()),
            last_accessed: row["last_accessed"].as_str().map(|s| s.to_string()),
            progress,
            completion_percentage: row["completion_percentage"].as_f64().unwrap_or(0.0) as f32,
        });
    }

    let response = ApiResponse {
        success: true,
        data: Some(enrollments),
        error: None,
    };

    Response::from_json(&response)
}

pub async fn enroll_in_course(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    #[derive(serde::Deserialize)]
    struct EnrollRequest {
        course_id: String,
    }

    let enroll_request: EnrollRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Check if already enrolled
    let check_stmt = db.prepare("
        SELECT id FROM enrollments 
        WHERE user_id = ?1 AND course_id = ?2
    ");
    
    let check_stmt = match check_stmt.bind(&vec![
        user_id.clone().into(),
        enroll_request.course_id.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    if let Ok(Some(_)) = check_stmt.first::<serde_json::Value>(None).await {
        return Response::error("Already enrolled in this course", 400);
    }

    // Create enrollment
    let enrollment_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    // Initialize progress
    let initial_progress = UserProgress {
        completed_lessons: Vec::new(),
        quiz_scores: None,
        notes: None,
        bookmarks: None,
        last_lesson_id: None,
    };
    
    let progress_json = serde_json::to_string(&initial_progress).unwrap_or("{}".to_string());

    let stmt = db.prepare("
        INSERT INTO enrollments (id, user_id, course_id, enrolled_at, last_accessed, progress, completion_percentage)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)
    ");
    
    let stmt = match stmt.bind(&vec![
        enrollment_id.clone().into(),
        user_id.into(),
        enroll_request.course_id.clone().into(),
        now.clone().into(),
        now.into(),
        progress_json.into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare enrollment insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to create enrollment", 500);
    }

    // Update course enrolled count
    let update_stmt = db.prepare("
        UPDATE courses 
        SET enrolled_count = enrolled_count + 1
        WHERE id = ?1
    ");
    
    if let Ok(stmt) = update_stmt.bind(&vec![enroll_request.course_id.into()]) {
        let _ = stmt.run().await;
    }

    let response = ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "enrollment_id": enrollment_id,
            "message": "Successfully enrolled in course"
        })),
        error: None,
    };

    Response::from_json(&response)
}

pub async fn get_saved_courses(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Require authentication
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Query saved courses (using stars table)
    let stmt = db.prepare("
        SELECT s.*, c.title, c.description, c.instructor_id, c.category,
               c.difficulty, c.duration_hours, c.thumbnail_url
        FROM stars s
        JOIN courses c ON s.target_id = c.id
        WHERE s.user_id = ?1 AND s.target_type = 'course'
        ORDER BY s.starred_at DESC
    ");
    
    let stmt = match stmt.bind(&vec![user_id.into()]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };
    
    let results = match stmt.all().await {
        Ok(results) => results.results::<serde_json::Value>().ok().unwrap_or_default(),
        Err(_) => return Response::error("Failed to fetch saved courses", 500),
    };

    let saved_courses: Vec<Star> = results
        .into_iter()
        .filter_map(|row| {
            Some(Star {
                id: row["id"].as_str()?.to_string(),
                user_id: row["user_id"].as_str()?.to_string(),
                target_id: row["target_id"].as_str()?.to_string(),
                target_type: "course".to_string(),
                starred_at: row["starred_at"].as_str()?.to_string(),
            })
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(saved_courses),
        error: None,
    };

    Response::from_json(&response)
}

pub async fn save_course(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Verify CSRF token
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }

    // Get user ID from token
    let user_id = match get_user_id_from_token(&req, &ctx) {
        Some(id) => id,
        None => return Response::error("Unauthorized", 401),
    };

    #[derive(serde::Deserialize)]
    struct SaveRequest {
        course_id: String,
    }

    let save_request: SaveRequest = match req.json().await {
        Ok(req) => req,
        Err(_) => return Response::error("Invalid request body", 400),
    };

    let db = match ctx.env.d1("DB") {
        Ok(db) => db,
        Err(_) => return Response::error("Database connection failed", 500),
    };

    // Check if already saved
    let check_stmt = db.prepare("
        SELECT id FROM stars 
        WHERE user_id = ?1 AND target_id = ?2 AND target_type = 'course'
    ");
    
    let check_stmt = match check_stmt.bind(&vec![
        user_id.clone().into(),
        save_request.course_id.clone().into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare query", 500),
    };

    if let Ok(Some(_)) = check_stmt.first::<serde_json::Value>(None).await {
        // Already saved, remove it (toggle)
        let delete_stmt = db.prepare("
            DELETE FROM stars 
            WHERE user_id = ?1 AND target_id = ?2 AND target_type = 'course'
        ");
        
        if let Ok(stmt) = delete_stmt.bind(&vec![
            user_id.into(),
            save_request.course_id.into(),
        ]) {
            let _ = stmt.run().await;
        }
        
        let response = ApiResponse {
            success: true,
            data: Some(serde_json::json!({
                "message": "Course removed from saved",
                "saved": false
            })),
            error: None,
        };
        
        return Response::from_json(&response);
    }

    // Add to saved
    let star_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let stmt = db.prepare("
        INSERT INTO stars (id, user_id, target_id, target_type, starred_at)
        VALUES (?1, ?2, ?3, 'course', ?4)
    ");
    
    let stmt = match stmt.bind(&vec![
        star_id.into(),
        user_id.into(),
        save_request.course_id.into(),
        now.into(),
    ]) {
        Ok(stmt) => stmt,
        Err(_) => return Response::error("Failed to prepare save insert", 500),
    };
    
    if stmt.run().await.is_err() {
        return Response::error("Failed to save course", 500);
    }

    let response = ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "message": "Course saved successfully",
            "saved": true
        })),
        error: None,
    };

    Response::from_json(&response)
}