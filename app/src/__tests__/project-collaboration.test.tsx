import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock project collaboration components
const MockKanbanBoard = () => {
  const [tasks, setTasks] = React.useState([
    { id: '1', title: 'Setup Database', status: 'todo', assignee: 'John' },
    { id: '2', title: 'Create API', status: 'in-progress', assignee: 'Jane' },
    { id: '3', title: 'Add Authentication', status: 'done', assignee: 'Mike' },
  ])

  const [newTask, setNewTask] = React.useState('')

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        title: newTask,
        status: 'todo',
        assignee: 'Unassigned'
      }])
      setNewTask('')
    }
  }

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  return (
    <div>
      <h1>Project Kanban Board</h1>
      
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task"
          data-testid="new-task-input"
        />
        <button onClick={addTask} data-testid="add-task">Add Task</button>
      </div>

      <div data-testid="kanban-board">
        <div data-testid="todo-column">
          <h3>To Do</h3>
          {tasks.filter(t => t.status === 'todo').map(task => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <h4>{task.title}</h4>
              <p>Assignee: {task.assignee}</p>
              <button onClick={() => moveTask(task.id, 'in-progress')}>
                Move to In Progress
              </button>
            </div>
          ))}
        </div>

        <div data-testid="in-progress-column">
          <h3>In Progress</h3>
          {tasks.filter(t => t.status === 'in-progress').map(task => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <h4>{task.title}</h4>
              <p>Assignee: {task.assignee}</p>
              <button onClick={() => moveTask(task.id, 'done')}>
                Move to Done
              </button>
            </div>
          ))}
        </div>

        <div data-testid="done-column">
          <h3>Done</h3>
          {tasks.filter(t => t.status === 'done').map(task => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <h4>{task.title}</h4>
              <p>Assignee: {task.assignee}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MockRepositoryLinker = () => {
  const [repoUrl, setRepoUrl] = React.useState('')
  const [linkedRepos, setLinkedRepos] = React.useState([
    { id: '1', name: 'frontend-app', url: 'https://github.com/user/frontend-app' },
    { id: '2', name: 'backend-api', url: 'https://github.com/user/backend-api' },
  ])

  const linkRepository = () => {
    if (repoUrl.trim()) {
      const repoName = repoUrl.split('/').pop() || 'repository'
      setLinkedRepos([...linkedRepos, {
        id: Date.now().toString(),
        name: repoName,
        url: repoUrl
      }])
      setRepoUrl('')
    }
  }

  const unlinkRepo = (repoId: string) => {
    setLinkedRepos(linkedRepos.filter(repo => repo.id !== repoId))
  }

  return (
    <div>
      <h1>Repository Linker</h1>
      
      <div>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter repository URL"
          data-testid="repo-url-input"
        />
        <button onClick={linkRepository} data-testid="link-repo">Link Repository</button>
      </div>

      <div data-testid="linked-repos">
        <h3>Linked Repositories</h3>
        {linkedRepos.map(repo => (
          <div key={repo.id} data-testid={`repo-${repo.id}`}>
            <h4>{repo.name}</h4>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.url}</a>
            <button onClick={() => unlinkRepo(repo.id)} data-testid={`unlink-${repo.id}`}>
              Unlink
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const MockCodeSnippetShare = () => {
  const [snippets, setSnippets] = React.useState([
    {
      id: '1',
      title: 'React Hook Example',
      language: 'javascript',
      code: 'const [count, setCount] = useState(0)',
      author: 'John Doe',
    },
    {
      id: '2',
      title: 'Python Function',
      language: 'python',
      code: 'def hello_world():\n    print("Hello, World!")',
      author: 'Jane Smith',
    }
  ])

  const [newSnippet, setNewSnippet] = React.useState({
    title: '',
    language: 'javascript',
    code: ''
  })

  const addSnippet = () => {
    if (newSnippet.title && newSnippet.code) {
      setSnippets([...snippets, {
        ...newSnippet,
        id: Date.now().toString(),
        author: 'Current User'
      }])
      setNewSnippet({ title: '', language: 'javascript', code: '' })
    }
  }

  return (
    <div>
      <h1>Code Snippet Sharing</h1>
      
      <div data-testid="add-snippet-form">
        <h3>Share New Snippet</h3>
        <input
          type="text"
          value={newSnippet.title}
          onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
          placeholder="Snippet title"
          data-testid="snippet-title"
        />
        
        <select
          value={newSnippet.language}
          onChange={(e) => setNewSnippet({...newSnippet, language: e.target.value})}
          data-testid="snippet-language"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="rust">Rust</option>
          <option value="typescript">TypeScript</option>
        </select>
        
        <textarea
          value={newSnippet.code}
          onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
          placeholder="Enter your code here"
          data-testid="snippet-code"
        />
        
        <button onClick={addSnippet} data-testid="add-snippet">Share Snippet</button>
      </div>

      <div data-testid="snippets-list">
        <h3>Shared Snippets</h3>
        {snippets.map(snippet => (
          <div key={snippet.id} data-testid={`snippet-${snippet.id}`}>
            <h4>{snippet.title}</h4>
            <p>Language: {snippet.language}</p>
            <p>Author: {snippet.author}</p>
            <pre data-testid={`code-${snippet.id}`}>{snippet.code}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

// Test 4: Test project collaboration features
describe('Project Collaboration', () => {
  describe('Kanban Board', () => {
    it('displays kanban board with three columns and tasks', () => {
      render(<MockKanbanBoard />)
      
      expect(screen.getByRole('heading', { name: /project kanban board/i })).toBeInTheDocument()
      
      // Check columns exist
      expect(screen.getByTestId('todo-column')).toBeInTheDocument()
      expect(screen.getByTestId('in-progress-column')).toBeInTheDocument()
      expect(screen.getByTestId('done-column')).toBeInTheDocument()
      
      // Check tasks are displayed
      expect(screen.getByText('Setup Database')).toBeInTheDocument()
      expect(screen.getByText('Create API')).toBeInTheDocument()
      expect(screen.getByText('Add Authentication')).toBeInTheDocument()
    })

    it('allows adding new tasks', async () => {
      const user = userEvent.setup()
      render(<MockKanbanBoard />)
      
      const input = screen.getByTestId('new-task-input')
      const addButton = screen.getByTestId('add-task')
      
      await user.type(input, 'Write Tests')
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('Write Tests')).toBeInTheDocument()
      })
      
      expect(input).toHaveValue('')
    })

    it('allows moving tasks between columns', async () => {
      const user = userEvent.setup()
      render(<MockKanbanBoard />)
      
      // Move "Setup Database" from todo to in-progress
      const moveButton = screen.getByText('Move to In Progress')
      await user.click(moveButton)
      
      await waitFor(() => {
        const inProgressColumn = screen.getByTestId('in-progress-column')
        expect(inProgressColumn).toHaveTextContent('Setup Database')
      })
    })
  })

  describe('Repository Linker', () => {
    it('displays existing linked repositories', () => {
      render(<MockRepositoryLinker />)
      
      expect(screen.getByRole('heading', { name: /repository linker/i })).toBeInTheDocument()
      expect(screen.getByText('frontend-app')).toBeInTheDocument()
      expect(screen.getByText('backend-api')).toBeInTheDocument()
      expect(screen.getByText('https://github.com/user/frontend-app')).toBeInTheDocument()
    })

    it('allows linking new repositories', async () => {
      const user = userEvent.setup()
      render(<MockRepositoryLinker />)
      
      const input = screen.getByTestId('repo-url-input')
      const linkButton = screen.getByTestId('link-repo')
      
      await user.type(input, 'https://github.com/user/new-project')
      await user.click(linkButton)
      
      await waitFor(() => {
        expect(screen.getByText('new-project')).toBeInTheDocument()
        expect(screen.getByText('https://github.com/user/new-project')).toBeInTheDocument()
      })
      
      expect(input).toHaveValue('')
    })

    it('allows unlinking repositories', async () => {
      const user = userEvent.setup()
      render(<MockRepositoryLinker />)
      
      const unlinkButton = screen.getByTestId('unlink-1')
      await user.click(unlinkButton)
      
      await waitFor(() => {
        expect(screen.queryByText('frontend-app')).not.toBeInTheDocument()
      })
    })
  })

  describe('Code Snippet Sharing', () => {
    it('displays existing code snippets', () => {
      render(<MockCodeSnippetShare />)
      
      expect(screen.getByRole('heading', { name: /code snippet sharing/i })).toBeInTheDocument()
      expect(screen.getByText('React Hook Example')).toBeInTheDocument()
      expect(screen.getByText('Python Function')).toBeInTheDocument()
      expect(screen.getByTestId('code-1')).toHaveTextContent('const [count, setCount] = useState(0)')
    })

    it('allows sharing new code snippets', async () => {
      const user = userEvent.setup()
      render(<MockCodeSnippetShare />)
      
      const titleInput = screen.getByTestId('snippet-title')
      const languageSelect = screen.getByTestId('snippet-language')
      const codeTextarea = screen.getByTestId('snippet-code')
      const shareButton = screen.getByTestId('add-snippet')
      
      await user.type(titleInput, 'Console Log Helper')
      await user.selectOptions(languageSelect, 'javascript')
      await user.type(codeTextarea, 'console.log("Debug:", value)')
      await user.click(shareButton)
      
      await waitFor(() => {
        expect(screen.getByText('Console Log Helper')).toBeInTheDocument()
        expect(screen.getByText('console.log("Debug:", value)')).toBeInTheDocument()
      })
      
      expect(titleInput).toHaveValue('')
      expect(codeTextarea).toHaveValue('')
    })

    it('displays snippet metadata correctly', () => {
      render(<MockCodeSnippetShare />)
      
      expect(screen.getByText('Language: javascript')).toBeInTheDocument()
      expect(screen.getByText('Language: python')).toBeInTheDocument()
      expect(screen.getByText('Author: John Doe')).toBeInTheDocument()
      expect(screen.getByText('Author: Jane Smith')).toBeInTheDocument()
    })

    it('has correct language options in dropdown', () => {
      render(<MockCodeSnippetShare />)
      
      const select = screen.getByTestId('snippet-language')
      expect(select).toContainHTML('<option value="javascript">JavaScript</option>')
      expect(select).toContainHTML('<option value="python">Python</option>')
      expect(select).toContainHTML('<option value="rust">Rust</option>')
      expect(select).toContainHTML('<option value="typescript">TypeScript</option>')
    })
  })
})