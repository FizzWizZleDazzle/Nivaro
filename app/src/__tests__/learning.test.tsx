import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock learning module components
const MockCourseCreation = () => {
  const [courseData, setCourseData] = React.useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: 'programming',
    estimatedHours: '',
  })

  const [lessons, setLessons] = React.useState<Array<{
    id: string;
    title: string;
    content: string;
    type: string;
  }>>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCourseData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addLesson = () => {
    const newLesson = {
      id: Date.now().toString(),
      title: `Lesson ${lessons.length + 1}`,
      content: '',
      type: 'text'
    }
    setLessons([...lessons, newLesson])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating course:', { courseData, lessons })
  }

  return (
    <div>
      <h1>Create New Course</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Course Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={courseData.title}
            onChange={handleInputChange}
            data-testid="course-title"
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            data-testid="course-description"
          />
        </div>

        <div>
          <label htmlFor="difficulty">Difficulty Level</label>
          <select
            id="difficulty"
            name="difficulty"
            value={courseData.difficulty}
            onChange={handleInputChange}
            data-testid="course-difficulty"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={courseData.category}
            onChange={handleInputChange}
            data-testid="course-category"
          >
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="data-science">Data Science</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimatedHours">Estimated Hours</label>
          <input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            value={courseData.estimatedHours}
            onChange={handleInputChange}
            data-testid="course-hours"
          />
        </div>

        <div data-testid="lessons-section">
          <h3>Course Lessons ({lessons.length})</h3>
          <button type="button" onClick={addLesson} data-testid="add-lesson">
            Add Lesson
          </button>
          
          {lessons.map((lesson, index) => (
            <div key={lesson.id} data-testid={`lesson-${index}`}>
              <h4>{lesson.title}</h4>
              <p>Type: {lesson.type}</p>
            </div>
          ))}
        </div>

        <button type="submit" data-testid="create-course">Create Course</button>
      </form>
    </div>
  )
}

