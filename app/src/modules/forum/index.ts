// Export all forum module components and types
export { default as ForumPage } from './pages/ForumPage';
export { default as QuestionCard } from './components/QuestionCard';
export { default as QuestionForm } from './components/QuestionForm';
export { default as ForumFilters } from './components/ForumFilters';

export { useForum } from './hooks/useForum';

export type {
  Question,
  Tag,
  ForumState,
  QuestionStatus,
  CreateQuestionRequest,
  ClaimQuestionRequest,
  ResolveQuestionRequest,
} from './types';

export { mockQuestions, mockTags, getCurrentUser } from './utils/mockData';