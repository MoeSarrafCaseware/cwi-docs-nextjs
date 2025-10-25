#!/bin/bash

echo "🚀 Starting Caseware Cloud Documentation Stack..."
echo ""

# Check if PostgreSQL is running (using full path)
if ! /opt/homebrew/opt/postgresql@15/bin/pg_isready > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running!"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@15"
    echo "  OR"
    echo "  docker run --name cwi-docs-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cwi_docs -p 5432:5432 -d postgres:15"
    echo ""
    exit 1
fi

echo "✓ PostgreSQL is running"
echo ""

# Get the script's directory to ensure we're in the right location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if backend is already running on port 4000
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Backend server already running on port 4000"
else
    # Start backend server in background
    echo "📚 Starting backend server..."
    (cd "$SCRIPT_DIR/server" && npm start) &
    BACKEND_PID=$!
    echo "   Waiting for backend to initialize..."
    sleep 5
fi

# Check if Next.js is already running on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Next.js already running on port 3000"
    echo ""
    echo "✅ Stack is ready!"
    echo "   Next.js: http://localhost:3000"
    echo "   Backend: http://localhost:4000"
    echo ""
    echo "Press Ctrl+C to exit"
    # Just wait
    tail -f /dev/null
else
    # Start Next.js app from project root
    echo "🎨 Starting Next.js app..."
    cd "$SCRIPT_DIR" && npm run dev
fi

# Cleanup on exit
if [ ! -z "$BACKEND_PID" ]; then
    trap "kill $BACKEND_PID" EXIT
fi
