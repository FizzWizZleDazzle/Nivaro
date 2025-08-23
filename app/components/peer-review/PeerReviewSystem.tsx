'use client';

import React, { useState, useEffect } from 'react';
import { curriculumService, Submission } from '@/lib/curriculum';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  Send,
  Eye
} from 'lucide-react';

interface PeerReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  rubric_scores: RubricScore[];
  comments: string;
  created_at: string;
  reviewer?: {
    name: string;
    avatar?: string;
  };
}

interface RubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface PeerReviewSystemProps {
  assignmentId: string;
  clubId: string;
  isOwner: boolean;
}

export default function PeerReviewSystem({ assignmentId, clubId, isOwner }: PeerReviewSystemProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignedReviews, setAssignedReviews] = useState<Submission[]>([]);
  const [completedReviews, setCompletedReviews] = useState<PeerReview[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  // Default rubric criteria
  const defaultRubric: RubricCriterion[] = [
    {
      id: '1',
      name: 'Content Quality',
      description: 'Accuracy, completeness, and depth of the content',
      maxScore: 25
    },
    {
      id: '2',
      name: 'Understanding',
      description: 'Demonstrates clear understanding of the concepts',
      maxScore: 25
    },
    {
      id: '3',
      name: 'Organization',
      description: 'Clear structure and logical flow',
      maxScore: 25
    },
    {
      id: '4',
      name: 'Presentation',
      description: 'Clarity, formatting, and overall presentation',
      maxScore: 25
    }
  ];

  const [reviewForm, setReviewForm] = useState<{
    rubricScores: Record<string, number>;
    feedback: Record<string, string>;
    overallComments: string;
  }>({
    rubricScores: {},
    feedback: {},
    overallComments: ''
  });

  useEffect(() => {
    loadReviewData();
  }, [assignmentId]);

  const loadReviewData = async () => {
    try {
      // Load all submissions for the assignment
      const allSubmissions = await curriculumService.getSubmissions(assignmentId);
      
      // Filter submissions that need review (excluding user's own)
      const reviewableSubmissions = allSubmissions.filter(
        s => s.user_id !== user?.id && s.status === 'submitted'
      );
      
      // For demo, assign 2-3 random submissions for review
      const assigned = reviewableSubmissions.slice(0, Math.min(3, reviewableSubmissions.length));
      setAssignedReviews(assigned);
      setSubmissions(allSubmissions);
      
      // Initialize rubric scores
      const initialScores: Record<string, number> = {};
      defaultRubric.forEach(criterion => {
        initialScores[criterion.id] = 0;
      });
      setReviewForm(prev => ({ ...prev, rubricScores: initialScores }));
    } catch (error) {
      console.error('Failed to load review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    
    const rubricScoresArray: RubricScore[] = defaultRubric.map(criterion => ({
      criterion: criterion.name,
      score: reviewForm.rubricScores[criterion.id] || 0,
      maxScore: criterion.maxScore,
      feedback: reviewForm.feedback[criterion.id]
    }));
    
    // Here you would normally submit to the backend
    const newReview: PeerReview = {
      id: Date.now().toString(),
      submission_id: selectedSubmission.id,
      reviewer_id: user?.id || '',
      rubric_scores: rubricScoresArray,
      comments: reviewForm.overallComments,
      created_at: new Date().toISOString(),
      reviewer: {
        name: user?.name || 'Anonymous',
        avatar: user?.avatar
      }
    };
    
    setCompletedReviews([...completedReviews, newReview]);
    setAssignedReviews(assignedReviews.filter(s => s.id !== selectedSubmission.id));
    setSelectedSubmission(null);
    
    // Reset form
    const initialScores: Record<string, number> = {};
    defaultRubric.forEach(criterion => {
      initialScores[criterion.id] = 0;
    });
    setReviewForm({
      rubricScores: initialScores,
      feedback: {},
      overallComments: ''
    });
  };

  const calculateTotalScore = (scores: Record<string, number>) => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const calculateMaxScore = () => {
    return defaultRubric.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Peer Review</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{assignedReviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{completedReviews.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score Given</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {completedReviews.length > 0 
                    ? Math.round(
                        completedReviews.reduce((sum, review) => 
                          sum + review.rubric_scores.reduce((s, r) => s + r.score, 0), 0
                        ) / completedReviews.length
                      )
                    : '-'}
                </p>
              </div>
              <Star className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Reviews ({assignedReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed Reviews ({completedReviews.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <div>
          {assignedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-500">
                You have no pending peer reviews at this time.
              </p>
            </div>
          ) : selectedSubmission ? (
            // Review Form
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Review Submission</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submission by: Anonymous Peer
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to list
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Submission Content */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Content</h4>
                  <p className="text-gray-600">{selectedSubmission.content}</p>
                  {selectedSubmission.file_url && (
                    <a 
                      href={selectedSubmission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Attachment
                    </a>
                  )}
                </div>

                {/* Rubric Evaluation */}
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Rubric Evaluation</h4>
                  
                  {defaultRubric.map((criterion) => (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900">{criterion.name}</h5>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Score (0-{criterion.maxScore})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max={criterion.maxScore}
                            value={reviewForm.rubricScores[criterion.id] || 0}
                            onChange={(e) => setReviewForm({
                              ...reviewForm,
                              rubricScores: {
                                ...reviewForm.rubricScores,
                                [criterion.id]: parseInt(e.target.value)
                              }
                            })}
                            className="w-full mt-1"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span className="font-medium text-indigo-600">
                              {reviewForm.rubricScores[criterion.id] || 0}
                            </span>
                            <span>{criterion.maxScore}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Feedback (optional)
                          </label>
                          <textarea
                            value={reviewForm.feedback[criterion.id] || ''}
                            onChange={(e) => setReviewForm({
                              ...reviewForm,
                              feedback: {
                                ...reviewForm.feedback,
                                [criterion.id]: e.target.value
                              }
                            })}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            placeholder="Provide specific feedback for this criterion..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Overall Comments */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Overall Comments
                    </label>
                    <textarea
                      value={reviewForm.overallComments}
                      onChange={(e) => setReviewForm({
                        ...reviewForm,
                        overallComments: e.target.value
                      })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      placeholder="Provide overall feedback and suggestions for improvement..."
                    />
                  </div>
                  
                  {/* Total Score */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Score</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {calculateTotalScore(reviewForm.rubricScores)} / {calculateMaxScore()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={!reviewForm.overallComments}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // List of submissions to review
            <div className="space-y-4">
              {assignedReviews.map((submission) => (
                <div key={submission.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Peer Submission #{submission.id.slice(-4)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted: {new Date(submission.submitted_at || submission.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {submission.content}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Completed Reviews Tab
        <div>
          {completedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed reviews</h3>
              <p className="mt-1 text-sm text-gray-500">
                Reviews you complete will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Review for Submission #{review.submission_id.slice(-4)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Score</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {review.rubric_scores.reduce((sum, s) => sum + s.score, 0)} / 
                        {review.rubric_scores.reduce((sum, s) => sum + s.maxScore, 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Rubric Scores</h4>
                    <div className="space-y-2">
                      {review.rubric_scores.map((score, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{score.criterion}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {score.score}/{score.maxScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {review.comments && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                      <p className="text-sm text-gray-600">{review.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}