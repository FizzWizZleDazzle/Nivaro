#!/bin/bash

# Nivaro Development Script for Linux/macOS
# This script sets up and runs the development environment

set -e

echo "🚀 Starting Nivaro Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) is installed${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) is installed${NC}"

# Check Rust and Cargo
if ! command_exists rustc; then
    echo -e "${RED}❌ Rust is not installed. Please install from https://rustup.rs/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Rust $(rustc --version) is installed${NC}"

if ! command_exists cargo; then
    echo -e "${RED}❌ Cargo is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Cargo $(cargo --version) is installed${NC}"

# Check wrangler
if ! command_exists wrangler; then
    echo -e "${YELLOW}⚠️  Wrangler CLI not found. Installing globally...${NC}"
    npm install -g wrangler
fi
echo -e "${GREEN}✅ Wrangler CLI is available${NC}"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd app
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✅ Frontend dependencies are up to date${NC}"
fi
cd ..

# Build backend
echo -e "${BLUE}Building backend...${NC}"
cd backend
cargo build
cd ..

# Start development servers
echo -e "${BLUE}Starting development servers...${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down development servers...${NC}"
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend development server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
wrangler dev --local &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend development server
echo -e "${GREEN}Starting frontend server...${NC}"
cd app
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}Backend: http://localhost:8787${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for background processes
wait