import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock forum components
const MockForumQuestions = () => {
  const [questions] = React.useState([
    {
      id: '1',
      title: 'How to handle state in React?',
      content: 'I am struggling with state management in my React application...',
      author: 'John Doe',
      tags: ['react', 'state', 'javascript'],
      createdAt: '2024-01-15T10:00:00Z',
      answers: 3,
      votes: 5,
      views: 42
    },
    {
      id: '2',
      title: 'Best practices for API design',
      content: 'What are the best practices when designing REST APIs?',
      author: 'Jane Smith',
      tags: ['api', 'rest', 'backend'],
      createdAt: '2024-01-14T15:30:00Z',
      answers: 1,
      votes: 8,
      views: 67
    },
    {
      id: '3',
      title: 'Python vs JavaScript for beginners',
      content: 'Which language should I learn first as a beginner?',
      author: 'Mike Johnson',
      tags: ['python', 'javascript', 'beginner'],
      createdAt: '2024-01-13T09:15:00Z',
      answers: 7,
      votes: 12,
      views: 156
    }
  ])

  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTag, setSelectedTag] = React.useState('')

  const allTags = [...new Set(questions.flatMap(q => q.tags))]

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || question.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div>
      <h1>Help & Mentorship Forum</h1>
      
      <div data-testid="forum-filters">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="search-input"
        />
        
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          data-testid="tag-filter"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div data-testid="questions-list">
        {filteredQuestions.map(question => (
          <div key={question.id} data-testid={`question-${question.id}`}>
            <h3>{question.title}</h3>
            <p>{question.content}</p>
            <div>
              <span>By: {question.author}</span>
              <span>{question.answers} answers</span>
              <span>{question.votes} votes</span>
              <span>{question.views} views</span>
            </div>
            <div data-testid={`tags-${question.id}`}>
              {question.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div data-testid="no-results">No questions found matching your criteria.</div>
      )}
    </div>
  )
}

const MockAskQuestion = () => {
  const [questionData, setQuestionData] = React.useState({
    title: '',
    content: '',
    tags: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuestionData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = questionData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    console.log('Posting question:', { ...questionData, tags: tagsArray })
  }

  return (
    <div>
      <h1>Ask a Question</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Question Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={questionData.title}
            onChange={handleInputChange}
            placeholder="What's your question?"
            data-testid="question-title"
            required
          />
        </div>

        <div>
          <label htmlFor="content">Question Details</label>
          <textarea
            id="content"
            name="content"
            value={questionData.content}
            onChange={handleInputChange}
            placeholder="Provide more details about your question..."
            data-testid="question-content"
            rows={6}
            required
          />
        </div>

        <div>
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={questionData.tags}
            onChange={handleInputChange}
            placeholder="e.g., javascript, react, help"
            data-testid="question-tags"
          />
          <small>Use tags to help others find your question</small>
        </div>

        <button type="submit" data-testid="post-question">Post Question</button>
      </form>
    </div>
  )
}

const MockQuestionDetail = () => {
  const [question] = React.useState({
    id: '1',
    title: 'How to handle state in React?',
    content: 'I am struggling with state management in my React application. I have been using useState but I think I need something more complex for my app. Should I use Redux or Context API?',
    author: 'John Doe',
    tags: ['react', 'state', 'javascript'],
    createdAt: '2024-01-15T10:00:00Z',
    votes: 5,
    views: 42
  })

  const [answers, setAnswers] = React.useState([
    {
      id: '1',
      content: 'For most cases, React Context API is sufficient. Redux adds complexity...',
      author: 'Jane Smith',
      createdAt: '2024-01-15T11:00:00Z',
      votes: 3,
      accepted: true
    },
    {
      id: '2',
      content: 'Consider using Zustand as a lighter alternative to Redux...',
      author: 'Mike Johnson',
      createdAt: '2024-01-15T12:00:00Z',
      votes: 2,
      accepted: false
    }
  ])

  const [newAnswer, setNewAnswer] = React.useState('')
  const [questionVotes, setQuestionVotes] = React.useState(question.votes)

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAnswer.trim()) {
      const answer = {
        id: Date.now().toString(),
        content: newAnswer,
        author: 'Current User',
        createdAt: new Date().toISOString(),
        votes: 0,
        accepted: false
      }
      setAnswers([...answers, answer])
      setNewAnswer('')
      console.log('Posted answer:', answer)
    }
  }

  const voteOnQuestion = (direction: 'up' | 'down') => {
    setQuestionVotes(prev => direction === 'up' ? prev + 1 : prev - 1)
    console.log(`Voted ${direction} on question`)
  }

  const toggleAcceptAnswer = (answerId: string) => {
    setAnswers(answers.map(answer => ({
      ...answer,
      accepted: answer.id === answerId ? !answer.accepted : false
    })))
  }

  return (
    <div>
      <div data-testid="question-detail">
        <h1>{question.title}</h1>
        <p>{question.content}</p>
        
        <div data-testid="question-meta">
          <span>Asked by: {question.author}</span>
          <span>{question.views} views</span>
          <div data-testid="question-tags">
            {question.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div data-testid="question-voting">
          <button onClick={() => voteOnQuestion('up')} data-testid="vote-up">
            ↑
          </button>
          <span data-testid="vote-count">{questionVotes}</span>
          <button onClick={() => voteOnQuestion('down')} data-testid="vote-down">
            ↓
          </button>
        </div>
      </div>

      <div data-testid="answers-section">
        <h2>{answers.length} Answers</h2>
        
        {answers.map(answer => (
          <div key={answer.id} data-testid={`answer-${answer.id}`}>
            <div>{answer.content}</div>
            <div>
              <span>By: {answer.author}</span>
              <span>{answer.votes} votes</span>
              {answer.accepted && (
                <span data-testid={`accepted-${answer.id}`}>✓ Accepted</span>
              )}
            </div>
            <button 
              onClick={() => toggleAcceptAnswer(answer.id)}
              data-testid={`accept-${answer.id}`}
            >
              {answer.accepted ? 'Remove Accept' : 'Accept Answer'}
            </button>
          </div>
        ))}
      </div>

      <div data-testid="answer-form">
        <h3>Your Answer</h3>
        <form onSubmit={handleAnswerSubmit}>
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer here..."
            data-testid="answer-textarea"
            rows={4}
            required
          />
          <button type="submit" data-testid="post-answer">Post Answer</button>
        </form>
      </div>
    </div>
  )
}

