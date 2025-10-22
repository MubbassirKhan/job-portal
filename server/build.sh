#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting backend build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory if it doesn't exist
echo "📁 Creating upload directories..."
mkdir -p uploads/posts
mkdir -p uploads/resumes
mkdir -p uploads/chat

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads
chmod 755 uploads/posts
chmod 755 uploads/resumes
chmod 755 uploads/chat

echo "✅ Backend build completed successfully!"