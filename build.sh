#!/bin/bash

echo "🔨 Starting build process..."

# Go to root directory
cd /opt/render/project/src || cd ..

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️ Building frontend..."
npm run build

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "✅ Build complete!"
