import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, Video, FileText, Code, Award, Clock, 
  Users, Star, Play, Lock, CheckCircle, Circle,
  Filter, Search, Grid, List, TrendingUp, Download,
  BarChart, Target, Zap, Heart, Bookmark, Share2,
  ChevronRight, ChevronDown, Plus, Edit, Trash2
} from 'lucide-react'
import axios from '../../config/api'
import { toast } from '../../components/ui/Toaster'
import { useAuth } from '../../contexts/AuthContext'

interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  instructor_id: string
  instructor_name: string
  instructor_avatar?: string
  category: 'web' | 'mobile' | 'backend' | 'devops' | 'ai' | 'blockchain' | 'security' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  lessons_count: number
  enrolled_count: number
  rating: number
  reviews_count: number
  price: number
  is_free: boolean
  is_published: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  order: number
  duration_minutes: number
  type: 'video' | 'article' | 'quiz' | 'exercise'
  is_preview: boolean
  content_url?: string
  resources?: Resource[]
}

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'code' | 'link' | 'download'
  url: string
  size?: string
}

interface UserProgress {
  course_id: string
  completed_lessons: string[]
  current_lesson_id?: string
  progress_percentage: number
  started_at: string
  last_accessed: string
  completed_at?: string
  certificate_url?: string
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  estimated_duration: number
  difficulty: string
  career_focus: string
}

