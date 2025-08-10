'use client';

import React, { useState } from 'react';
import { KanbanBoard, RepositoryLinker, CodeSnippetShare } from '../../components/project-collaboration';
import { Task, Repository, CodeSnippet } from '../../components/project-collaboration/types';

type ActiveTab = 'kanban' | 'repos' | 'snippets';

const ProjectCollaborationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');

  // Sample data for demonstration
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Set up project repository',
      description: 'Initialize GitHub repository with proper structure',
      status: 'done',
      priority: 'high',
      assignee: 'John Doe',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '2',
      title: 'Implement authentication system',
      description: 'Create login/register functionality',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Jane Smith',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-17')
    },
    {
      id: '3',
      title: 'Design user interface mockups',
      description: 'Create wireframes and UI designs',
      status: 'todo',
      priority: 'medium',
      assignee: 'Mike Johnson',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17')
    }
  ]);

  const [repositories] = useState<Repository[]>([
    {
      id: '1',
      name: 'club-management',
      url: 'https://github.com/techclub/club-management',
      platform: 'github',
      description: 'Main club management application',
      isPrivate: false,
      lastSync: new Date('2024-01-17')
    },
    {
      id: '2',
      name: 'event-tracker',
      url: 'https://gitlab.com/techclub/event-tracker',
      platform: 'gitlab',
      description: 'Event planning and tracking system',
      isPrivate: true,
      lastSync: new Date('2024-01-16')
    }
  ]);

  const [snippets] = useState<CodeSnippet[]>([
    {
      id: '1',
      title: 'React Hook for API calls',
      code: `import { useState, useEffect } from 'react';

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
};

export default useApi;`,
      language: 'javascript',
      description: 'Custom hook for making API calls with loading and error states',
      author: 'John Doe',
      tags: ['react', 'hooks', 'api'],
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Python Data Validator',
      code: `def validate_email(email):
    """Validate email format using regex"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    import re
    # Remove all non-digit characters
    digits = re.sub(r'\\D', '', phone)
    # Check if it's 10 digits (US format)
    return len(digits) == 10

# Usage examples
print(validate_email("test@example.com"))  # True
print(validate_phone("(555) 123-4567"))    # True`,
      language: 'python',
      description: 'Email and phone number validation functions',
      author: 'Jane Smith',
      tags: ['python', 'validation', 'regex'],
      isPublic: true,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    }
  ]);

  const tabs = [
    { id: 'kanban', label: 'Project Board', icon: '📋' },
    { id: 'repos', label: 'Repositories', icon: '📁' },
    { id: 'snippets', label: 'Code Snippets', icon: '💻' }
  ];

  const handleTaskUpdate = (task: Task) => {
    console.log('Task updated:', task);
    // In a real app, this would update the backend
  };

  const handleTaskCreate = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Task created:', task);
    // In a real app, this would create a new task in the backend
  };

  const handleRepositoryAdd = (repo: Omit<Repository, 'id' | 'lastSync'>) => {
    console.log('Repository added:', repo);
    // In a real app, this would link the repository in the backend
  };

  const handleRepositoryRemove = (repoId: string) => {
    console.log('Repository removed:', repoId);
    // In a real app, this would remove the repository link from the backend
  };

  const handleRepositorySync = (repoId: string) => {
    console.log('Repository synced:', repoId);
    // In a real app, this would trigger a sync with the external repository
  };

  const handleSnippetCreate = (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Snippet created:', snippet);
    // In a real app, this would save the snippet to the backend
  };

  const handleSnippetDelete = (snippetId: string) => {
    console.log('Snippet deleted:', snippetId);
    // In a real app, this would delete the snippet from the backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nivaro</h1>
              <p className="text-sm text-gray-600">Project & Code Collaboration for Technical Clubs</p>
            </div>
            <div className="text-sm text-gray-500">
              Demo Mode - Changes are not persisted
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'kanban' && (
          <KanbanBoard
            initialTasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
          />
        )}

        {activeTab === 'repos' && (
          <RepositoryLinker
            repositories={repositories}
            onRepositoryAdd={handleRepositoryAdd}
            onRepositoryRemove={handleRepositoryRemove}
            onRepositorySync={handleRepositorySync}
          />
        )}

        {activeTab === 'snippets' && (
          <CodeSnippetShare
            snippets={snippets}
            onSnippetCreate={handleSnippetCreate}
            onSnippetDelete={handleSnippetDelete}
            currentUser="demo-user"
          />
        )}
      </main>
    </div>
  );
};

export default ProjectCollaborationPage;