#!/bin/bash

# Backend Repository Setup Script
# This script helps you set up a separate GitHub repo for your backend

echo "🚀 DLS Calculator - Backend Repository Setup"
echo "=============================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: This script must be run from the backend directory"
  echo "   Please run: cd /Users/himathdesilva/Developer/DLS/backend"
  exit 1
fi

echo "✅ You're in the backend directory"
echo ""

# Check if git is already initialized
if [ -d ".git" ]; then
  echo "⚠️  Git is already initialized in this directory"
  echo ""
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
  fi
else
  echo "📦 Initializing git repository..."
  git init
  echo "✅ Git initialized"
  echo ""
fi

# Add files
echo "📝 Staging files..."
git add .
echo "✅ Files staged"
echo ""

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - DLS Calculator Backend"
echo "✅ Committed"
echo ""

# Instructions for GitHub
echo "🌐 Next Steps:"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: dls-backend"
echo "3. Description: DLS Calculator Backend API"
echo "4. Make it Public or Private (your choice)"
echo "5. ⚠️  DO NOT check 'Initialize with README'"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repo, run these commands:"
echo ""
echo "git remote add origin https://github.com/Himath05/dls-backend.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "=============================================="
echo "✅ Backend is ready to be pushed to GitHub!"
