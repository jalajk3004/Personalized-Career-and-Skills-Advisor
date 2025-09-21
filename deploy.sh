#!/bin/bash

# 🚀 Prosperia Deployment Setup Script
# This script helps you set up environment variables for Vercel deployment

echo "🚀 Prosperia Deployment Setup"
echo "=============================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "📋 Please provide the following information:"
echo ""

# Get user input
read -p "🌐 Google Cloud SQL Host (IP address): " DB_HOST
read -p "🔌 Database Port (default: 5432): " DB_PORT
read -p "👤 Database Username: " DB_USER
read -s -p "🔐 Database Password: " DB_PASSWORD
echo ""
read -p "🗄️  Database Name: " DB_NAME
read -p "🔥 Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "📧 Firebase Client Email: " FIREBASE_CLIENT_EMAIL
read -s -p "🔑 Firebase Private Key (paste the full key): " FIREBASE_PRIVATE_KEY
echo ""
read -p "🔑 Firebase API Key: " FIREBASE_API_KEY
read -p "🌍 Backend URL (will be provided after backend deployment): " BACKEND_URL

# Set defaults
DB_PORT=${DB_PORT:-5432}

echo ""
echo "🔧 Setting up environment variables..."

# Deploy backend first
echo "📦 Deploying backend..."
cd backend
npm run build

echo "🚀 Deploying backend to Vercel..."
vercel --prod --yes

# Get the backend URL
BACKEND_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
echo "✅ Backend deployed at: $BACKEND_URL"

# Set backend environment variables
echo "🔧 Setting backend environment variables..."
vercel env add DB_HOST "$DB_HOST" --prod
vercel env add DB_PORT "$DB_PORT" --prod
vercel env add DB_USER "$DB_USER" --prod
vercel env add DB_PASSWORD "$DB_PASSWORD" --prod
vercel env add DB_NAME "$DB_NAME" --prod
vercel env add FIREBASE_PROJECT_ID "$FIREBASE_PROJECT_ID" --prod
vercel env add FIREBASE_CLIENT_EMAIL "$FIREBASE_CLIENT_EMAIL" --prod
vercel env add FIREBASE_PRIVATE_KEY "$FIREBASE_PRIVATE_KEY" --prod
vercel env add FIREBASE_API_KEY "$FIREBASE_API_KEY" --prod

# Deploy frontend
echo "📦 Deploying frontend..."
cd ../frontend

echo "🔧 Setting frontend environment variables..."
vercel env add VITE_SERVER_URL "$BACKEND_URL" --prod

echo "🚀 Deploying frontend to Vercel..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🌐 Backend URL: $BACKEND_URL"
echo "🌐 Frontend URL: $(vercel ls | grep -o 'https://[^[:space:]]*' | tail -1)"
echo ""
echo "🔍 Test your deployment:"
echo "1. Visit the backend health check: $BACKEND_URL/health"
echo "2. Visit your frontend URL and test user registration"
echo "3. Check if data is being saved to the database"
echo ""
echo "📚 For troubleshooting, see DEPLOYMENT.md"
