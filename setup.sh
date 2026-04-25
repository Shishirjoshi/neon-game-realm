#!/bin/bash

# Teen Patti Full Stack MVP - Auto Setup Script
# This script sets up both backend and frontend and starts the servers

echo "╔════════════════════════════════════════╗"
echo "║   Teen Patti Full Stack MVP Setup      ║"
echo "║   Socket.IO + React + Express          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Setup backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo "✓ Backend dependencies installed"
else
    echo "✓ Backend node_modules already exists"
fi

echo ""
echo "Backend setup complete!"
echo "To start backend, run: npm start"
echo ""

# Setup frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend node_modules already exists"
fi

echo ""
echo "Frontend setup complete!"
echo "To start frontend, run: npm run dev"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║   Setup Complete! ✓                    ║"
echo "╠════════════════════════════════════════╣"
echo "║                                        ║"
echo "║  Terminal 1 - Start Backend:           ║"
echo "║  $ cd backend                          ║"
echo "║  $ npm start                           ║"
echo "║  Server: http://localhost:5000         ║"
echo "║                                        ║"
echo "║  Terminal 2 - Start Frontend:          ║"
echo "║  $ cd frontend                         ║"
echo "║  $ npm run dev                         ║"
echo "║  Frontend: http://localhost:3000       ║"
echo "║                                        ║"
echo "║  Then open http://localhost:3000       ║"
echo "║  in your browser and play!             ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
