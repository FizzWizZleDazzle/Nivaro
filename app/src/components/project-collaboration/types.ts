// Types for project collaboration features
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  platform: 'github' | 'gitlab';
  description?: string;
  isPrivate: boolean;
  lastSync?: Date;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  author: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}