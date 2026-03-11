#!/bin/bash

echo "🚀 Setting up Netlify All-in-One Deployment..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

echo "✅ Step 1: Installing dependencies..."
npm install

echo ""
echo "✅ Step 2: Building the app..."
npm run build

echo ""
echo "✅ Step 3: Your Firebase Service Account (for Netlify Environment Variable)"
echo ""
echo "Copy this entire line and add it to Netlify as FIREBASE_SERVICE_ACCOUNT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 -c "import json; print(json.dumps(json.load(open('../backend/serviceAccountKey.json'))))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "✅ Step 4: Add to Netlify:"
echo "   1. Go to: https://app.netlify.com/sites/dls-calculator-5/settings/env"
echo "   2. Click 'Add a variable'"
echo "   3. Key: FIREBASE_SERVICE_ACCOUNT"
echo "   4. Value: [paste the line above]"
echo "   5. Click 'Create variable'"

echo ""
echo "✅ Step 5: Deploy to Netlify:"
echo "   git add ."
echo "   git commit -m 'Move backend to Netlify Functions'"
echo "   git push origin main"

echo ""
echo "🎉 Setup complete! After pushing, Netlify will deploy everything."
echo "   Visit: https://dls-calculator-5.netlify.app"
