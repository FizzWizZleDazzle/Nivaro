'use client';

import { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import QuestionForm from '../components/QuestionForm';
import ForumFilters from '../components/ForumFilters';
import { useForum } from '../hooks/useForum';

export default function ForumPage() {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  
  const {
    questions,
    tags,
    currentUser,
    questionCounts,
    filters,
    setStatusFilter,
    setTagFilter,
    setSearchFilter,
    createQuestion,
    claimQuestion,
    resolveQuestion,
  } = useForum();

  const handleCreateQuestion = (questionData: Parameters<typeof createQuestion>[0]) => {
    createQuestion(questionData);
    setShowQuestionForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Mentorship Forum</h1>
              <p className="text-gray-600 mt-2">
                Get help from the community and share your knowledge
              </p>
            </div>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showQuestionForm ? 'Cancel' : 'Ask Question'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{questionCounts.total}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{questionCounts.open}</div>
              <div className="text-sm text-gray-600">Open Questions</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{questionCounts.claimed}</div>
              <div className="text-sm text-gray-600">Claimed Questions</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{questionCounts.resolved}</div>
              <div className="text-sm text-gray-600">Resolved Questions</div>
            </div>
          </div>
        </div>

        {/* Question Form */}
        {showQuestionForm && (
          <div className="mb-8">
            <QuestionForm
              onSubmit={handleCreateQuestion}
              availableTags={tags}
              onCancel={() => setShowQuestionForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <ForumFilters
          onStatusFilter={setStatusFilter}
          onTagFilter={setTagFilter}
          onSearchChange={setSearchFilter}
          selectedStatus={filters.status}
          selectedTag={filters.tag}
          searchTerm={filters.search}
          availableTags={tags}
          questionCounts={questionCounts}
        />

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-4">
                {filters.status !== 'all' || filters.tag || filters.search
                  ? 'Try adjusting your filters to see more questions.'
                  : 'Be the first to ask a question!'}
              </p>
              {!showQuestionForm && (
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ask the First Question
                </button>
              )}
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClaim={claimQuestion}
                onResolve={resolveQuestion}
                currentUser={currentUser}
              />
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong>How it works:</strong> Ask questions, get help from mentors, and help others learn
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <span>📝 Post your questions with relevant tags</span>
              <span>🤝 Mentors can claim questions to help</span>
              <span>✅ Mark questions as resolved when answered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}