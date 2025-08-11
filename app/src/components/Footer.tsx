import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              Nivaro
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Empowering communities through better club management and collaboration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/meetings" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Meetings & Events
                </Link>
              </li>
              <li>
                <Link href="/learning" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Learning Center
                </Link>
              </li>
              <li>
                <Link href="/project-collaboration" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Project Collaboration
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <a href="mailto:support@nivaro.com" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Account</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/onboarding/create" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Create Club
                </Link>
              </li>
              <li>
                <Link href="/onboarding/join" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Join Club
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Nivaro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}