export default function Learning() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'paths' | 'certificates'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [savedCourses, setSavedCourses] = useState<string[]>([])

  useEffect(() => {
    fetchCourses()
    fetchEnrolledCourses()
    fetchUserProgress()
    fetchLearningPaths()
    fetchSavedCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses')
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get('/courses/enrolled')
      setEnrolledCourses(response.data.course_ids || [])
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error)
    }
  }

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get('/courses/progress')
      setUserProgress(response.data.progress || [])
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const fetchLearningPaths = async () => {
    try {
      const response = await axios.get('/learning-paths')
      setLearningPaths(response.data.paths || [])
    } catch (error) {
      console.error('Failed to fetch learning paths:', error)
    }
  }

  const fetchSavedCourses = async () => {
    try {
      const response = await axios.get('/courses/saved')
      setSavedCourses(response.data.course_ids || [])
    } catch (error) {
      console.error('Failed to fetch saved courses:', error)
    }
  }

  const handleEnrollCourse = async (courseId: string) => {
    try {
      await axios.post(`/courses/${courseId}/enroll`)
      setEnrolledCourses([...enrolledCourses, courseId])
      toast.success('Successfully enrolled in course!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to enroll in course')
    }
  }

  const handleSaveCourse = async (courseId: string) => {
    try {
      if (savedCourses.includes(courseId)) {
        await axios.delete(`/courses/${courseId}/save`)
        setSavedCourses(savedCourses.filter(id => id !== courseId))
        toast.success('Course removed from saved')
      } else {
        await axios.post(`/courses/${courseId}/save`)
        setSavedCourses([...savedCourses, courseId])
        toast.success('Course saved for later')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save course')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return Code
      case 'mobile': return Code
      case 'backend': return Code
      case 'devops': return Code
      case 'ai': return Zap
      case 'blockchain': return Code
      case 'security': return Lock
      default: return BookOpen
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'enrolled' && enrolledCourses.includes(course.id))
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesTab
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'popular':
      default:
        return b.enrolled_count - a.enrolled_count
    }
  })

  const getProgressForCourse = (courseId: string) => {
    return userProgress.find(p => p.course_id === courseId)
  }

  const categories = [
    { value: 'all', label: 'All Categories', icon: Grid },
    { value: 'web', label: 'Web Development', icon: Code },
    { value: 'mobile', label: 'Mobile Development', icon: Code },
    { value: 'backend', label: 'Backend Development', icon: Code },
    { value: 'devops', label: 'DevOps', icon: Code },
    { value: 'ai', label: 'AI & Machine Learning', icon: Zap },
    { value: 'blockchain', label: 'Blockchain', icon: Code },
    { value: 'security', label: 'Security', icon: Lock }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
          <p className="mt-2 text-gray-600">Expand your coding skills with our curated courses</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/learning/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {userProgress.filter(p => p.completed_at).length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {userProgress.filter(p => !p.completed_at).length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Courses', icon: Grid },
              { id: 'enrolled', label: 'My Courses', icon: BookOpen },
              { id: 'paths', label: 'Learning Paths', icon: Target },
              { id: 'certificates', label: 'Certificates', icon: Award }
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
      {activeTab !== 'certificates' && activeTab !== 'paths' && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
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
                <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
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
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'paths' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <div key={path.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                    <p className="text-sm text-gray-600">{path.career_focus}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{path.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {path.courses.length} courses
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {path.estimated_duration} hours
                </div>
              </div>
              
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Start Learning Path
              </button>
            </div>
          ))}
        </div>
      ) : activeTab === 'certificates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProgress.filter(p => p.certificate_url).map((progress) => {
            const course = courses.find(c => c.id === progress.course_id)
            if (!course) return null
            
            return (
              <div key={progress.course_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center">
                    <Award className="w-10 h-10 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-center text-gray-600 mb-4">
                  Completed on {new Date(progress.completed_at!).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <a
                    href={progress.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    Download
                  </a>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedCourses.map((course) => {
            const progress = getProgressForCourse(course.id)
            const isEnrolled = enrolledCourses.includes(course.id)
            const isSaved = savedCourses.includes(course.id)
            const CategoryIcon = getCategoryIcon(course.category)
            
            if (viewMode === 'grid') {
              return (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-16 h-16 text-white opacity-50" />
                    </div>
                    {isEnrolled && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Enrolled
                      </div>
                    )}
                    {course.is_free && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Free
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                      <button
                        onClick={() => handleSaveCourse(course.id)}
                        className={`ml-2 ${isSaved ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {isSaved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    
                    {/* Progress Bar */}
                    {progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrolled_count}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration_hours}h
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {course.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{course.lessons_count} lessons</span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">{course.instructor_name}</span>
                    </div>
                    
                    {isEnrolled ? (
                      <Link
                        to={`/learning/course/${course.id}`}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                      >
                        {progress && !progress.completed_at ? (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Continue Learning
                          </>
                        ) : progress?.completed_at ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Review Course
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Course
                          </>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        {course.is_free ? 'Enroll for Free' : `Enroll - $${course.price}`}
                      </button>
                    )}
                  </div>
                </div>
              )
            } else {
              // List View
              return (
                <div key={course.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex">
                    <div className="w-48 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-6">
                      <CategoryIcon className="w-12 h-12 text-white opacity-50" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isEnrolled && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Enrolled
                            </span>
                          )}
                          {course.is_free && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Free
                            </span>
                          )}
                          <button
                            onClick={() => handleSaveCourse(course.id)}
                            className={`${isSaved ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {isSaved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.enrolled_count} students
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.duration_hours} hours
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.lessons_count} lessons
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          {course.rating.toFixed(1)} ({course.reviews_count} reviews)
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{course.instructor_name}</p>
                            <p className="text-xs text-gray-500">Instructor</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {progress && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{progress.progress_percentage}%</p>
                              <p className="text-xs text-gray-500">Complete</p>
                            </div>
                          )}
                          
                          {isEnrolled ? (
                            <Link
                              to={`/learning/course/${course.id}`}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                            >
                              <Play className="w-5 h-5 mr-2" />
                              Continue
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleEnrollCourse(course.id)}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              {course.is_free ? 'Enroll for Free' : `Enroll - $${course.price}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}
      
      {sortedCourses.length === 0 && activeTab !== 'certificates' && activeTab !== 'paths' && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search or filters' : 'Be the first to create a course'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/learning/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}