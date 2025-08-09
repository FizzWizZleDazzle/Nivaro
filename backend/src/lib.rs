use worker::*;

mod models;

use models::*;

#[event(fetch)]
async fn fetch(
    req: Request,
    env: Env,
    _ctx: Context,
) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let router = Router::new();
    
    router
        .get("/", |_, _| Response::ok("Nivaro Learning API"))
        .get("/api/learning/courses", get_courses)
        .post("/api/learning/courses", create_course)
        .get("/api/learning/courses/:course_id", get_course)
        .run(req, env)
        .await
}

// Simplified handlers that return static data for now
fn get_courses(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let courses = vec![
        Course {
            id: "course1".to_string(),
            title: "Introduction to Programming".to_string(),
            description: "Learn the basics of programming".to_string(),
            club_id: "club1".to_string(),
            is_published: true,
            difficulty: CourseDifficulty::Beginner,
            estimated_duration: 120,
            created_by: "admin".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            lessons: vec![],
        }
    ];
    
    let response = CoursesResponse {
        courses,
        total: 1,
        page: 1,
        limit: 10,
    };
    
    Response::from_json(&ApiResponse::success(response))
}

fn create_course(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let course = Course {
        id: "course2".to_string(),
        title: "New Course".to_string(),
        description: "A new course".to_string(),
        club_id: "club1".to_string(),
        is_published: false,
        difficulty: CourseDifficulty::Beginner,
        estimated_duration: 60,
        created_by: "admin".to_string(),
        created_at: "2024-01-01T00:00:00Z".to_string(),
        updated_at: "2024-01-01T00:00:00Z".to_string(),
        lessons: vec![],
    };
    
    Response::from_json(&ApiResponse::success(course))
}

fn get_course(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let course_id = ctx.param("course_id").map_or("unknown", |v| v);
    
    if course_id == "course1" {
        let course = Course {
            id: "course1".to_string(),
            title: "Introduction to Programming".to_string(),
            description: "Learn the basics of programming".to_string(),
            club_id: "club1".to_string(),
            is_published: true,
            difficulty: CourseDifficulty::Beginner,
            estimated_duration: 120,
            created_by: "admin".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            lessons: vec![
                Lesson {
                    id: "lesson1".to_string(),
                    course_id: "course1".to_string(),
                    title: "Getting Started".to_string(),
                    description: "Your first lesson".to_string(),
                    content: LessonContent {
                        rich_text: Some("<h1>Welcome!</h1><p>This is your first lesson.</p>".to_string()),
                        video_url: None,
                        video_embed_id: None,
                        code_snippets: Some(vec![
                            CodeSnippet {
                                id: "code1".to_string(),
                                language: "javascript".to_string(),
                                code: "console.log('Hello, World!');".to_string(),
                                title: Some("Hello World".to_string()),
                                description: Some("Your first program".to_string()),
                            }
                        ]),
                        resources: None,
                    },
                    order: 1,
                    is_published: true,
                    estimated_duration: 30,
                    created_at: "2024-01-01T00:00:00Z".to_string(),
                    updated_at: "2024-01-01T00:00:00Z".to_string(),
                }
            ],
        };
        Response::from_json(&ApiResponse::success(course))
    } else {
        Response::from_json(&ApiResponse::<Course>::error("Course not found".to_string()))
    }
}