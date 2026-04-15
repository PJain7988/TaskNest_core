#!/bin/bash

# TaskNest Pro - Installation Script
# This script sets up the project with all dependencies

echo "🚀 TaskNest Pro - Installation Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"
echo ""

# Install root dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup backend
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠ Created .env file. Please configure it:${NC}"
    echo "  - MONGODB_URI: Your MongoDB connection string"
    echo "  - JWT_SECRET: Your JWT secret key"
    echo "  - Other optional settings"
fi
echo -e "${GREEN}✓ Backend configured${NC}"
cd ..
echo ""

# Setup frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi
echo -e "${GREEN}✓ Frontend configured${NC}"
cd ..
echo ""

# Final instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Configure Environment Variables:"
echo "   - Edit backend/.env with your MongoDB URI and other settings"
echo "   - Edit frontend/.env if needed (usually defaults work)"
echo ""
echo "2. Start Development Servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open in Browser:"
echo "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "📚 For more details, see SETUP.md and README.md"
echo ""
