#!/bin/bash

# TikTok Fact-Checker - Launch Script for Linux/macOS

# Colors for better visibility
CYAN='\033[0;36m'
GREEN='\033[0;32m'
GRAY='\033[0;90m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}Stopping existing services on ports 8000 and 5173...${NC}"
fuser -k 8000/tcp > /dev/null 2>&1
fuser -k 5173/tcp > /dev/null 2>&1

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 not found. Please install Python 3.${NC}"
    exit 1
fi

# Start Backend
echo -e "\n${GREEN}Starting Backend on port 8000...${NC}"
cd backend

echo -e "${GRAY}Checking dependencies...${NC}"
# Use pip3 or pip depending on availability
PIP_CMD=$(command -v pip3 || command -v pip)
$PIP_CMD install -r requirements.txt

# Start FastAPI in background
python3 -m uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!

cd ..

# Start Frontend
echo -e "${GREEN}Starting Frontend on port 5173...${NC}"
python3 -m http.server 5173 --directory frontend &
FRONTEND_PID=$!

echo -e "\n${YELLOW}Services started!${NC}"
echo -e "${GRAY}Backend: http://localhost:8000${NC}"
echo -e "${GRAY}Frontend: http://localhost:5173${NC}"
echo -e "\nPress Ctrl+C to stop services and exit."

# Trap Ctrl+C to stop background processes
trap "echo -e '\n${RED}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Keep script running
wait
