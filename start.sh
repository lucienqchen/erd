#!/bin/bash

# Quick start script for ERD application

echo "🚀 Starting ERD Application..."
echo ""

# Check if node_modules exist
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "Starting servers..."
echo "  - Backend: http://localhost:5001"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
cd server && npm start &
SERVER_PID=$!

cd ../client && npm run dev &
CLIENT_PID=$!

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
