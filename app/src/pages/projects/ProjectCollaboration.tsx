import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Folder, GitBranch, Users, Calendar, CheckCircle, Circle,
  Plus, Search, Filter, Grid, List, Star, GitPullRequest,
  GitCommit, MessageSquare, Bug, Zap, FileText, Code,
  Clock, Target, Activity, TrendingUp, Archive, Settings,
  ExternalLink, Copy, Download, Upload, Play, Pause,
  MoreVertical, Edit2, Trash2, Eye, EyeOff, Lock, Unlock,
  AlertCircle, CheckSquare, Square, BarChart3, PieChart,
  Kanban, Terminal, Database, Cloud, Shield, Rocket
} from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'
import { useAuth } from '../../contexts/AuthContext'

interface Project {
  id: string
  name: string
  description: string
  repository_url?: string
  demo_url?: string
  documentation_url?: string
  owner_id: string
  owner_name: string
  club_id?: string
  club_name?: string
  visibility: 'public' | 'private' | 'club'
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
  tech_stack: string[]
  tags: string[]
  stars_count: number
  contributors_count: number
  tasks_count: number
  completed_tasks_count: number
  issues_count: number
  pull_requests_count: number
  last_activity: string
  created_at: string
  updated_at: string
  deadline?: string
}

interface Task {
  id: string
  project_id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'feature' | 'bug' | 'enhancement' | 'documentation' | 'testing'
  assignee_id?: string
  assignee_name?: string
  assignee_avatar?: string
  reporter_id: string
  reporter_name: string
  labels: string[]
  estimated_hours?: number
  logged_hours?: number
  due_date?: string
  created_at: string
  updated_at: string
  comments_count: number
  attachments_count: number
}

interface Contributor {
  id: string
  user_id: string
  project_id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'maintainer' | 'contributor' | 'viewer'
  contributions_count: number
  last_contribution?: string
  joined_at: string
}

interface Activity {
  id: string
  project_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  type: 'task_created' | 'task_completed' | 'comment' | 'commit' | 'pull_request' | 'issue'
  description: string
  metadata?: any
  created_at: string
}

interface ProjectStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_contributors: number
  total_tasks: number
  completed_tasks: number
  open_issues: number
  open_pull_requests: number
}

