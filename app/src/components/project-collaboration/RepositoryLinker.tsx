'use client';

import React, { useState } from 'react';
import { Repository } from './types';

interface RepositoryLinkerProps {
  repositories?: Repository[];
  onRepositoryAdd?: (repository: Omit<Repository, 'id' | 'lastSync'>) => void;
  onRepositoryRemove?: (repositoryId: string) => void;
  onRepositorySync?: (repositoryId: string) => void;
}

const RepositoryLinker: React.FC<RepositoryLinkerProps> = ({
  repositories = [],
  onRepositoryAdd,
  onRepositoryRemove,
  onRepositorySync
}) => {
  const [repos, setRepos] = useState<Repository[]>(repositories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    platform: 'github' as 'github' | 'gitlab',
    description: '',
    isPrivate: false
  });

  const validateGitHubUrl = (url: string): boolean => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const validateGitLabUrl = (url: string): boolean => {
    const gitlabPattern = /^https:\/\/(gitlab\.com|[\w\-\.]+)\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return gitlabPattern.test(url);
  };

  const extractRepoName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
      }
    } catch {
      // Invalid URL
    }
    return '';
  };

  const handleUrlChange = (url: string) => {
    setNewRepo(prev => ({ ...prev, url }));
    
    // Auto-detect platform and name
    if (validateGitHubUrl(url)) {
      setNewRepo(prev => ({
        ...prev,
        platform: 'github',
        name: extractRepoName(url) || prev.name
      }));
    } else if (validateGitLabUrl(url)) {
      setNewRepo(prev => ({
        ...prev,
        platform: 'gitlab',
        name: extractRepoName(url) || prev.name
      }));
    }
  };

  const handleAddRepository = () => {
    if (!newRepo.name || !newRepo.url) return;
    
    const isValidUrl = newRepo.platform === 'github' 
      ? validateGitHubUrl(newRepo.url)
      : validateGitLabUrl(newRepo.url);
    
    if (!isValidUrl) {
      alert('Please enter a valid repository URL');
      return;
    }

    const repository: Repository = {
      id: Date.now().toString(),
      ...newRepo,
      lastSync: undefined
    };

    setRepos(prev => [...prev, repository]);
    onRepositoryAdd?.(repository);
    
    // Reset form
    setNewRepo({
      name: '',
      url: '',
      platform: 'github',
      description: '',
      isPrivate: false
    });
    setShowAddForm(false);
  };

  const handleRemoveRepository = (id: string) => {
    setRepos(prev => prev.filter(repo => repo.id !== id));
    onRepositoryRemove?.(id);
  };

  const handleSyncRepository = (id: string) => {
    setRepos(prev => prev.map(repo => 
      repo.id === id 
        ? { ...repo, lastSync: new Date() }
        : repo
    ));
    onRepositorySync?.(id);
  };

  const getPlatformIcon = (platform: 'github' | 'gitlab') => {
    if (platform === 'github') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.35-.69V1.85A1.85 1.85 0 0 1 2.85 0h18.3A1.85 1.85 0 0 1 23 1.85v11.85a.84.84 0 0 1-.35.69zM6 2v20l6-4 6 4V2z"/>
        </svg>
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Repository Links</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          + Link Repository
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Link New Repository</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository URL
              </label>
              <input
                type="url"
                value={newRepo.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                value={newRepo.name}
                onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="user/repo"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={newRepo.platform}
                onChange={(e) => setNewRepo(prev => ({ ...prev, platform: e.target.value as 'github' | 'gitlab' }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={newRepo.isPrivate}
                onChange={(e) => setNewRepo(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                Private Repository
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newRepo.description}
                onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the repository..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddRepository}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Link Repository
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map(repo => (
          <div key={repo.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-gray-600">
                  {getPlatformIcon(repo.platform)}
                </div>
                <h3 className="font-semibold text-gray-800 truncate">{repo.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSyncRepository(repo.id)}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  title="Sync Repository"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRemoveRepository(repo.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Remove Repository"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm truncate block"
              >
                {repo.url}
              </a>
              
              {repo.description && (
                <p className="text-gray-600 text-sm">{repo.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`px-2 py-1 rounded ${repo.isPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {repo.isPrivate ? 'Private' : 'Public'}
                </span>
                <span className="capitalize">{repo.platform}</span>
                {repo.lastSync && (
                  <span>
                    Synced: {repo.lastSync.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {repos.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories linked</h3>
          <p className="text-gray-500 mb-4">Link your GitHub or GitLab repositories to get started.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Link Your First Repository
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositoryLinker;