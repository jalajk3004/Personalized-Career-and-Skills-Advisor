#!/bin/bash

# 🛠️ Prosperia Quick Fix Script
# This script helps fix common deployment issues

echo "🛠️ Prosperia Quick Fix Script"
echo "============================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists vercel; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check complete"
echo ""

# Rebuild backend
echo "🔨 Rebuilding backend..."
cd backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test local connection
echo "🧪 Testing local database connection..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Local database connection working"
else
    echo "❌ Local database connection failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Stop local server
kill $SERVER_PID 2>/dev/null
echo "✅ Local server stopped"

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy backend: cd backend && vercel --prod"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Deploy frontend: cd frontend && vercel --prod"
echo "4. Set VITE_SERVER_URL in frontend environment variables"
echo ""
echo "📚 See DEPLOYMENT_CHECKLIST.md for detailed instructions"
