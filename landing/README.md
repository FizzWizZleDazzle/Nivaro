# Cursoset Landing Page

A modern, responsive landing page for Cursoset - where Google Classroom meets Coursera for clubs.

## Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Fully Responsive**: Desktop-first design that adapts to all screen sizes
- **TypeScript**: Type-safe development with full TypeScript support
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation

## Pages

- **Home**: Hero section, features overview, testimonials, and how it works
- **About**: Company mission, values, and team information
- **Pricing**: Three-tier pricing structure with feature comparison
- **Contact**: Contact form with validation and company information
- **Privacy Policy**: Comprehensive privacy policy and data protection information
- **Terms of Service**: Complete terms and conditions

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- React Hook Form for form handling

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_URL=http://localhost:3001    # URL where the main Cursoset app is hosted
VITE_APP_NAME=Cursoset               # Application name
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Hero.tsx        # Landing page hero section
│   ├── Features.tsx    # Features showcase
│   ├── HowItWorks.tsx  # How it works section
│   ├── Testimonials.tsx# Customer testimonials carousel
│   ├── Navbar.tsx      # Navigation header
│   └── Footer.tsx      # Site footer
├── pages/              # Page components
│   ├── Home.tsx        # Main landing page
│   ├── About.tsx       # About us page
│   ├── Pricing.tsx     # Pricing plans page
│   ├── Contact.tsx     # Contact form page
│   ├── Privacy.tsx     # Privacy policy
│   └── Terms.tsx       # Terms of service
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared type definitions
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Navigation Flow

- **Sign In/Sign Up buttons** → Redirect to main application (`VITE_APP_URL`)
- All pages are client-side routed using React Router
- Smooth scrolling between sections on the home page
- Responsive mobile navigation with hamburger menu

## Features Highlighted

1. **Club Dashboard** - Centralized club management
2. **Curriculum Builder** - Structured learning path creation
3. **Assignment Management** - Project submission and tracking
4. **Peer Review System** - Community-driven feedback
5. **Badges & Certificates** - Achievement recognition
6. **Discussion Forums** - Collaborative learning spaces

## Deployment

The application builds to static files and can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Ensure all components are responsive and accessible
3. Test on multiple browsers and screen sizes
4. Keep animations smooth and performant

## License

All rights reserved. This is proprietary software for Cursoset Inc.