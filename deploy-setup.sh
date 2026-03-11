#!/bin/bash

# DLS Calculator - Free Deployment Setup Script
# This script helps prepare your project for deployment

echo "🏏 DLS Calculator - Deployment Preparation"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check for .gitignore
if [ ! -f ".gitignore" ]; then
    echo "⚠️  No .gitignore found. Creating one..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/frontend/build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
/tmp

# Firebase
serviceAccountKey.json
firebase-debug.log
.firebase/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
EOF
    echo "✅ .gitignore created"
fi

# Check for sensitive files
echo ""
echo "🔒 Checking for sensitive files..."
if git ls-files | grep -q "serviceAccountKey.json"; then
    echo "⚠️  WARNING: serviceAccountKey.json is tracked by git!"
    echo "   Run: git rm --cached backend/serviceAccountKey.json"
    echo "   Then: git commit -m 'Remove sensitive file'"
fi

# Prepare commit
echo ""
echo "📝 Preparing to commit files..."
git add .
echo "✅ Files staged"

echo ""
echo "🚀 Next Steps for FREE Deployment:"
echo "=================================="
echo ""
echo "1️⃣  Commit your code:"
echo "   git commit -m \"Initial commit - DLS Calculator\""
echo ""
echo "2️⃣  Create a GitHub repository:"
echo "   Go to: https://github.com/new"
echo "   Name: dls-calculator"
echo "   Don't initialize with README (you already have one)"
echo ""
echo "3️⃣  Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/dls-calculator.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4️⃣  Deploy Backend (Railway - FREE):"
echo "   • Go to https://railway.app"
echo "   • Sign up with GitHub (free)"
echo "   • New Project → Deploy from GitHub repo"
echo "   • Select your repository"
echo "   • Add environment variables:"
echo "     - PORT = 5001"
echo "     - FIREBASE_SERVICE_ACCOUNT = (paste entire serviceAccountKey.json content)"
echo "   • Generate domain and copy the URL"
echo ""
echo "5️⃣  Deploy Frontend (Netlify - FREE):"
echo "   • Go to https://netlify.com"
echo "   • Sign up (free)"
echo "   • New site from Git → Connect to GitHub"
echo "   • Build settings:"
echo "     - Base directory: frontend"
echo "     - Build command: npm run build"
echo "     - Publish directory: frontend/build"
echo "   • Environment variable:"
echo "     - REACT_APP_API_URL = https://YOUR-RAILWAY-URL.railway.app/api"
echo ""
echo "💰 Cost: \$0.00 - Everything is FREE!"
echo ""
echo "📚 Full instructions in README.md"
echo ""
