import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLanding from '../app/onboarding/page';
import ProfileSetup from '../app/onboarding/profile/page';
import OnboardingTour from '../app/onboarding/tour/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('Onboarding Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => null),
      getAll: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      forEach: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    });
  });

  describe('Onboarding Landing Page', () => {
    it('renders welcome screen with platform features', () => {
      render(<OnboardingLanding />);
      
      expect(screen.getByText('Welcome to Nivaro')).toBeInTheDocument();
      expect(screen.getByText('Your all-in-one platform for club management and community building')).toBeInTheDocument();
      expect(screen.getByText('Organize Meetings & Events')).toBeInTheDocument();
      expect(screen.getByText('Collaborate on Projects')).toBeInTheDocument();
      expect(screen.getByText('Learn & Grow')).toBeInTheDocument();
      expect(screen.getByText('Stay Connected')).toBeInTheDocument();
    });

    it('shows onboarding options after getting started', () => {
      render(<OnboardingLanding />);
      
      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);
      
      expect(screen.getByText('Let\'s Set You Up')).toBeInTheDocument();
      expect(screen.getByText('Join an Existing Club')).toBeInTheDocument();
      expect(screen.getByText('Create Your Own Club')).toBeInTheDocument();
      expect(screen.getByText('Just Exploring')).toBeInTheDocument();
    });

    it('has links to profile setup with correct flow parameters', () => {
      render(<OnboardingLanding />);
      
      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);
      
      const joinLink = screen.getByText('Join with Invite Code').closest('a');
      const createLink = screen.getByText('Create New Club').closest('a');
      const tourLink = screen.getByText('Take a Tour').closest('a');
      
      expect(joinLink).toHaveAttribute('href', '/onboarding/profile?flow=join');
      expect(createLink).toHaveAttribute('href', '/onboarding/profile?flow=create');
      expect(tourLink).toHaveAttribute('href', '/onboarding/tour');
    });

    it('displays progress indicator correctly', () => {
      render(<OnboardingLanding />);
      
      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);
      
      // Check for progress indicator elements
      const progressIndicators = screen.getAllByText('1');
      expect(progressIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Profile Setup Page', () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key: string) => key === 'flow' ? 'join' : null),
        getAll: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        toString: jest.fn(),
        size: 0,
        [Symbol.iterator]: jest.fn(),
      });
    });

    it('renders profile setup form with all fields', () => {
      render(<ProfileSetup />);
      
      expect(screen.getByText('Before You Join')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Programming Experience Level')).toBeInTheDocument();
      expect(screen.getByText('Interests & Skills (select all that apply)')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Bio (Optional)')).toBeInTheDocument();
    });

    it('handles form submission and redirects based on flow', async () => {
      render(<ProfileSetup />);
      
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'john@example.com' }
      });
      
      // Submit form
      const submitButton = screen.getByText('Continue to Join Club');
      fireEvent.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      // Wait for redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding/join');
      }, { timeout: 2000 });
    });

    it('allows selecting multiple interests', () => {
      render(<ProfileSetup />);
      
      const programmingCheckbox = screen.getByLabelText('Programming');
      const webDevCheckbox = screen.getByLabelText('Web Development');
      
      fireEvent.click(programmingCheckbox);
      fireEvent.click(webDevCheckbox);
      
      expect(programmingCheckbox).toBeChecked();
      expect(webDevCheckbox).toBeChecked();
    });

    it('shows correct title and button text based on flow', () => {
      // Test create flow
      mockUseSearchParams.mockReturnValue({
        get: jest.fn((key: string) => key === 'flow' ? 'create' : null),
        getAll: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        toString: jest.fn(),
        size: 0,
        [Symbol.iterator]: jest.fn(),
      });
      
      render(<ProfileSetup />);
      
      expect(screen.getByText('Before You Create')).toBeInTheDocument();
      expect(screen.getByText('Continue to Create Club')).toBeInTheDocument();
    });
  });

  describe('Onboarding Tour', () => {
    it('renders first tour step correctly', () => {
      render(<OnboardingTour />);
      
      expect(screen.getByText('Welcome Tour')).toBeInTheDocument();
      expect(screen.getByText('Meetings & Events')).toBeInTheDocument();
      expect(screen.getByText('📅')).toBeInTheDocument();
      expect(screen.getByText('Easy event scheduling')).toBeInTheDocument();
    });

    it('navigates through tour steps', () => {
      render(<OnboardingTour />);
      
      // Check initial state
      expect(screen.getByText('Meetings & Events')).toBeInTheDocument();
      expect(screen.getByText('1 of 4')).toBeInTheDocument();
      
      // Navigate to next step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Project Collaboration')).toBeInTheDocument();
      expect(screen.getByText('2 of 4')).toBeInTheDocument();
    });

    it('allows going back to previous step', () => {
      render(<OnboardingTour />);
      
      // Go to next step first
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Project Collaboration')).toBeInTheDocument();
      
      // Go back
      const backButton = screen.getByText('Previous');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Meetings & Events')).toBeInTheDocument();
    });

    it('completes tour and redirects to dashboard', async () => {
      render(<OnboardingTour />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton); // Step 2
      fireEvent.click(nextButton); // Step 3
      fireEvent.click(nextButton); // Step 4
      
      expect(screen.getByText('Community & Forums')).toBeInTheDocument();
      
      // Complete tour
      const finishButton = screen.getByText('Get Started');
      fireEvent.click(finishButton);
      
      expect(screen.getByText('Finishing...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 2000 });
    });

    it('disables previous button on first step', () => {
      render(<OnboardingTour />);
      
      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('shows correct button text on last step', () => {
      render(<OnboardingTour />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton); // Step 2
      fireEvent.click(nextButton); // Step 3
      fireEvent.click(nextButton); // Step 4
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  describe('Progress Indicators', () => {
    it('shows correct progress on profile page', () => {
      render(<ProfileSetup />);
      
      // Should show step 2 as active
      const progressSteps = document.querySelectorAll('.w-8.h-8');
      expect(progressSteps[0]).toHaveClass('bg-green-500'); // Step 1 completed
      expect(progressSteps[1]).toHaveClass('bg-blue-600'); // Step 2 active
      expect(progressSteps[2]).toHaveClass('bg-gray-200'); // Step 3 pending
    });

    it('shows correct progress on tour page', () => {
      render(<OnboardingTour />);
      
      // Should show step 3 as active (after profile setup)
      const progressSteps = document.querySelectorAll('.w-8.h-8');
      expect(progressSteps[0]).toHaveClass('bg-green-500'); // Step 1 completed
      expect(progressSteps[1]).toHaveClass('bg-green-500'); // Step 2 completed  
      expect(progressSteps[2]).toHaveClass('bg-blue-600'); // Step 3 active
    });
  });
});