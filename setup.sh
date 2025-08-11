#!/bin/bash

# Nivaro Development Setup Script
echo "🚀 Setting up Nivaro development environment..."

# Check dependencies
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or later."
    exit 1
fi

node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js version $node_version is too old. Please install Node.js 20 or later."
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust from https://rustup.rs/"
    exit 1
fi
echo "✅ Rust $(rustc --version | cut -d' ' -f2) found"

# Check wasm32 target
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    echo "📦 Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi
echo "✅ wasm32-unknown-unknown target available"

# Set up frontend
echo "📦 Setting up frontend..."
cd app
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
else
    echo "Frontend dependencies already installed"
fi

# Test frontend build
echo "🔨 Testing frontend build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Set up backend
echo "📦 Setting up backend..."
cd backend

# Install worker-build if not present
if ! command -v worker-build &> /dev/null; then
    echo "Installing worker-build..."
    cargo install worker-build --locked
fi

# Test backend build
echo "🔨 Testing backend build..."
cargo build --release
if [ $? -eq 0 ]; then
    echo "✅ Backend builds successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To start development:"
echo "  Frontend: cd app && npm run dev"
echo "  Backend:  cd backend && wrangler dev"
echo ""
echo "To run tests:"
echo "  Frontend: cd app && npm test"
echo "  Backend:  cd backend && cargo test"
echo ""
echo "For deployment instructions, see DEPLOYMENT.md"