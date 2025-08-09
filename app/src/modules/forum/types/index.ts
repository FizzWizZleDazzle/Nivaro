export interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  status: 'open' | 'claimed' | 'resolved';
  claimedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ForumState {
  questions: Question[];
  tags: Tag[];
  currentUser: string;
}

export type QuestionStatus = 'open' | 'claimed' | 'resolved';

export interface CreateQuestionRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface ClaimQuestionRequest {
  questionId: string;
  claimedBy: string;
}

export interface ResolveQuestionRequest {
  questionId: string;
}