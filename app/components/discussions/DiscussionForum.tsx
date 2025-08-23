'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  Pin, 
  Lock,
  Unlock,
  ThumbsUp,
  Reply,
  CheckCircle,
  Search,
  Filter,
  User,
  Clock,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

interface Discussion {
  id: string;
  club_id: string;
  title: string;
  content: string;
  author_id: string;
  author: {
    name: string;
    avatar?: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  reply_count: number;
  last_reply?: {
    author_name: string;
    created_at: string;
  };
  tags?: string[];
}

interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  likes: number;
  user_liked?: boolean;
}

interface DiscussionForumProps {
  clubId: string;
  isOwner: boolean;
}

export default function DiscussionForum({ clubId, isOwner }: DiscussionForumProps) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
    tags: ''
  });
  
  const [replyForm, setReplyForm] = useState({
    content: ''
  });

  // Sample data for demonstration
  const sampleDiscussions: Discussion[] = [
    {
      id: '1',
      club_id: clubId,
      title: 'Welcome to the Discussion Forum!',
      content: 'This is a place to ask questions, share insights, and collaborate with fellow club members.',
      author_id: '1',
      author: { name: 'Club Admin' },
      is_pinned: true,
      is_locked: false,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      reply_count: 5,
      last_reply: {
        author_name: 'John Doe',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      tags: ['announcement', 'welcome']
    },
    {
      id: '2',
      club_id: clubId,
      title: 'Help with Assignment 3 - Algorithm Optimization',
      content: 'I\'m struggling with the time complexity requirements. Can someone explain the approach?',
      author_id: '2',
      author: { name: 'Alice Smith' },
      is_pinned: false,
      is_locked: false,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      reply_count: 12,
      last_reply: {
        author_name: 'Bob Johnson',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      tags: ['help', 'assignment']
    },
    {
      id: '3',
      club_id: clubId,
      title: 'Study Group for Module 4',
      content: 'Anyone interested in forming a study group for the upcoming module on advanced topics?',
      author_id: '3',
      author: { name: 'Charlie Brown' },
      is_pinned: false,
      is_locked: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      reply_count: 8,
      tags: ['study-group', 'collaboration']
    }
  ];

  const sampleReplies: DiscussionReply[] = [
    {
      id: '1',
      discussion_id: '2',
      author_id: '4',
      author: { name: 'David Lee' },
      content: 'The key is to use dynamic programming. Start by breaking down the problem into smaller subproblems.',
      is_solution: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      likes: 15,
      user_liked: true
    },
    {
      id: '2',
      discussion_id: '2',
      author_id: '5',
      author: { name: 'Emma Wilson' },
      content: 'I found this resource helpful: [link]. It explains the concept really well.',
      is_solution: false,
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
      likes: 8,
      user_liked: false
    }
  ];

  useEffect(() => {
    loadDiscussions();
  }, [clubId]);

  const loadDiscussions = () => {
    setDiscussions(sampleDiscussions);
    setLoading(false);
  };

  const loadReplies = (discussionId: string) => {
    setReplies(sampleReplies.filter(r => r.discussion_id === discussionId));
  };

  const handleCreateDiscussion = () => {
    if (!discussionForm.title || !discussionForm.content) return;
    
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      club_id: clubId,
      title: discussionForm.title,
      content: discussionForm.content,
      author_id: user?.id || '',
      author: { name: user?.name || 'Anonymous' },
      is_pinned: false,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reply_count: 0,
      tags: discussionForm.tags.split(',').map(t => t.trim()).filter(t => t)
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setShowNewDiscussion(false);
    setDiscussionForm({ title: '', content: '', tags: '' });
  };

  const handleReply = () => {
    if (!replyForm.content || !selectedDiscussion) return;
    
    const newReply: DiscussionReply = {
      id: Date.now().toString(),
      discussion_id: selectedDiscussion.id,
      author_id: user?.id || '',
      author: { name: user?.name || 'Anonymous' },
      content: replyForm.content,
      is_solution: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      user_liked: false
    };
    
    setReplies([...replies, newReply]);
    setReplyForm({ content: '' });
    
    // Update discussion reply count
    const updatedDiscussion = { ...selectedDiscussion, reply_count: selectedDiscussion.reply_count + 1 };
    setSelectedDiscussion(updatedDiscussion);
    setDiscussions(discussions.map(d => d.id === updatedDiscussion.id ? updatedDiscussion : d));
  };

  const togglePin = (discussionId: string) => {
    setDiscussions(discussions.map(d => 
      d.id === discussionId ? { ...d, is_pinned: !d.is_pinned } : d
    ));
  };

  const toggleLock = (discussionId: string) => {
    setDiscussions(discussions.map(d => 
      d.id === discussionId ? { ...d, is_locked: !d.is_locked } : d
    ));
  };

  const toggleLike = (replyId: string) => {
    setReplies(replies.map(r => 
      r.id === replyId 
        ? { ...r, likes: r.user_liked ? r.likes - 1 : r.likes + 1, user_liked: !r.user_liked }
        : r
    ));
  };

  const markAsSolution = (replyId: string) => {
    setReplies(replies.map(r => 
      r.id === replyId 
        ? { ...r, is_solution: true }
        : { ...r, is_solution: false }
    ));
  };

  const filteredDiscussions = discussions
    .filter(d => !searchTerm || d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 d.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(d => !filterTag || d.tags?.includes(filterTag))
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const allTags = Array.from(new Set(discussions.flatMap(d => d.tags || [])));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedDiscussion ? (
        // Discussion Detail View
        <div>
          <button
            onClick={() => {
              setSelectedDiscussion(null);
              setReplies([]);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back to discussions
          </button>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {selectedDiscussion.is_pinned && (
                      <Pin className="w-4 h-4 text-indigo-600" />
                    )}
                    {selectedDiscussion.is_locked && (
                      <Lock className="w-4 h-4 text-red-600" />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedDiscussion.title}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {selectedDiscussion.author.name}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(selectedDiscussion.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedDiscussion.reply_count} replies
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePin(selectedDiscussion.id)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Pin className={`w-5 h-5 ${selectedDiscussion.is_pinned ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleLock(selectedDiscussion.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      {selectedDiscussion.is_locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
              </div>
              {selectedDiscussion.tags && selectedDiscussion.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedDiscussion.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Replies */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Replies</h2>
              
              {replies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No replies yet. Be the first to respond!</p>
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className={`border rounded-lg p-4 ${reply.is_solution ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {reply.author.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{reply.author.name}</span>
                              {reply.is_solution && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Solution
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                            <div className="mt-3 flex items-center space-x-4">
                              <button
                                onClick={() => toggleLike(reply.id)}
                                className={`flex items-center text-sm ${reply.user_liked ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                              >
                                <ThumbsUp className={`w-4 h-4 mr-1 ${reply.user_liked ? 'fill-current' : ''}`} />
                                {reply.likes}
                              </button>
                              {isOwner && !reply.is_solution && (
                                <button
                                  onClick={() => markAsSolution(reply.id)}
                                  className="text-sm text-gray-500 hover:text-green-600"
                                >
                                  Mark as solution
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply Form */}
              {!selectedDiscussion.is_locked && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Post a Reply</h3>
                  <div className="space-y-3">
                    <textarea
                      value={replyForm.content}
                      onChange={(e) => setReplyForm({ content: e.target.value })}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      placeholder="Share your thoughts..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleReply}
                        disabled={!replyForm.content}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Post Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Discussion List View
        <div>
          {/* Header and Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Discussion Forum</h2>
              <button
                onClick={() => setShowNewDiscussion(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search discussions..."
                />
              </div>
              {allTags.length > 0 && (
                <select
                  value={filterTag || ''}
                  onChange={(e) => setFilterTag(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* New Discussion Form */}
          {showNewDiscussion && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Start a New Discussion</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={discussionForm.title}
                    onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="What's your question or topic?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={discussionForm.content}
                    onChange={(e) => setDiscussionForm({ ...discussionForm, content: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Provide details, context, or your thoughts..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={discussionForm.tags}
                    onChange={(e) => setDiscussionForm({ ...discussionForm, tags: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g., help, announcement, study-group"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowNewDiscussion(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDiscussion}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Post Discussion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discussions List */}
          {filteredDiscussions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No discussions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterTag ? 'Try adjusting your filters' : 'Start a new discussion to get the conversation going!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedDiscussion(discussion);
                    loadReplies(discussion.id);
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {discussion.is_pinned && (
                            <Pin className="w-4 h-4 text-indigo-600" />
                          )}
                          {discussion.is_locked && (
                            <Lock className="w-4 h-4 text-red-600" />
                          )}
                          <h3 className="text-lg font-medium text-gray-900">
                            {discussion.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {discussion.content}
                        </p>
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {discussion.author.name}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(discussion.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {discussion.reply_count} replies
                          </div>
                          {discussion.last_reply && (
                            <div className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Last reply by {discussion.last_reply.author_name}
                            </div>
                          )}
                        </div>
                        {discussion.tags && discussion.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {discussion.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}