// Test 6: Test forum question posting and answering
describe('Forum', () => {
  describe('Questions List and Search', () => {
    it('displays list of forum questions with metadata', () => {
      render(<MockForumQuestions />)
      
      expect(screen.getByRole('heading', { name: /help & mentorship forum/i })).toBeInTheDocument()
      expect(screen.getByText('How to handle state in React?')).toBeInTheDocument()
      expect(screen.getByText('Best practices for API design')).toBeInTheDocument()
      expect(screen.getByText('Python vs JavaScript for beginners')).toBeInTheDocument()
      
      // Check metadata
      expect(screen.getByText('3 answers')).toBeInTheDocument()
      expect(screen.getByText('5 votes')).toBeInTheDocument()
      expect(screen.getByText('42 views')).toBeInTheDocument()
    })

    it('displays question tags', () => {
      render(<MockForumQuestions />)
      
      expect(screen.getByTestId('tags-1')).toHaveTextContent('reactstatejavascript')
      expect(screen.getByTestId('tags-2')).toHaveTextContent('apirestbackend')
      expect(screen.getByTestId('tags-3')).toHaveTextContent('pythonjavascriptbeginner')
    })

    it('allows searching questions by title and content', async () => {
      const user = userEvent.setup()
      render(<MockForumQuestions />)
      
      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'react')
      
      await waitFor(() => {
        expect(screen.getByTestId('question-1')).toBeInTheDocument()
        expect(screen.queryByTestId('question-2')).not.toBeInTheDocument()
        expect(screen.queryByTestId('question-3')).not.toBeInTheDocument()
      })
    })

    it('allows filtering questions by tags', async () => {
      const user = userEvent.setup()
      render(<MockForumQuestions />)
      
      const tagFilter = screen.getByTestId('tag-filter')
      
      await user.selectOptions(tagFilter, 'javascript')
      
      await waitFor(() => {
        expect(screen.getByTestId('question-1')).toBeInTheDocument()
        expect(screen.queryByTestId('question-2')).not.toBeInTheDocument()
        expect(screen.getByTestId('question-3')).toBeInTheDocument()
      })
    })

    it('shows no results message when no questions match', async () => {
      const user = userEvent.setup()
      render(<MockForumQuestions />)
      
      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'nonexistent search term')
      
      await waitFor(() => {
        expect(screen.getByTestId('no-results')).toBeInTheDocument()
        expect(screen.getByText('No questions found matching your criteria.')).toBeInTheDocument()
      })
    })
  })

  describe('Question Posting', () => {
    it('renders question posting form', () => {
      render(<MockAskQuestion />)
      
      expect(screen.getByRole('heading', { name: /ask a question/i })).toBeInTheDocument()
      expect(screen.getByTestId('question-title')).toBeInTheDocument()
      expect(screen.getByTestId('question-content')).toBeInTheDocument()
      expect(screen.getByTestId('question-tags')).toBeInTheDocument()
      expect(screen.getByTestId('post-question')).toBeInTheDocument()
    })

    it('allows filling out question form', async () => {
      const user = userEvent.setup()
      render(<MockAskQuestion />)
      
      await user.type(screen.getByTestId('question-title'), 'How to center a div?')
      await user.type(screen.getByTestId('question-content'), 'I have been trying to center a div element but nothing works...')
      await user.type(screen.getByTestId('question-tags'), 'css, html, styling')
      
      expect(screen.getByDisplayValue('How to center a div?')).toBeInTheDocument()
      expect(screen.getByDisplayValue('I have been trying to center a div element but nothing works...')).toBeInTheDocument()
      expect(screen.getByDisplayValue('css, html, styling')).toBeInTheDocument()
    })

    it('submits question with parsed tags', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockAskQuestion />)
      
      await user.type(screen.getByTestId('question-title'), 'Test Question')
      await user.type(screen.getByTestId('question-content'), 'Test content')
      await user.type(screen.getByTestId('question-tags'), 'tag1, tag2, tag3')
      await user.click(screen.getByTestId('post-question'))
      
      expect(consoleSpy).toHaveBeenCalledWith('Posting question:', {
        title: 'Test Question',
        content: 'Test content',
        tags: ['tag1', 'tag2', 'tag3']
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Question Detail and Answers', () => {
    it('displays question details with voting and answers', () => {
      render(<MockQuestionDetail />)
      
      expect(screen.getByRole('heading', { name: /how to handle state in react/i })).toBeInTheDocument()
      expect(screen.getByText(/i am struggling with state management/i)).toBeInTheDocument()
      expect(screen.getByText('Asked by: John Doe')).toBeInTheDocument()
      expect(screen.getByText('42 views')).toBeInTheDocument()
      
      // Check voting
      expect(screen.getByTestId('vote-count')).toHaveTextContent('5')
      expect(screen.getByTestId('vote-up')).toBeInTheDocument()
      expect(screen.getByTestId('vote-down')).toBeInTheDocument()
      
      // Check answers
      expect(screen.getByRole('heading', { name: /2 answers/i })).toBeInTheDocument()
      expect(screen.getByText(/for most cases, react context api/i)).toBeInTheDocument()
      expect(screen.getByText(/consider using zustand/i)).toBeInTheDocument()
    })

    it('allows voting on questions', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockQuestionDetail />)
      
      expect(screen.getByTestId('vote-count')).toHaveTextContent('5')
      
      await user.click(screen.getByTestId('vote-up'))
      
      await waitFor(() => {
        expect(screen.getByTestId('vote-count')).toHaveTextContent('6')
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Voted up on question')
      
      consoleSpy.mockRestore()
    })

    it('shows accepted answers with checkmark', () => {
      render(<MockQuestionDetail />)
      
      expect(screen.getByTestId('accepted-1')).toBeInTheDocument()
      expect(screen.getByTestId('accepted-1')).toHaveTextContent('✓ Accepted')
    })

    it('allows posting new answers', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockQuestionDetail />)
      
      const textarea = screen.getByTestId('answer-textarea')
      
      await user.type(textarea, 'You could also try using useReducer for complex state logic...')
      await user.click(screen.getByTestId('post-answer'))
      
      await waitFor(() => {
        expect(screen.getByText(/you could also try using usereducer/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /3 answers/i })).toBeInTheDocument()
      })
      
      expect(textarea).toHaveValue('')
      expect(consoleSpy).toHaveBeenCalledWith('Posted answer:', expect.objectContaining({
        content: 'You could also try using useReducer for complex state logic...',
        author: 'Current User'
      }))
      
      consoleSpy.mockRestore()
    })

    it('allows accepting and unaccepting answers', async () => {
      const user = userEvent.setup()
      render(<MockQuestionDetail />)
      
      // First answer is already accepted
      expect(screen.getByTestId('accepted-1')).toBeInTheDocument()
      
      // Accept second answer
      await user.click(screen.getByTestId('accept-2'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('accepted-1')).not.toBeInTheDocument()
        expect(screen.getByTestId('accepted-2')).toBeInTheDocument()
      })
      
      // Unaccept second answer
      await user.click(screen.getByTestId('accept-2'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('accepted-2')).not.toBeInTheDocument()
      })
    })
  })
})