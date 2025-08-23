@echo off
REM Cursoset Development Script for Windows
REM This script sets up and runs the full development stack

setlocal enabledelayedexpansion

echo.
echo =====================================
echo   Starting Cursoset Development
echo =====================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check Node version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% is installed

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% is installed

REM Check Rust and Cargo
where rustc >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Rust is not installed. Please install from https://rustup.rs/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('rustc --version') do set RUST_VERSION=%%i
echo [OK] %RUST_VERSION% is installed

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cargo is not installed
    pause
    exit /b 1
)
echo [OK] Cargo is installed

REM Check wrangler
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Wrangler CLI not found. Installing globally...
    call npm install -g wrangler
)
echo [OK] Wrangler CLI is available

REM Install landing app dependencies (static React with Vite)
if exist "landing" (
    echo.
    echo Installing React app dependencies...
    cd landing
    
    REM Check if node_modules exists
    if not exist "node_modules" (
        call npm install
    ) else (
        echo [OK] React app dependencies are up to date
    )
    
    REM Create .env for landing app if it doesn't exist
    if not exist ".env" (
        echo Creating React app .env file...
        (
            echo # React App Configuration
            echo VITE_API_URL=http://localhost:8787
            echo VITE_APP_NAME=Cursoset
        ) > .env
        echo [OK] React app .env created
    )
    
    cd ..
) else (
    echo.
    echo [WARNING] Landing directory not found.
)

REM Build backend
echo.
echo Building backend...
cd backend
call cargo build

REM Initialize database if needed
echo.
echo Checking database...
wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table';" >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing database schema...
    call wrangler d1 execute DB --local --file=schema.sql
    echo [OK] Database initialized
) else (
    echo [OK] Database already initialized
)

REM Start development servers
echo.
echo =====================================
echo   Starting Development Servers
echo =====================================
echo.

REM Start backend server in a new window
echo Starting backend server on port 8787...
start "Cursoset Backend" cmd /k "wrangler dev --local --port 8787"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Create demo user if it doesn't exist
echo.
echo Checking demo user account...
curl -s -X POST http://localhost:8787/api/auth/signup -H "Content-Type: application/json" -H "Origin: http://localhost:3000" -d "{\"email\":\"demo@nivaro.com\",\"password\":\"DemoPass123@\",\"name\":\"Demo User\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Demo user ready
)

cd ..

REM Start React app if it exists
if exist "landing" (
    echo Starting React app on port 3000...
    cd landing
    start "Cursoset React App" cmd /k "npm run dev"
    cd ..
) else (
    echo [WARNING] No frontend found. Only backend API will be available.
)

REM Wait for services to fully start
timeout /t 5 /nobreak >nul

REM Display final information
echo.
echo =====================================
echo   Cursoset Development Ready!
echo =====================================
echo.
if exist "landing" (
    echo React App:    http://localhost:3000
)
echo Backend API:  http://localhost:8787
echo.
echo Backend API Endpoints:
echo   - Full API documentation in BACKEND_ENDPOINTS.txt
echo   - All curriculum, assignments, peer reviews, badges,
echo     discussions, and progress tracking endpoints ready
echo.
echo Demo Account:
echo   Email:    demo@nivaro.com
echo   Password: DemoPass123@
echo.
echo Stack: Rust/Cloudflare Workers Backend
if exist "landing" (
    echo        + Static React ^(Vite^) Frontend
)
echo.
echo =====================================
echo   Press any key to stop all servers
echo =====================================
pause >nul

REM Kill all processes
echo.
echo Shutting down development servers...
taskkill /F /FI "WINDOWTITLE eq Cursoset Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Cursoset React App*" >nul 2>&1

echo Done!
exit /b 0