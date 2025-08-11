# Nivaro

A comprehensive club management platform that streamlines meetings, boosts collaboration, enhances learning experiences, and builds stronger communities.

## Features

- **Smart Meeting Management**: Schedule, organize, and track meetings with automated reminders
- **Project Collaboration**: Coordinate team projects and track progress
- **Learning Center**: Access courses and educational resources
- **Member Management**: Manage club membership and roles
- **Community Forums**: Facilitate discussions and knowledge sharing

## Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Rust-based Cloudflare Workers
- **Deployment**: GitHub Actions, Cloudflare Pages/Workers
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 20 or later
- Rust toolchain with `wasm32-unknown-unknown` target
- Cloudflare account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/FizzWizZleDazzle/Nivaro.git
   cd Nivaro
   ```

2. **Frontend Setup**
   ```bash
   cd app
   npm install --legacy-peer-deps
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   cargo install worker-build
   cargo build
   # For local development
   wrangler dev
   ```

### Testing

```bash
# Frontend tests
cd app
npm run test

# Backend tests  
cd backend
cargo test
```

### Building

```bash
# Frontend build
cd app
npm run build

# Backend build
cd backend
worker-build --release
```

## Deployment

This project uses automated deployment workflows with GitHub Actions and Cloudflare.

- **Staging**: Automatically deployed on pushes to `main` branch
- **Production**: Deployed when creating version tags (e.g., `v1.0.0`)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
Nivaro/
├── app/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utility functions and types
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Rust Cloudflare Worker
│   ├── src/             # Worker source code
│   ├── Cargo.toml       # Rust dependencies
│   └── wrangler.toml    # Cloudflare Worker configuration
├── .github/
│   └── workflows/       # GitHub Actions CI/CD workflows
├── DEPLOYMENT.md        # Deployment documentation
└── README.md           # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.