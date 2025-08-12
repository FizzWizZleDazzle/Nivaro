# Nivaro

**Complete Club Management Platform**

Nivaro is a comprehensive club management platform that streamlines meetings, boosts collaboration, enhances learning experiences, and builds stronger communities. Built with modern technologies including Next.js 15, React 19, TypeScript, and Rust/Cloudflare Workers.

## ✨ Features

- **🗓️ Smart Meeting Management** - Schedule, organize, and track meetings with automated reminders and RSVP management
- **🤝 Project Collaboration** - Collaborate on projects with integrated code sharing and task management
- **📚 Learning Center** - Create and share educational content with structured learning paths
- **💬 Help & Mentorship Forum** - Q&A forums and mentorship matching system
- **📢 Smart Announcements** - Targeted notifications and customizable communication channels
- **👥 Club Management** - Comprehensive member management with roles and permissions

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, TailwindCSS
- **Backend**: Rust with Cloudflare Workers
- **Testing**: Jest with React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- Rust (latest stable)
- Git

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/FizzWizZleDazzle/Nivaro.git
cd Nivaro

# Install frontend dependencies
cd app
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Copy environment variables
cp .env.example .env
# Edit .env with your Cloudflare configuration

# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Start development server
wrangler dev
```

## 🧪 Development

### Available Scripts (Frontend)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Available Scripts (Backend)

```bash
cargo build          # Build the project
cargo test           # Run tests
cargo fmt            # Format code
cargo clippy         # Run linter
wrangler dev         # Start development server
wrangler deploy      # Deploy to Cloudflare Workers
```

## 🔧 Configuration

### Frontend Environment Variables

See `app/.env.example` for all available configuration options:

- `NEXT_PUBLIC_SITE_URL` - Your domain URL
- `NEXT_PUBLIC_API_URL` - Backend API URL
- Analytics configuration (Google Analytics, Plausible)
- Cookie consent settings
- Performance monitoring

### Backend Environment Variables

See `backend/.env.example` for backend configuration:

- Cloudflare account details
- Database configuration (D1)
- JWT secrets
- CORS settings
- Email configuration

## 🧪 Testing

The project includes comprehensive tests with good coverage:

```bash
# Run all tests
cd app && npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Cloudflare Workers)

```bash
cd backend
wrangler deploy
```

## 🛠️ Development Workflow

1. **Code Quality**: All code is automatically formatted with Prettier and linted with ESLint
2. **Testing**: Write tests for new features using Jest and React Testing Library
3. **Type Safety**: Full TypeScript coverage for frontend and Rust for backend
4. **CI/CD**: GitHub Actions automatically test and deploy on every push

## 📚 Project Structure

```
Nivaro/
├── app/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── types/       # TypeScript type definitions
│   │   └── __tests__/   # Test files
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── backend/             # Rust/Cloudflare Workers backend
│   ├── src/            # Rust source code
│   ├── Cargo.toml      # Rust dependencies
│   └── wrangler.toml   # Cloudflare Workers config
└── .github/            # GitHub Actions workflows
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test` and `cargo test`
5. Format code: `npm run format` and `cargo fmt`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://nivaro.com) (when deployed)
- [Documentation](https://docs.nivaro.com) (coming soon)
- [Issue Tracker](https://github.com/FizzWizZleDazzle/Nivaro/issues)

## ⭐ Support

If you find this project helpful, please consider giving it a star on GitHub!