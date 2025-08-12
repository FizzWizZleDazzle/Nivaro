@echo off
setlocal enabledelayedexpansion

REM Nivaro Development Script for Windows
REM This script sets up and runs the development environment

echo 🚀 Starting Nivaro Development Environment...

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if !NODE_MAJOR! lss 18 (
    echo ❌ Node.js version 18 or higher is required. Current version: 
    node -v
    pause
    exit /b 1
)
echo ✅ Node.js is installed
node -v

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)
echo ✅ npm is installed
npm -v

REM Check Rust
rustc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Rust is not installed. Please install from https://rustup.rs/
    pause
    exit /b 1
)
echo ✅ Rust is installed
rustc --version

REM Check Cargo
cargo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cargo is not installed
    pause
    exit /b 1
)
echo ✅ Cargo is installed
cargo --version

REM Check wrangler
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Wrangler CLI not found. Installing globally...
    npm install -g wrangler
)
echo ✅ Wrangler CLI is available

REM Install frontend dependencies
echo Installing frontend dependencies...
cd app
if not exist "node_modules\" (
    npm install
) else (
    for %%i in (package.json) do set /a pkg_time=%%~ti
    for %%i in (node_modules\) do set /a nm_time=%%~ti
    if !pkg_time! gtr !nm_time! (
        npm install
    ) else (
        echo ✅ Frontend dependencies are up to date
    )
)
cd ..

REM Build backend
echo Building backend...
cd backend
cargo build
cd ..

REM Start development servers
echo Starting development servers...

REM Start backend development server
echo Starting backend server...
cd backend
start "Backend Server" cmd /k "wrangler dev --local"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend development server
echo Starting frontend server...
cd app
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo 🎉 Development environment is ready!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8787
echo Press any key to continue or close this window to stop...
pause >nul