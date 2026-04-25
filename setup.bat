@echo off
REM Teen Patti Full Stack MVP - Auto Setup Script (Windows)

echo.
echo ╔════════════════════════════════════════╗
echo ║   Teen Patti Full Stack MVP Setup      ║
echo ║   Socket.IO + React + Express          ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%
echo.

REM Setup backend
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Setting up backend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend node_modules already exists
)

echo.
echo Backend setup complete!
echo To start backend, run: npm start
echo.

REM Setup frontend
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Setting up frontend...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend node_modules already exists
)

echo.
echo Frontend setup complete!
echo To start frontend, run: npm run dev
echo.

echo ╔════════════════════════════════════════╗
echo ║   Setup Complete! ✓                    ║
echo ╠════════════════════════════════════════╣
echo ║                                        ║
echo ║  Terminal 1 - Start Backend:           ║
echo ║  cd backend                            ║
echo ║  npm start                             ║
echo ║  Server: http://localhost:5000         ║
echo ║                                        ║
echo ║  Terminal 2 - Start Frontend:          ║
echo ║  cd frontend                           ║
echo ║  npm run dev                           ║
echo ║  Frontend: http://localhost:3000       ║
echo ║                                        ║
echo ║  Then open http://localhost:3000       ║
echo ║  in your browser and play!             ║
echo ║                                        ║
echo ╚════════════════════════════════════════╝
echo.

pause
