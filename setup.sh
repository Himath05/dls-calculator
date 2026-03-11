#!/bin/bash

# DLS 5.0 Calculator - Setup Script
# This script helps verify your setup and start the application

echo "╔════════════════════════════════════════════════╗"
echo "║  DLS 5.0 Calculator - Setup & Start Script    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "🔍 Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm is installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Run this script from the DLS project root directory${NC}"
    exit 1
fi

# Check Firebase service account key
echo "🔍 Checking Firebase configuration..."
if [ -f "backend/serviceAccountKey.json" ]; then
    echo -e "${GREEN}✅ Firebase service account key found${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: serviceAccountKey.json not found in backend/${NC}"
    echo "   Please add your Firebase service account key to backend/serviceAccountKey.json"
    echo "   See QUICKSTART.md for instructions"
    echo ""
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "   Installing backend dependencies..."
cd backend
if npm install; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..
echo "   Installing frontend dependencies..."
cd frontend
if npm install; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║           Setup Complete! 🎉                   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "To start the application:"
echo ""
echo "1️⃣  Terminal 1 - Backend:"
echo "   cd backend && npm start"
echo ""
echo "2️⃣  Terminal 2 - Frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3️⃣  Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - QUICKSTART.md (5-minute setup guide)"
echo "   - README.md (full documentation)"
echo "   - TEST_DATA.md (sample test cases)"
echo ""
echo "Need help? Check QUICKSTART.md for troubleshooting!"
echo ""
