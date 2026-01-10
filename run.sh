#!/bin/bash

# Kill any existing processes on ports 8000 and 5173
echo "Stopping existing services..."
fuser -k 8000/tcp > /dev/null 2>&1
fuser -k 5173/tcp > /dev/null 2>&1

# Start Backend
echo "Starting Backend on port 8000..."
cd backend

# Check if uvicorn is installed
if ! python3 -c "import uvicorn" &> /dev/null; then
    echo "Uvicorn not found. Installing dependencies..."
    
    # Check if running in a virtual environment
    if [[ -n "$VIRTUAL_ENV" ]]; then
        echo "Virtual environment detected. Installing via standard pip..."
        pip install -r requirements.txt
    else
        echo "No virtual environment detected. Attempting user install..."
        pip install --user --break-system-packages -r requirements.txt
    fi
fi

python3 -m uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend on port 5173..."
# We use python http.server because Node.js is not available
python3 -m http.server 5173 --directory frontend &
FRONTEND_PID=$!

echo "Services started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both."

# Wait for both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT
wait
