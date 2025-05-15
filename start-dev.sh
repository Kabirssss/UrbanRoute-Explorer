#!/bin/bash

# Make this script executable with: chmod +x start-dev.sh

# Start the backend server
echo "Starting backend server..."
cd "$(dirname "$0")/server"
npm install
node server.js &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start the frontend
echo "Starting frontend..."
cd "$(dirname "$0")"
npm install
npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

echo "Both servers are now running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Press Ctrl+C to stop both servers."

# Keep the script running
wait