export default function ProjectCollaboration() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [userProjects, setUserProjects] = useState<string[]>([])
  const [starredProjects, setStarredProjects] = useState<string[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTechStack, setSelectedTechStack] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'active'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'my_projects' | 'starred' | 'archived'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [projectContributors, setProjectContributors] = useState<Contributor[]>([])

  useEffect(() => {
    fetchProjects()
    fetchUserProjects()
    fetchStarredProjects()
    fetchRecentActivities()
    fetchProjectStats()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.id)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects')
      setProjects(response.data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get('/projects/user')
      setUserProjects(response.data.project_ids || [])
    } catch (error) {
      console.error('Failed to fetch user projects:', error)
    }
  }

  const fetchStarredProjects = async () => {
    try {
      const response = await axios.get('/projects/starred')
      setStarredProjects(response.data.project_ids || [])
    } catch (error) {
      console.error('Failed to fetch starred projects:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get('/projects/activities')
      setRecentActivities(response.data.activities || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const fetchProjectStats = async () => {
    try {
      const response = await axios.get('/projects/stats')
      setProjectStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const [tasksRes, contributorsRes] = await Promise.all([
        axios.get(`/projects/${projectId}/tasks`),
        axios.get(`/projects/${projectId}/contributors`)
      ])
      setProjectTasks(tasksRes.data.tasks || [])
      setProjectContributors(contributorsRes.data.contributors || [])
    } catch (error) {
      console.error('Failed to fetch project details:', error)
    }
  }

  const handleStarProject = async (projectId: string) => {
    try {
      if (starredProjects.includes(projectId)) {
        await axios.delete(`/projects/${projectId}/star`)
        setStarredProjects(starredProjects.filter(id => id !== projectId))
        toast.success('Project unstarred')
      } else {
        await axios.post(`/projects/${projectId}/star`)
        setStarredProjects([...starredProjects, projectId])
        toast.success('Project starred')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to star project')
    }
  }

  const handleJoinProject = async (projectId: string) => {
    try {
      await axios.post(`/projects/${projectId}/join`)
      setUserProjects([...userProjects, projectId])
      toast.success('Successfully joined project!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join project')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return Zap
      case 'bug': return Bug
      case 'enhancement': return TrendingUp
      case 'documentation': return FileText
      case 'testing': return CheckSquare
      default: return Circle
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    const matchesTech = selectedTechStack === 'all' || 
                       project.tech_stack.includes(selectedTechStack)
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'my_projects' && userProjects.includes(project.id)) ||
                      (activeTab === 'starred' && starredProjects.includes(project.id)) ||
                      (activeTab === 'archived' && project.status === 'archived')
    
    return matchesSearch && matchesStatus && matchesTech && matchesTab
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stars_count - a.stars_count
      case 'active':
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const allTechStacks = Array.from(new Set(projects.flatMap(p => p.tech_stack)))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Collaboration</h1>
          <p className="mt-2 text-gray-600">Work together on coding projects with your peers</p>
        </div>
        <Link
          to="/projects/create"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Link>
      </div>

      {/* Statistics */}
      {projectStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{projectStats.total_projects}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{projectStats.active_projects}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{projectStats.total_contributors}</p>
                <p className="text-sm text-gray-600">Contributors</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {projectStats.completed_tasks}/{projectStats.total_tasks}
                </p>
                <p className="text-sm text-gray-600">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Projects', icon: Grid },
              { id: 'my_projects', label: 'My Projects', icon: Folder },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'archived', label: 'Archived', icon: Archive }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="active">Most Active</option>
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Kanban className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack</label>
              <select
                value={selectedTechStack}
                onChange={(e) => setSelectedTechStack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Technologies</option>
                {allTechStacks.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Projects</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="club">Club Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Projects View */}
      {viewMode === 'kanban' ? (
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {['planning', 'active', 'on_hold', 'completed'].map((status) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 capitalize flex items-center justify-between">
                  {status.replace('_', ' ')}
                  <span className="text-sm font-normal text-gray-500">
                    {sortedProjects.filter(p => p.status === status).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {sortedProjects
                    .filter(p => p.status === status)
                    .map((project) => {
                      const isStarred = starredProjects.includes(project.id)
                      const isMember = userProjects.includes(project.id)
                      
                      return (
                        <div key={project.id} className="bg-white rounded-lg shadow p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <button
                              onClick={() => handleStarProject(project.id)}
                              className={`${isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {project.contributors_count}
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {project.completed_tasks_count}/{project.tasks_count}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.tech_stack.slice(0, 3).map((tech, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                          
                          <Link
                            to={`/projects/${project.id}`}
                            className="w-full px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 text-center block"
                          >
                            View Project
                          </Link>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => {
            const isStarred = starredProjects.includes(project.id)
            const isMember = userProjects.includes(project.id)
            const progress = project.tasks_count > 0 
              ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
              : 0
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <Folder className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        {project.club_name && (
                          <p className="text-xs text-gray-500">{project.club_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isMember && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Member
                        </span>
                      )}
                      <button
                        onClick={() => handleStarProject(project.id)}
                        className={`${isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tech_stack.slice(0, 4).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{project.tech_stack.length - 4}
                      </span>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {project.contributors_count} contributors
                    </div>
                    <div className="flex items-center">
                      <GitBranch className="w-3 h-3 mr-1" />
                      {project.pull_requests_count} PRs
                    </div>
                    <div className="flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      {project.issues_count} issues
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="flex space-x-2">
                      {project.repository_url && (
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <GitBranch className="w-4 h-4" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(project.last_activity).toLocaleDateString()}
                    </div>
                    {isMember ? (
                      <Link
                        to={`/projects/${project.id}`}
                        className="px-4 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        Open
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoinProject(project.id)}
                        className="px-4 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {sortedProjects.map((project) => {
            const isStarred = starredProjects.includes(project.id)
            const isMember = userProjects.includes(project.id)
            const progress = project.tasks_count > 0 
              ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
              : 0
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <Folder className="w-6 h-6 text-indigo-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        {isMember && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Member
                          </span>
                        )}
                        <button
                          onClick={() => handleStarProject(project.id)}
                          className={`${isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.contributors_count} contributors
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {project.completed_tasks_count}/{project.tasks_count} tasks
                      </div>
                      <div className="flex items-center">
                        <GitBranch className="w-4 h-4 mr-1" />
                        {project.pull_requests_count} pull requests
                      </div>
                      <div className="flex items-center">
                        <Bug className="w-4 h-4 mr-1" />
                        {project.issues_count} issues
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {project.stars_count} stars
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-wrap gap-1">
                          {project.tech_stack.map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          {project.repository_url && (
                            <a
                              href={project.repository_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <GitBranch className="w-4 h-4" />
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{progress}%</p>
                          <p className="text-xs text-gray-500">Complete</p>
                        </div>
                        
                        {isMember ? (
                          <Link
                            to={`/projects/${project.id}`}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Open Project
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleJoinProject(project.id)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Join Project
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {sortedProjects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search or filters' : 'Start by creating a new project'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/projects/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Sidebar */}
      {recentActivities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="space-y-3">
              {recentActivities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-gray-600">
                      {activity.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user_name}</span>
                      {' '}{activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}