#!/bin/bash

# Cursoset Development Script
# This script sets up and runs the full development stack

set -e

echo "🚀 Starting Cursoset Development Environment..."

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

# Install landing app dependencies (static React with Vite)
if [ -d "landing" ]; then
    echo -e "${BLUE}Installing landing app dependencies...${NC}"
    cd landing
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✅ Landing app dependencies are up to date${NC}"
    fi

    # Create .env for landing app if it doesn't exist
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating landing app .env file...${NC}"
        cat > .env << EOF
# Landing App Configuration
VITE_API_URL=http://localhost:8787
VITE_APP_NAME=Cursoset
EOF
        echo -e "${GREEN}✅ Landing app .env created${NC}"
    fi

    cd ..
fi

# Install main app dependencies (static React with Vite)
if [ -d "app" ]; then
    echo -e "${BLUE}Installing main app dependencies...${NC}"
    cd app
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✅ Main app dependencies are up to date${NC}"
    fi

    cd ..
fi

# Build backend
echo -e "${BLUE}Building backend...${NC}"
cd backend
cargo build

# Initialize database if empty
echo -e "${BLUE}Checking database...${NC}"
TABLE_COUNT=$(wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table';" 2>/dev/null | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")
if [ "$TABLE_COUNT" -eq "0" ] || [ -z "$TABLE_COUNT" ]; then
    echo -e "${YELLOW}Initializing database schema...${NC}"
    wrangler d1 execute DB --local --file=schema.sql
    echo -e "${GREEN}✅ Database initialized${NC}"
else
    echo -e "${GREEN}✅ Database already initialized${NC}"
fi
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
wrangler dev --local --port 8787 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8787/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    sleep 1
done

# Create demo user using the signup API
DEMO_EXISTS=$(wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM users WHERE email='demo@nivaro.com';" 2>/dev/null | grep -o '"count":1' || echo "")
if [ -z "$DEMO_EXISTS" ]; then
    echo -e "${YELLOW}Creating demo user account...${NC}"
    
    # Use the signup API endpoint to create the demo user with a stronger password
    SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:8787/api/auth/signup \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3000" \
        -d '{"email":"demo@nivaro.com","password":"DemoPass123@","name":"Demo User"}' 2>/dev/null)
    
    if echo "$SIGNUP_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Demo user created successfully${NC}"
        echo -e "${BLUE}   📧 Email: demo@nivaro.com${NC}"
        echo -e "${BLUE}   🔑 Password: DemoPass123@${NC}"
    else
        echo -e "${YELLOW}⚠️  Demo user might already exist or creation failed${NC}"
    fi
fi

# Start landing app development server (static React with Vite)
if [ -d "landing" ]; then
    echo -e "${GREEN}Starting landing page (port 3000)...${NC}"
    cd landing
    npm run dev &
    LANDING_PID=$!
    cd ..
    
    # Wait for app to start
    echo -e "${YELLOW}Waiting for landing page to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Landing page is ready${NC}"
            break
        fi
        sleep 1
    done
fi

# Start main app development server (static React with Vite)
if [ -d "app" ]; then
    echo -e "${GREEN}Starting main app (port 3001)...${NC}"
    cd app
    npm run dev &
    APP_PID=$!
    cd ..
    
    # Wait for app to start
    echo -e "${YELLOW}Waiting for main app to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3001/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Main app is ready${NC}"
            break
        fi
        sleep 1
    done
fi

echo -e "${GREEN}🎉 Cursoset Development Environment is ready!${NC}"
echo -e ""
if [ -d "landing" ]; then
    echo -e "${BLUE}🌐 Landing Page: http://localhost:3000${NC}"
fi
if [ -d "app" ]; then
    echo -e "${BLUE}📱 Main App: http://localhost:3001${NC}"
fi
echo -e "${BLUE}🔧 Backend API: http://localhost:8787${NC}"
echo -e ""
echo -e "${GREEN}Backend API Endpoints:${NC}"
echo -e "${BLUE}   📚 Full API documentation in BACKEND_ENDPOINTS.txt${NC}"
echo -e "${BLUE}   ✅ All curriculum, assignments, peer reviews, badges,${NC}"
echo -e "${BLUE}      discussions, and progress tracking endpoints ready${NC}"
echo -e ""
echo -e "${GREEN}Demo Account Credentials:${NC}"
echo -e "${BLUE}   📧 Email: demo@nivaro.com${NC}"
echo -e "${BLUE}   🔑 Password: DemoPass123@${NC}"
echo -e ""
echo -e "${YELLOW}Stack: Rust/Cloudflare Workers Backend${NC}"
if [ -d "landing" ]; then
    echo -e "${YELLOW}       + Static React (Vite) Frontend${NC}"
fi
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for background processes
wait