const MockCoursesList = () => {
  const courses = [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React development',
      difficulty: 'beginner',
      category: 'programming',
      estimatedHours: 8,
      enrollments: 45,
      rating: 4.5
    },
    {
      id: '2',
      title: 'Advanced JavaScript',
      description: 'Master advanced JavaScript concepts',
      difficulty: 'advanced',
      category: 'programming',
      estimatedHours: 12,
      enrollments: 23,
      rating: 4.8
    },
    {
      id: '3',
      title: 'UI/UX Design Principles',
      description: 'Learn design fundamentals',
      difficulty: 'intermediate',
      category: 'design',
      estimatedHours: 6,
      enrollments: 67,
      rating: 4.3
    }
  ]

  const [filter, setFilter] = React.useState('all')
  const [enrolledCourses, setEnrolledCourses] = React.useState<string[]>([]);

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.category === filter)

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId])
    }
  }

  return (
    <div>
      <h1>Learning Center</h1>
      
      <div data-testid="course-filters">
        <label htmlFor="filter">Filter by Category:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-testid="category-filter"
        >
          <option value="all">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="data-science">Data Science</option>
        </select>
      </div>

      <div data-testid="courses-list">
        {filteredCourses.map(course => (
          <div key={course.id} data-testid={`course-${course.id}`}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div>
              <span>Difficulty: {course.difficulty}</span>
              <span>Category: {course.category}</span>
              <span>{course.estimatedHours} hours</span>
              <span>Rating: {course.rating}/5</span>
              <span>{course.enrollments} enrolled</span>
            </div>
            <button 
              onClick={() => enrollInCourse(course.id)}
              data-testid={`enroll-${course.id}`}
              disabled={enrolledCourses.includes(course.id)}
            >
              {enrolledCourses.includes(course.id) ? 'Enrolled' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const MockCourseViewer = () => {
  const [currentLesson, setCurrentLesson] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [completedLessons, setCompletedLessons] = React.useState<number[]>([])

  const course = {
    id: '1',
    title: 'Introduction to React',
    lessons: [
      { id: '1', title: 'What is React?', content: 'React is a JavaScript library...', type: 'text' },
      { id: '2', title: 'Components', content: 'Components are the building blocks...', type: 'text' },
      { id: '3', title: 'Props and State', content: 'Props and state manage data...', type: 'text' },
      { id: '4', title: 'Practice Exercise', content: 'Build your first component', type: 'exercise' }
    ]
  }

  const completeLesson = () => {
    if (!completedLessons.includes(currentLesson)) {
      const newCompleted = [...completedLessons, currentLesson]
      setCompletedLessons(newCompleted)
      setProgress((newCompleted.length / course.lessons.length) * 100)
    }
  }

  const nextLesson = () => {
    if (currentLesson < course.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
  }

  return (
    <div>
      <h1>{course.title}</h1>
      
      <div data-testid="progress-bar">
        <div>Progress: {Math.round(progress)}%</div>
        <div>Lesson {currentLesson + 1} of {course.lessons.length}</div>
      </div>

      <div data-testid="lesson-content">
        <h2>{course.lessons[currentLesson].title}</h2>
        <p>{course.lessons[currentLesson].content}</p>
        <span>Type: {course.lessons[currentLesson].type}</span>
        
        {completedLessons.includes(currentLesson) && (
          <div data-testid="lesson-completed">✓ Completed</div>
        )}
      </div>

      <div data-testid="lesson-navigation">
        <button 
          onClick={previousLesson}
          disabled={currentLesson === 0}
          data-testid="previous-lesson"
        >
          Previous
        </button>
        
        <button 
          onClick={completeLesson}
          data-testid="complete-lesson"
          disabled={completedLessons.includes(currentLesson)}
        >
          {completedLessons.includes(currentLesson) ? 'Completed' : 'Mark Complete'}
        </button>
        
        <button 
          onClick={nextLesson}
          disabled={currentLesson === course.lessons.length - 1}
          data-testid="next-lesson"
        >
          Next
        </button>
      </div>

      <div data-testid="course-outline">
        <h3>Course Outline</h3>
        {course.lessons.map((lesson, index) => (
          <div 
            key={lesson.id} 
            data-testid={`outline-lesson-${index}`}
            onClick={() => setCurrentLesson(index)}
            style={{ 
              cursor: 'pointer',
              fontWeight: index === currentLesson ? 'bold' : 'normal'
            }}
          >
            {completedLessons.includes(index) ? '✓' : '○'} {lesson.title}
          </div>
        ))}
      </div>
    </div>
  )
}

// Test 5: Test learning module course creation
describe('Learning Module', () => {
  describe('Course Creation', () => {
    it('renders course creation form with all fields', () => {
      render(<MockCourseCreation />)
      
      expect(screen.getByRole('heading', { name: /create new course/i })).toBeInTheDocument()
      expect(screen.getByTestId('course-title')).toBeInTheDocument()
      expect(screen.getByTestId('course-description')).toBeInTheDocument()
      expect(screen.getByTestId('course-difficulty')).toBeInTheDocument()
      expect(screen.getByTestId('course-category')).toBeInTheDocument()
      expect(screen.getByTestId('course-hours')).toBeInTheDocument()
      expect(screen.getByTestId('create-course')).toBeInTheDocument()
    })

    it('allows filling out course information', async () => {
      const user = userEvent.setup()
      render(<MockCourseCreation />)
      
      await user.type(screen.getByTestId('course-title'), 'Advanced React Patterns')
      await user.type(screen.getByTestId('course-description'), 'Learn advanced React concepts')
      await user.selectOptions(screen.getByTestId('course-difficulty'), 'advanced')
      await user.selectOptions(screen.getByTestId('course-category'), 'programming')
      await user.type(screen.getByTestId('course-hours'), '15')
      
      expect(screen.getByDisplayValue('Advanced React Patterns')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Learn advanced React concepts')).toBeInTheDocument()
      expect(screen.getByTestId('course-difficulty')).toHaveValue('advanced')
      expect(screen.getByTestId('course-category')).toHaveValue('programming')
      expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    })

    it('allows adding lessons to course', async () => {
      const user = userEvent.setup()
      render(<MockCourseCreation />)
      
      expect(screen.getByText('Course Lessons (0)')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('add-lesson'))
      
      await waitFor(() => {
        expect(screen.getByText('Course Lessons (1)')).toBeInTheDocument()
        expect(screen.getByTestId('lesson-0')).toBeInTheDocument()
        expect(screen.getByText('Lesson 1')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('add-lesson'))
      
      await waitFor(() => {
        expect(screen.getByText('Course Lessons (2)')).toBeInTheDocument()
        expect(screen.getByText('Lesson 2')).toBeInTheDocument()
      })
    })

    it('submits course creation form', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockCourseCreation />)
      
      await user.type(screen.getByTestId('course-title'), 'Test Course')
      await user.type(screen.getByTestId('course-description'), 'Test Description')
      await user.click(screen.getByTestId('create-course'))
      
      expect(consoleSpy).toHaveBeenCalledWith('Creating course:', expect.objectContaining({
        courseData: expect.objectContaining({
          title: 'Test Course',
          description: 'Test Description'
        })
      }))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Courses List and Enrollment', () => {
    it('displays list of available courses', () => {
      render(<MockCoursesList />)
      
      expect(screen.getByRole('heading', { name: /learning center/i })).toBeInTheDocument()
      expect(screen.getByText('Introduction to React')).toBeInTheDocument()
      expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument()
      expect(screen.getByText('UI/UX Design Principles')).toBeInTheDocument()
    })

    it('shows course details and metadata', () => {
      render(<MockCoursesList />)
      
      // Check for specific course details using more specific selectors
      const firstCourse = screen.getByTestId('course-1')
      expect(firstCourse).toHaveTextContent('Difficulty: beginner')
      expect(firstCourse).toHaveTextContent('Category: programming')
      expect(firstCourse).toHaveTextContent('8 hours')
      expect(firstCourse).toHaveTextContent('Rating: 4.5/5')
      expect(firstCourse).toHaveTextContent('45 enrolled')
    })

    it('allows filtering courses by category', async () => {
      const user = userEvent.setup()
      render(<MockCoursesList />)
      
      // Initially shows all courses
      expect(screen.getByTestId('course-1')).toBeInTheDocument()
      expect(screen.getByTestId('course-2')).toBeInTheDocument()
      expect(screen.getByTestId('course-3')).toBeInTheDocument()
      
      // Filter by design
      await user.selectOptions(screen.getByTestId('category-filter'), 'design')
      
      await waitFor(() => {
        expect(screen.queryByTestId('course-1')).not.toBeInTheDocument()
        expect(screen.queryByTestId('course-2')).not.toBeInTheDocument()
        expect(screen.getByTestId('course-3')).toBeInTheDocument()
      })
    })

    it('allows enrolling in courses', async () => {
      const user = userEvent.setup()
      render(<MockCoursesList />)
      
      const enrollButton = screen.getByTestId('enroll-1')
      expect(enrollButton).toHaveTextContent('Enroll')
      expect(enrollButton).not.toBeDisabled()
      
      await user.click(enrollButton)
      
      await waitFor(() => {
        expect(enrollButton).toHaveTextContent('Enrolled')
        expect(enrollButton).toBeDisabled()
      })
    })
  })

  describe('Course Viewer and Progress', () => {
    it('displays course content and navigation', () => {
      render(<MockCourseViewer />)
      
      expect(screen.getByRole('heading', { name: /introduction to react/i })).toBeInTheDocument()
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument()
      expect(screen.getByText('Lesson 1 of 4')).toBeInTheDocument()
      expect(screen.getByText('What is React?')).toBeInTheDocument()
      expect(screen.getByText('React is a JavaScript library...')).toBeInTheDocument()
    })

    it('allows navigating between lessons', async () => {
      const user = userEvent.setup()
      render(<MockCourseViewer />)
      
      expect(screen.getByText('What is React?')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('next-lesson'))
      
      await waitFor(() => {
        expect(screen.getByText('Components')).toBeInTheDocument()
        expect(screen.getByText('Lesson 2 of 4')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('previous-lesson'))
      
      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument()
        expect(screen.getByText('Lesson 1 of 4')).toBeInTheDocument()
      })
    })

    it('allows marking lessons as complete and tracks progress', async () => {
      const user = userEvent.setup()
      render(<MockCourseViewer />)
      
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('complete-lesson'))
      
      await waitFor(() => {
        expect(screen.getByTestId('lesson-completed')).toBeInTheDocument()
        expect(screen.getByText('Progress: 25%')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })

    it('displays course outline with completion status', async () => {
      const user = userEvent.setup()
      render(<MockCourseViewer />)
      
      expect(screen.getByText('Course Outline')).toBeInTheDocument()
      expect(screen.getByText('○ What is React?')).toBeInTheDocument()
      expect(screen.getByText('○ Components')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('complete-lesson'))
      
      await waitFor(() => {
        expect(screen.getByText('✓ What is React?')).toBeInTheDocument()
      })
    })

    it('allows jumping to lessons from outline', async () => {
      const user = userEvent.setup()
      render(<MockCourseViewer />)
      
      expect(screen.getByText('What is React?')).toBeInTheDocument()
      
      await user.click(screen.getByTestId('outline-lesson-2'))
      
      await waitFor(() => {
        expect(screen.getByText('Props and State')).toBeInTheDocument()
        expect(screen.getByText('Lesson 3 of 4')).toBeInTheDocument()
      })
    })
  })
})