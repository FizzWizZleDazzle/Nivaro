import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Test 1: Verify all navigation links work from home page
describe('Navigation Links', () => {
  it('renders all navigation links on home page', () => {
    render(<Home />)
    
    // Check main heading
    expect(screen.getByRole('heading', { name: /nivaro/i })).toBeInTheDocument()
    expect(screen.getByText('Club Management Made Simple')).toBeInTheDocument()
    
    // Check getting started links
    expect(screen.getByRole('link', { name: /create a club/i })).toHaveAttribute('href', '/onboarding/create')
    expect(screen.getByRole('link', { name: /join with invite code/i })).toHaveAttribute('href', '/onboarding/join')
    
    // Check quick links
    expect(screen.getByRole('link', { name: /view meetings & events/i })).toHaveAttribute('href', '/meetings')
    expect(screen.getByRole('link', { name: /project & code collaboration/i })).toHaveAttribute('href', '/project-collaboration')
    expect(screen.getByRole('link', { name: /learning center/i })).toHaveAttribute('href', '/learning')
    expect(screen.getByRole('link', { name: /help & mentorship forum/i })).toHaveAttribute('href', '/forum')
    expect(screen.getByRole('link', { name: /announcements & notifications/i })).toHaveAttribute('href', '/announcements')
    expect(screen.getByRole('link', { name: /view demo club/i })).toHaveAttribute('href', '/club/club-1')
  })

  it('has proper styling classes for navigation links', () => {
    render(<Home />)
    
    const createClubLink = screen.getByRole('link', { name: /create a club/i })
    expect(createClubLink).toHaveClass('bg-blue-600', 'text-white')
    
    const meetingsLink = screen.getByRole('link', { name: /view meetings & events/i })
    expect(meetingsLink).toHaveClass('bg-green-600', 'text-white')
    
    const projectLink = screen.getByRole('link', { name: /project & code collaboration/i })
    expect(projectLink).toHaveClass('bg-purple-600', 'text-white')
  })
})