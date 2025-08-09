'use client';

import { useState, useMemo, useCallback } from 'react';
import { Question, QuestionStatus, CreateQuestionRequest, ForumState } from '../types';
import { mockQuestions, mockTags, getCurrentUser } from '../utils/mockData';

export const useForum = () => {
  const [forumState, setForumState] = useState<ForumState>({
    questions: mockQuestions,
    tags: mockTags,
    currentUser: getCurrentUser(),
  });

  const [filters, setFilters] = useState({
    status: 'all' as QuestionStatus | 'all',
    tag: null as string | null,
    search: '',
  });

  // Filter questions based on current filters
  const filteredQuestions = useMemo(() => {
    return forumState.questions.filter((question) => {
      // Status filter
      if (filters.status !== 'all' && question.status !== filters.status) {
        return false;
      }

      // Tag filter
      if (filters.tag && !question.tags.includes(filters.tag)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          question.title.toLowerCase().includes(searchLower) ||
          question.content.toLowerCase().includes(searchLower) ||
          question.author.toLowerCase().includes(searchLower) ||
          question.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [forumState.questions, filters]);

  // Calculate question counts for filters
  const questionCounts = useMemo(() => {
    const total = forumState.questions.length;
    const open = forumState.questions.filter(q => q.status === 'open').length;
    const claimed = forumState.questions.filter(q => q.status === 'claimed').length;
    const resolved = forumState.questions.filter(q => q.status === 'resolved').length;

    return { total, open, claimed, resolved };
  }, [forumState.questions]);

  // Create a new question
  const createQuestion = useCallback((request: CreateQuestionRequest) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: request.title,
      content: request.content,
      author: forumState.currentUser,
      tags: request.tags,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setForumState(prev => ({
      ...prev,
      questions: [newQuestion, ...prev.questions],
    }));

    return newQuestion;
  }, [forumState.currentUser]);

  // Claim a question
  const claimQuestion = useCallback((questionId: string) => {
    setForumState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              status: 'claimed' as const,
              claimedBy: prev.currentUser,
              updatedAt: new Date().toISOString(),
            }
          : question
      ),
    }));
  }, []);

  // Resolve a question
  const resolveQuestion = useCallback((questionId: string) => {
    setForumState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              status: 'resolved' as const,
              updatedAt: new Date().toISOString(),
              resolvedAt: new Date().toISOString(),
            }
          : question
      ),
    }));
  }, []);

  // Filter handlers
  const setStatusFilter = useCallback((status: QuestionStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const setTagFilter = useCallback((tag: string | null) => {
    setFilters(prev => ({ ...prev, tag }));
  }, []);

  const setSearchFilter = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  return {
    // State
    questions: filteredQuestions,
    allQuestions: forumState.questions,
    tags: forumState.tags,
    currentUser: forumState.currentUser,
    questionCounts,
    
    // Filters
    filters,
    setStatusFilter,
    setTagFilter,
    setSearchFilter,
    
    // Actions
    createQuestion,
    claimQuestion,
    resolveQuestion,
  };
};