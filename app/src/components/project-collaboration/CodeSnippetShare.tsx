'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeSnippet } from './types';

interface CodeSnippetShareProps {
  snippets?: CodeSnippet[];
  onSnippetCreate?: (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSnippetDelete?: (snippetId: string) => void;
  currentUser?: string;
}

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go',
  'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'html', 'css', 'scss',
  'json', 'xml', 'sql', 'bash', 'powershell', 'yaml', 'dockerfile', 'markdown'
];

const CodeSnippetShare: React.FC<CodeSnippetShareProps> = ({
  snippets = [],
  onSnippetCreate,
  onSnippetDelete,
  currentUser = 'anonymous'
}) => {
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>(snippets);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    code: '',
    language: 'javascript',
    description: '',
    tags: [] as string[],
    isPublic: true
  });
  const [tagInput, setTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());

  const handleCreateSnippet = () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim()) {
      alert('Please provide both a title and code snippet');
      return;
    }

    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      ...newSnippet,
      author: currentUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCodeSnippets(prev => [...prev, snippet]);
    onSnippetCreate?.(snippet);
    
    // Reset form
    setNewSnippet({
      title: '',
      code: '',
      language: 'javascript',
      description: '',
      tags: [],
      isPublic: true
    });
    setTagInput('');
    setShowCreateForm(false);
  };

  const handleDeleteSnippet = (id: string) => {
    setCodeSnippets(prev => prev.filter(snippet => snippet.id !== id));
    onSnippetDelete?.(id);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newSnippet.tags.includes(tag)) {
      setNewSnippet(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewSnippet(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleSnippetExpansion = (id: string) => {
    setExpandedSnippets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
      alert('Failed to copy code');
    }
  };

  const filteredSnippets = codeSnippets.filter(snippet => {
    const matchesSearch = searchTerm === '' || 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === '' || snippet.language === selectedLanguage;
    
    return matchesSearch && matchesLanguage && (snippet.isPublic || snippet.author === currentUser);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Code Snippets</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          + Share Code
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Share New Code Snippet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newSnippet.title}
                onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Snippet title..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={newSnippet.language}
                onChange={(e) => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newSnippet.description}
              onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the code..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <textarea
              value={newSnippet.code}
              onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Paste your code here..."
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newSnippet.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSnippet.isPublic}
                onChange={(e) => setNewSnippet(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Make this snippet public
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateSnippet}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Share Snippet
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSnippets.map(snippet => (
          <div key={snippet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{snippet.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(snippet.code)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="Copy code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {snippet.author === currentUser && (
                    <button
                      onClick={() => handleDeleteSnippet(snippet.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      title="Delete snippet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {snippet.description && (
                <p className="text-gray-600 text-sm mb-2">{snippet.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">{snippet.language}</span>
                <span>by {snippet.author}</span>
                <span>{snippet.createdAt.toLocaleDateString()}</span>
                {!snippet.isPublic && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Private</span>
                )}
              </div>

              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {snippet.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <SyntaxHighlighter
                language={snippet.language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  maxHeight: expandedSnippets.has(snippet.id) ? 'none' : '200px',
                  overflow: expandedSnippets.has(snippet.id) ? 'visible' : 'hidden'
                }}
                showLineNumbers={true}
              >
                {snippet.code}
              </SyntaxHighlighter>
              
              {snippet.code.split('\n').length > 10 && (
                <button
                  onClick={() => toggleSnippetExpansion(snippet.id)}
                  className="absolute bottom-2 right-2 px-3 py-1 bg-gray-800 bg-opacity-80 text-white text-xs rounded hover:bg-opacity-100"
                >
                  {expandedSnippets.has(snippet.id) ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSnippets.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No code snippets found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedLanguage ? 'Try adjusting your search filters.' : 'Share your first code snippet to get started.'}
          </p>
          {!searchTerm && !selectedLanguage && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Share Your First Snippet
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeSnippetShare;