'use client';

import React, { useState, useEffect } from 'react';
import { curriculumService, Assignment, Submission } from '@/lib/curriculum';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  Upload,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';

interface AssignmentManagerProps {
  clubId: string;
  isOwner: boolean;
}

export default function AssignmentManager({ clubId, isOwner }: AssignmentManagerProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100
  });
  
  const [submissionForm, setSubmissionForm] = useState({
    content: '',
    file_url: ''
  });

  useEffect(() => {
    loadAssignments();
  }, [clubId]);

  const loadAssignments = async () => {
    try {
      const data = await curriculumService.getAssignments(clubId);
      setAssignments(data);
      
      // Load user's submissions for each assignment
      if (user && !isOwner) {
        const submissionMap = new Map<string, Submission>();
        for (const assignment of data) {
          const submissions = await curriculumService.getSubmissions(assignment.id);
          const userSubmission = submissions.find(s => s.user_id === user.id);
          if (userSubmission) {
            submissionMap.set(assignment.id, userSubmission);
          }
        }
        setSubmissions(submissionMap);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.description) return;
    
    const newAssignment = await curriculumService.createAssignment(clubId, assignmentForm);
    if (newAssignment) {
      setAssignments([...assignments, newAssignment]);
      setShowNewAssignment(false);
      setAssignmentForm({
        title: '',
        description: '',
        due_date: '',
        max_points: 100
      });
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionForm.content && !submissionForm.file_url) return;
    
    const submission = await curriculumService.submitAssignment(assignmentId, submissionForm);
    if (submission) {
      const newSubmissions = new Map(submissions);
      newSubmissions.set(assignmentId, submission);
      setSubmissions(newSubmissions);
      setSubmissionForm({ content: '', file_url: '' });
      setSelectedAssignment(null);
    }
  };

  const getStatusColor = (status?: Submission['status']) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      case 'returned': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
        {isOwner && (
          <button
            onClick={() => setShowNewAssignment(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </button>
        )}
      </div>

      {/* Create Assignment Form */}
      {showNewAssignment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Describe the assignment requirements..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Points</label>
                <input
                  type="number"
                  value={assignmentForm.max_points}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, max_points: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewAssignment(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner ? 'Create your first assignment to get started.' : 'No assignments have been posted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = submissions.get(assignment.id);
            const isDue = isOverdue(assignment.due_date);
            
            return (
              <div key={assignment.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                      
                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        {assignment.due_date && (
                          <div className={`flex items-center ${isDue ? 'text-red-600' : ''}`}>
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {new Date(assignment.due_date).toLocaleString()}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {assignment.max_points} points
                        </div>
                      </div>

                      {/* Student View - Submission Status */}
                      {!isOwner && (
                        <div className="mt-4">
                          {submission ? (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                                  {submission.status}
                                </span>
                                {submission.points_earned !== undefined && (
                                  <span className="text-sm text-gray-700">
                                    Score: {submission.points_earned}/{assignment.max_points}
                                  </span>
                                )}
                              </div>
                              {submission.status === 'draft' && (
                                <button
                                  onClick={() => setSelectedAssignment(assignment)}
                                  className="text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                  Continue Submission
                                </button>
                              )}
                            </div>
                          ) : (
                            selectedAssignment?.id === assignment.id ? (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Submit Assignment</h4>
                                <div className="space-y-3">
                                  <div>
                                    <textarea
                                      value={submissionForm.content}
                                      onChange={(e) => setSubmissionForm({ ...submissionForm, content: e.target.value })}
                                      rows={4}
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                      placeholder="Enter your submission..."
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Upload className="w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      value={submissionForm.file_url}
                                      onChange={(e) => setSubmissionForm({ ...submissionForm, file_url: e.target.value })}
                                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                      placeholder="File URL (optional)"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setSelectedAssignment(null)}
                                      className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSubmitAssignment(assignment.id)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedAssignment(assignment)}
                                disabled={isDue}
                                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                  isDue
                                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                                    : 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {isDue ? (
                                  <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Overdue
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Submit Assignment
                                  </>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      )}

                      {/* Instructor View - View Submissions */}
                      {isOwner && (
                        <div className="mt-4">
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">
                            View Submissions →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}