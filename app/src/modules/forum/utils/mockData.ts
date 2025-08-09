import { Question, Tag } from '../types';

// Mock data for development - in production this would come from the backend
export const mockTags: Tag[] = [
  { id: '1', name: 'JavaScript', color: 'bg-yellow-100 text-yellow-800', description: 'Questions about JavaScript programming' },
  { id: '2', name: 'React', color: 'bg-blue-100 text-blue-800', description: 'React framework questions' },
  { id: '3', name: 'TypeScript', color: 'bg-blue-100 text-blue-900', description: 'TypeScript language questions' },
  { id: '4', name: 'CSS', color: 'bg-purple-100 text-purple-800', description: 'Styling and CSS questions' },
  { id: '5', name: 'Career', color: 'bg-green-100 text-green-800', description: 'Career and professional development' },
  { id: '6', name: 'Algorithms', color: 'bg-red-100 text-red-800', description: 'Algorithm and data structure questions' },
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to use useEffect hook properly?',
    content: 'I\'m having trouble understanding when to use useEffect and how to handle dependencies properly. Can someone explain the best practices?',
    author: 'student123',
    tags: ['React', 'JavaScript'],
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2', 
    title: 'TypeScript generic constraints help needed',
    content: 'I\'m working on a TypeScript project and struggling with generic constraints. How do I properly constrain a generic type to have certain properties?',
    author: 'coder456',
    tags: ['TypeScript'],
    status: 'claimed',
    claimedBy: 'mentor789',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: '3',
    title: 'Career advice: Should I specialize or be a generalist?',
    content: 'I\'m a junior developer and wondering whether I should focus on becoming an expert in one technology stack or learn multiple technologies. What are the pros and cons?',
    author: 'newdev',
    tags: ['Career'],
    status: 'resolved',
    claimedBy: 'mentor123',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const getCurrentUser = (): string => {
  // In a real app, this would get the current user from authentication
  return 'currentUser';
};