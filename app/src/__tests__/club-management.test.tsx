import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the club management pages
const MockCreateClubPage = () => {
  const [clubName, setClubName] = React.useState('')
  const [description, setDescription] = React.useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock API call
    console.log('Creating club:', { clubName, description })
  }

  return (
    <div>
      <h1>Create Your Club</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="club-name">Club Name</label>
          <input
            id="club-name"
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Enter your club name"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your club"
          />
        </div>
        <button type="submit">Create Club</button>
      </form>
    </div>
  )
}

const MockJoinClubPage = () => {
  const [inviteCode, setInviteCode] = React.useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock API call
    console.log('Joining club with code:', inviteCode)
  }

  return (
    <div>
      <h1>Join a Club</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="invite-code">Invite Code</label>
          <input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
          />
        </div>
        <button type="submit">Join Club</button>
      </form>
    </div>
  )
}

import React from 'react'

// Test 2: Test club creation and member management
describe('Club Management', () => {
  describe('Club Creation', () => {
    it('renders club creation form with all required fields', () => {
      render(<MockCreateClubPage />)
      
      expect(screen.getByRole('heading', { name: /create your club/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/club name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create club/i })).toBeInTheDocument()
    })

    it('allows user to input club details', async () => {
      const user = userEvent.setup()
      render(<MockCreateClubPage />)
      
      const nameInput = screen.getByLabelText(/club name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(nameInput, 'Tech Club')
      await user.type(descriptionInput, 'A club for technology enthusiasts')
      
      expect(nameInput).toHaveValue('Tech Club')
      expect(descriptionInput).toHaveValue('A club for technology enthusiasts')
    })

    it('submits club creation form with correct data', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockCreateClubPage />)
      
      await user.type(screen.getByLabelText(/club name/i), 'Tech Club')
      await user.type(screen.getByLabelText(/description/i), 'A tech club')
      await user.click(screen.getByRole('button', { name: /create club/i }))
      
      expect(consoleSpy).toHaveBeenCalledWith('Creating club:', {
        clubName: 'Tech Club',
        description: 'A tech club'
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Member Management - Joining Club', () => {
    it('renders join club form with invite code field', () => {
      render(<MockJoinClubPage />)
      
      expect(screen.getByRole('heading', { name: /join a club/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /join club/i })).toBeInTheDocument()
    })

    it('allows user to input invite code', async () => {
      const user = userEvent.setup()
      render(<MockJoinClubPage />)
      
      const inviteCodeInput = screen.getByLabelText(/invite code/i)
      
      await user.type(inviteCodeInput, 'TECH2024')
      
      expect(inviteCodeInput).toHaveValue('TECH2024')
    })

    it('submits join form with correct invite code', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<MockJoinClubPage />)
      
      await user.type(screen.getByLabelText(/invite code/i), 'TECH2024')
      await user.click(screen.getByRole('button', { name: /join club/i }))
      
      expect(consoleSpy).toHaveBeenCalledWith('Joining club with code:', 'TECH2024')
      
      consoleSpy.mockRestore()
    })
  })
})