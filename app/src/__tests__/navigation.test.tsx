import { render, screen } from '@testing-library/react'
import Home from '../app/(marketing)/page'

// Test 1: Verify all navigation links work from home page
describe('Navigation Links', () => {
  it('renders all navigation links on home page', () => {
    render(<Home />)
    
    // Check main heading
    expect(screen.getByRole('heading', { name: /transform your club management made simple/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Made Simple')).toBeInTheDocument()
    
    // Check main action buttons
    expect(screen.getByRole('link', { name: /start creating your club/i })).toHaveAttribute('href', '/onboarding/create')
    expect(screen.getByRole('link', { name: /join an existing club/i })).toHaveAttribute('href', '/onboarding/join')
    
    // Check feature section links
    expect(screen.getByRole('link', { name: /explore meetings/i })).toHaveAttribute('href', '/meetings')
    expect(screen.getByRole('link', { name: /start collaborating/i })).toHaveAttribute('href', '/project-collaboration')
    expect(screen.getByRole('link', { name: /explore learning/i })).toHaveAttribute('href', '/learning')
    expect(screen.getByRole('link', { name: /join forum/i })).toHaveAttribute('href', '/forum')
    expect(screen.getByRole('link', { name: /view announcements/i })).toHaveAttribute('href', '/announcements')
    expect(screen.getByRole('link', { name: /explore demo/i })).toHaveAttribute('href', '/club/club-1')
  })

  it('has proper styling classes for navigation links', () => {
    render(<Home />)
    
    const createClubLink = screen.getByRole('link', { name: /start creating your club/i })
    expect(createClubLink).toHaveClass('bg-blue-600', 'text-white')
    
    const joinClubLink = screen.getByRole('link', { name: /join an existing club/i })
    expect(joinClubLink).toHaveClass('border-2', 'border-blue-600', 'text-blue-600')
    
    const meetingsLink = screen.getByRole('link', { name: /explore meetings/i })
    expect(meetingsLink).toHaveClass('text-green-600')
    
    const projectLink = screen.getByRole('link', { name: /start collaborating/i })
    expect(projectLink).toHaveClass('text-purple-600')
  })
})