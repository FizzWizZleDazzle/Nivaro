'use client';

import React, { useState, useEffect } from 'react';
import { curriculumService, Curriculum, Module, Lesson } from '@/lib/curriculum';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  ClipboardList
} from 'lucide-react';

interface CurriculumBuilderProps {
  clubId: string;
  isOwner: boolean;
}

export default function CurriculumBuilder({ clubId, isOwner }: CurriculumBuilderProps) {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  
  // Form states
  const [curriculumForm, setCurriculumForm] = useState({
    title: '',
    description: ''
  });
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order_index: 0
  });
  
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    lesson_type: 'text' as Lesson['lesson_type'],
    video_url: '',
    duration_minutes: 30,
    order_index: 0
  });

  const [showNewModule, setShowNewModule] = useState(false);
  const [showNewLesson, setShowNewLesson] = useState<string | null>(null);

  useEffect(() => {
    loadCurriculum();
  }, [clubId]);

  const loadCurriculum = async () => {
    try {
      const data = await curriculumService.getCurriculum(clubId);
      setCurriculum(data);
      if (data) {
        setCurriculumForm({
          title: data.title,
          description: data.description || ''
        });
      }
    } catch (error) {
      console.error('Failed to load curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCurriculum = async () => {
    if (!curriculumForm.title) return;
    
    const newCurriculum = await curriculumService.createCurriculum(clubId, curriculumForm);
    if (newCurriculum) {
      setCurriculum(newCurriculum);
      setEditMode(false);
    }
  };

  const handleUpdateCurriculum = async () => {
    if (!curriculum) return;
    
    const updated = await curriculumService.updateCurriculum(clubId, curriculum.id, curriculumForm);
    if (updated) {
      setCurriculum(updated);
      setEditMode(false);
    }
  };

  const handleCreateModule = async () => {
    if (!curriculum || !moduleForm.title) return;
    
    const orderIndex = curriculum.modules?.length || 0;
    const newModule = await curriculumService.createModule(curriculum.id, {
      ...moduleForm,
      order_index: orderIndex
    });
    
    if (newModule) {
      const updatedCurriculum = { ...curriculum };
      updatedCurriculum.modules = [...(curriculum.modules || []), newModule];
      setCurriculum(updatedCurriculum);
      setShowNewModule(false);
      setModuleForm({ title: '', description: '', order_index: 0 });
    }
  };

  const handleCreateLesson = async (moduleId: string) => {
    if (!lessonForm.title || !lessonForm.content) return;
    
    const module = curriculum?.modules?.find(m => m.id === moduleId);
    const orderIndex = module?.lessons?.length || 0;
    
    const newLesson = await curriculumService.createLesson(moduleId, {
      ...lessonForm,
      order_index: orderIndex
    });
    
    if (newLesson && curriculum) {
      const updatedCurriculum = { ...curriculum };
      const moduleIndex = updatedCurriculum.modules?.findIndex(m => m.id === moduleId) ?? -1;
      if (moduleIndex >= 0 && updatedCurriculum.modules) {
        if (!updatedCurriculum.modules[moduleIndex].lessons) {
          updatedCurriculum.modules[moduleIndex].lessons = [];
        }
        updatedCurriculum.modules[moduleIndex].lessons?.push(newLesson);
      }
      setCurriculum(updatedCurriculum);
      setShowNewLesson(null);
      setLessonForm({
        title: '',
        content: '',
        lesson_type: 'text',
        video_url: '',
        duration_minutes: 30,
        order_index: 0
      });
    }
  };

  const getLessonIcon = (type: Lesson['lesson_type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'assignment': return <ClipboardList className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!curriculum && !isOwner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No curriculum available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Curriculum Header */}
      {!curriculum && isOwner ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Curriculum</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={curriculumForm.title}
                onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g., Introduction to Robotics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={curriculumForm.description}
                onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Describe what students will learn..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateCurriculum}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Curriculum
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={curriculumForm.title}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg font-semibold px-3 py-2 border"
                  />
                  <textarea
                    value={curriculumForm.description}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateCurriculum}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{curriculum?.title}</h2>
                  {curriculum?.description && (
                    <p className="mt-2 text-gray-600">{curriculum.description}</p>
                  )}
                </>
              )}
            </div>
            {isOwner && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modules */}
      {curriculum && (
        <div className="space-y-4">
          {curriculum.modules?.map((module) => (
            <div key={module.id} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isOwner && <GripVertical className="w-5 h-5 text-gray-400" />}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Module {module.order_index + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lessons */}
              <div className="p-4">
                <div className="space-y-2">
                  {module.lessons?.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isOwner && <GripVertical className="w-4 h-4 text-gray-400" />}
                        <div className="flex items-center space-x-2">
                          {getLessonIcon(lesson.lesson_type)}
                          <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                          {lesson.duration_minutes && (
                            <span className="text-xs text-gray-500">({lesson.duration_minutes} min)</span>
                          )}
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add Lesson Form */}
                {isOwner && showNewLesson === module.id ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Lesson</h4>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          placeholder="Lesson title"
                        />
                      </div>
                      <div>
                        <select
                          value={lessonForm.lesson_type}
                          onChange={(e) => setLessonForm({ ...lessonForm, lesson_type: e.target.value as Lesson['lesson_type'] })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        >
                          <option value="text">Text Lesson</option>
                          <option value="video">Video Lesson</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                        </select>
                      </div>
                      {lessonForm.lesson_type === 'video' && (
                        <div>
                          <input
                            type="text"
                            value={lessonForm.video_url}
                            onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            placeholder="Video URL"
                          />
                        </div>
                      )}
                      <div>
                        <textarea
                          value={lessonForm.content}
                          onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          placeholder="Lesson content..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowNewLesson(null)}
                          className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCreateLesson(module.id)}
                          className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  isOwner && (
                    <button
                      onClick={() => setShowNewLesson(module.id)}
                      className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lesson
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          
          {/* Add Module Form */}
          {isOwner && showNewModule ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Module</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Module Title</label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g., Getting Started with Electronics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                  <textarea
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Brief description of the module..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowNewModule(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateModule}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Module
                  </button>
                </div>
              </div>
            </div>
          ) : (
            isOwner && (
              <button
                onClick={() => setShowNewModule(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Add Module</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}