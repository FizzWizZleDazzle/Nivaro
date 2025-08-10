import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Landing Page', () => {
  it('renders hero section with main heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Transform Your Club Management');
  });

  it('renders key features section', () => {
    render(<Home />);
    
    const featuresHeading = screen.getByRole('heading', { 
      name: /everything your club needs in one place/i 
    });
    expect(featuresHeading).toBeInTheDocument();
    
    // Check for individual feature cards
    expect(screen.getByText('Smart Meeting Management')).toBeInTheDocument();
    expect(screen.getByText('Project Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Learning Center')).toBeInTheDocument();
    expect(screen.getByText('Help & Mentorship')).toBeInTheDocument();
    expect(screen.getByText('Smart Announcements')).toBeInTheDocument();
    expect(screen.getByText('Club Management')).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    render(<Home />);
    
    const testimonialsHeading = screen.getByRole('heading', { 
      name: /trusted by clubs worldwide/i 
    });
    expect(testimonialsHeading).toBeInTheDocument();
    
    // Check for testimonial content
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('Dr. Emily Johnson')).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<Home />);
    
    const startButton = screen.getByRole('link', { 
      name: /start creating your club/i 
    });
    const joinButton = screen.getByRole('link', { 
      name: /join an existing club/i 
    });
    
    expect(startButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
    expect(startButton).toHaveAttribute('href', '/onboarding/create');
    expect(joinButton).toHaveAttribute('href', '/onboarding/join');
  });

  it('renders footer with navigation links', () => {
    render(<Home />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    
    // Check for footer navigation sections
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    
    // Check for footer links by text content since there are multiple "Meetings" links
    const footerLinks = screen.getAllByText('Meetings');
    expect(footerLinks.length).toBeGreaterThan(0);
    
    const collaborationLinks = screen.getAllByText('Collaboration');
    expect(collaborationLinks.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(<Home />);
    
    // Check for ARIA landmarks
    expect(screen.getByLabelText('Hero section')).toBeInTheDocument();
    expect(screen.getByLabelText('Key features')).toBeInTheDocument();
    expect(screen.getByLabelText('Testimonials')).toBeInTheDocument();
    expect(screen.getByLabelText('Call to action')).toBeInTheDocument();
    
    // Check for proper heading structure - there are 13 headings total
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(10); // Ensure we have a good number of headings
  });
});