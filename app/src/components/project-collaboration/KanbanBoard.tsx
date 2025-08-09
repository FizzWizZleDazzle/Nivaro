'use client';

import React, { useState } from 'react';
import { Task, KanbanColumn } from './types';

interface KanbanBoardProps {
  initialTasks?: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  initialTasks = [], 
  onTaskUpdate, 
  onTaskCreate 
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState<string | null>(null);

  const columns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 'todo')
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in-progress')
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(task => task.status === 'done')
    }
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Task['status']) => {
    if (!draggedTask) return;

    const updatedTask = { ...draggedTask, status, updatedAt: new Date() };
    setTasks(prev => prev.map(task => 
      task.id === draggedTask.id ? updatedTask : task
    ));
    
    onTaskUpdate?.(updatedTask);
    setDraggedTask(null);
  };

  const handleCreateTask = (status: Task['status']) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, newTask]);
    onTaskCreate?.(newTask);
    setNewTaskTitle('');
    setShowNewTaskForm(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Board</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-white rounded-lg shadow-md p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id as Task['status'])}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">{column.title}</h2>
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
                {column.tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`p-3 bg-white border-l-4 ${getPriorityColor(task.priority)} rounded-r-md shadow-sm cursor-move hover:shadow-md transition-shadow`}
                >
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  {task.assignee && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.assignee}
                      </span>
                    </div>
                  )}
                  {task.priority && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {showNewTaskForm === column.id ? (
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-md">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateTask(column.id as Task['status']);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleCreateTask(column.id as Task['status'])}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewTaskForm(null);
                        setNewTaskTitle('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewTaskForm(column.id)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add a task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;