use worker::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: String,
    pub title: String,
    pub content: String,
    pub author: String,
    pub tags: Vec<String>,
    pub status: String, // "open", "claimed", "resolved"
    pub claimed_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub resolved_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateQuestionRequest {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
}

#[derive(Deserialize)]
pub struct ClaimQuestionRequest {
    pub claimed_by: String,
}

// Mock data for development
fn get_mock_questions() -> Vec<Question> {
    vec![
        Question {
            id: "1".to_string(),
            title: "How to use useEffect hook properly?".to_string(),
            content: "I'm having trouble understanding when to use useEffect and how to handle dependencies properly. Can someone explain the best practices?".to_string(),
            author: "student123".to_string(),
            tags: vec!["React".to_string(), "JavaScript".to_string()],
            status: "open".to_string(),
            claimed_by: None,
            created_at: "2024-01-01T12:00:00Z".to_string(),
            updated_at: "2024-01-01T12:00:00Z".to_string(),
            resolved_at: None,
        },
        Question {
            id: "2".to_string(),
            title: "TypeScript generic constraints help needed".to_string(),
            content: "I'm working on a TypeScript project and struggling with generic constraints. How do I properly constrain a generic type to have certain properties?".to_string(),
            author: "coder456".to_string(),
            tags: vec!["TypeScript".to_string()],
            status: "claimed".to_string(),
            claimed_by: Some("mentor789".to_string()),
            created_at: "2024-01-01T08:00:00Z".to_string(),
            updated_at: "2024-01-01T11:00:00Z".to_string(),
            resolved_at: None,
        },
        Question {
            id: "3".to_string(),
            title: "Career advice: Should I specialize or be a generalist?".to_string(),
            content: "I'm a junior developer and wondering whether I should focus on becoming an expert in one technology stack or learn multiple technologies. What are the pros and cons?".to_string(),
            author: "newdev".to_string(),
            tags: vec!["Career".to_string()],
            status: "resolved".to_string(),
            claimed_by: Some("mentor123".to_string()),
            created_at: "2023-12-31T12:00:00Z".to_string(),
            updated_at: "2024-01-01T10:00:00Z".to_string(),
            resolved_at: Some("2024-01-01T10:00:00Z".to_string()),
        },
    ]
}

fn get_mock_tags() -> Vec<Tag> {
    vec![
        Tag {
            id: "1".to_string(),
            name: "JavaScript".to_string(),
            color: "bg-yellow-100 text-yellow-800".to_string(),
            description: Some("Questions about JavaScript programming".to_string()),
        },
        Tag {
            id: "2".to_string(),
            name: "React".to_string(),
            color: "bg-blue-100 text-blue-800".to_string(),
            description: Some("React framework questions".to_string()),
        },
        Tag {
            id: "3".to_string(),
            name: "TypeScript".to_string(),
            color: "bg-blue-100 text-blue-900".to_string(),
            description: Some("TypeScript language questions".to_string()),
        },
        Tag {
            id: "4".to_string(),
            name: "CSS".to_string(),
            color: "bg-purple-100 text-purple-800".to_string(),
            description: Some("Styling and CSS questions".to_string()),
        },
        Tag {
            id: "5".to_string(),
            name: "Career".to_string(),
            color: "bg-green-100 text-green-800".to_string(),
            description: Some("Career and professional development".to_string()),
        },
        Tag {
            id: "6".to_string(),
            name: "Algorithms".to_string(),
            color: "bg-red-100 text-red-800".to_string(),
            description: Some("Algorithm and data structure questions".to_string()),
        },
    ]
}

pub async fn get_questions() -> Result<Response> {
    let questions = get_mock_questions();
    Response::from_json(&questions)
}

pub async fn create_question(mut req: Request) -> Result<Response> {
    let create_req: CreateQuestionRequest = req.json().await?;
    
    let new_question = Question {
        id: (js_sys::Date::now() as u64).to_string(),
        title: create_req.title,
        content: create_req.content,
        author: "currentUser".to_string(), // In real app, get from auth
        tags: create_req.tags,
        status: "open".to_string(),
        claimed_by: None,
        created_at: js_sys::Date::new_0().to_iso_string().as_string().unwrap(),
        updated_at: js_sys::Date::new_0().to_iso_string().as_string().unwrap(),
        resolved_at: None,
    };
    
    Response::from_json(&new_question)
}

pub async fn claim_question(id: &str, mut req: Request) -> Result<Response> {
    let claim_req: ClaimQuestionRequest = req.json().await?;
    
    // In a real app, this would update the database
    let mut question = get_mock_questions().into_iter()
        .find(|q| q.id == id)
        .ok_or_else(|| worker::Error::RustError("Question not found".to_string()))?;
    
    question.status = "claimed".to_string();
    question.claimed_by = Some(claim_req.claimed_by);
    question.updated_at = js_sys::Date::new_0().to_iso_string().as_string().unwrap();
    
    Response::from_json(&question)
}

pub async fn resolve_question(id: &str) -> Result<Response> {
    // In a real app, this would update the database
    let mut question = get_mock_questions().into_iter()
        .find(|q| q.id == id)
        .ok_or_else(|| worker::Error::RustError("Question not found".to_string()))?;
    
    question.status = "resolved".to_string();
    let now = js_sys::Date::new_0().to_iso_string().as_string().unwrap();
    question.updated_at = now.clone();
    question.resolved_at = Some(now);
    
    Response::from_json(&question)
}

pub async fn get_tags() -> Result<Response> {
    let tags = get_mock_tags();
    Response::from_json(&tags)
}