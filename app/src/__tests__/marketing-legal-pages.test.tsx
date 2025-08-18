import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/(marketing)/about/page';
import PricingPage from '@/app/(marketing)/pricing/page';
import FAQPage from '@/app/(marketing)/faq/page';
import TestimonialsPage from '@/app/(marketing)/testimonials/page';
import TermsPage from '@/app/(marketing)/terms/page';
import PrivacyPage from '@/app/(marketing)/privacy/page';
import CookiesPage from '@/app/(marketing)/cookies/page';
import ContactPage from '@/app/(marketing)/contact/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Marketing and Legal Pages', () => {
  describe('About Page', () => {
    it('renders the about page with main content', () => {
      render(<AboutPage />);
      expect(screen.getByText('About Nivaro')).toBeInTheDocument();
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(screen.getByText(/Nivaro is dedicated to empowering communities/)).toBeInTheDocument();
    });

    it('includes feature highlights', () => {
      render(<AboutPage />);
      expect(screen.getByText('What We Do')).toBeInTheDocument();
      expect(screen.getByText(/Event planning and meeting management/)).toBeInTheDocument();
      expect(screen.getByText(/Project collaboration and code sharing/)).toBeInTheDocument();
    });
  });

  describe('Pricing Page', () => {
    it('renders pricing plans', () => {
      render(<PricingPage />);
      expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('shows pricing details', () => {
      render(<PricingPage />);
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$29')).toBeInTheDocument();
      expect(screen.getByText(/Up to 25 members/)).toBeInTheDocument();
    });
  });

  describe('FAQ Page', () => {
    it('renders FAQ content', () => {
      render(<FAQPage />);
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Features & Functionality')).toBeInTheDocument();
    });

    it('includes common questions', () => {
      render(<FAQPage />);
      expect(screen.getByText(/How do I create a new club on Nivaro?/)).toBeInTheDocument();
      expect(screen.getByText(/Is Nivaro really free for small clubs?/)).toBeInTheDocument();
    });
  });

  describe('Testimonials Page', () => {
    it('renders testimonials content', () => {
      render(<TestimonialsPage />);
      expect(screen.getByText('What Our Community Says')).toBeInTheDocument();
      expect(screen.getByText('Success Stories')).toBeInTheDocument();
    });

    it('includes customer testimonials', () => {
      render(<TestimonialsPage />);
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText(/Tech Innovation Club/)).toBeInTheDocument();
    });
  });

  describe('Terms Page', () => {
    it('renders terms of service', () => {
      render(<TermsPage />);
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText(/Acceptance of Terms/)).toBeInTheDocument();
      expect(screen.getByText(/Description of Service/)).toBeInTheDocument();
    });

    it('includes legal sections', () => {
      render(<TermsPage />);
      expect(screen.getByText(/User Accounts/)).toBeInTheDocument();
      expect(screen.getByText(/Acceptable Use/)).toBeInTheDocument();
      expect(screen.getByText(/Limitation of Liability/)).toBeInTheDocument();
    });
  });

  describe('Privacy Page', () => {
    it('renders privacy policy', () => {
      render(<PrivacyPage />);
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText(/2\. Information We Collect/)).toBeInTheDocument();
      expect(screen.getByText(/How We Use Your Information/)).toBeInTheDocument();
    });

    it('includes privacy rights information', () => {
      render(<PrivacyPage />);
      expect(screen.getByText(/Your Privacy Rights/)).toBeInTheDocument();
      expect(screen.getByText(/Data Security/)).toBeInTheDocument();
    });
  });

  describe('Cookies Page', () => {
    it('renders cookie policy', () => {
      render(<CookiesPage />);
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
      expect(screen.getByText(/What Are Cookies?/)).toBeInTheDocument();
      expect(screen.getByText(/How We Use Cookies/)).toBeInTheDocument();
    });

    it('includes cookie management information', () => {
      render(<CookiesPage />);
      expect(screen.getByText(/Managing Your Cookie Preferences/)).toBeInTheDocument();
      expect(screen.getByText(/Types of Cookies We Use/)).toBeInTheDocument();
    });
  });

  describe('Contact Page', () => {
    it('renders contact information', () => {
      render(<ContactPage />);
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    });

    it('includes contact methods', () => {
      render(<ContactPage />);
      expect(screen.getByText('Email Support')).toBeInTheDocument();
      expect(screen.getByText('Live Chat')).toBeInTheDocument();
      expect(screen.getByText('Sales Inquiries')).toBeInTheDocument();
    });

    it('includes contact form', () => {
      render(<ContactPage />);
      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    });
  });
});