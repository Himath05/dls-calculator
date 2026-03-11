#!/bin/bash

# Helper script to prepare Firebase credentials for Netlify deployment
# This converts your Firebase service account JSON to a single-line format

echo "🔥 Firebase Credentials Formatter for Netlify"
echo "============================================="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  'jq' is not installed. Installing now..."
    
    # Detect OS and install jq
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install jq
        else
            echo "❌ Homebrew not found. Please install jq manually:"
            echo "   brew install jq"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y jq || sudo yum install -y jq
    else
        echo "❌ Unsupported OS. Please install jq manually:"
        echo "   https://stedolan.github.io/jq/download/"
        exit 1
    fi
fi

echo "✅ jq is installed"
echo ""

# Check if service account file exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found in current directory"
    echo ""
    echo "Please:"
    echo "1. Download your Firebase service account key"
    echo "2. Save it as 'serviceAccountKey.json' in this directory"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Found serviceAccountKey.json"
echo ""

# Convert to single-line JSON
echo "🔄 Converting to single-line format..."
SINGLE_LINE=$(cat serviceAccountKey.json | jq -c .)

# Save to file
echo "$SINGLE_LINE" > serviceAccountKey-single-line.txt

echo "✅ Conversion complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Your single-line Firebase credentials are ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The credentials have been saved to: serviceAccountKey-single-line.txt"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Copy the contents of serviceAccountKey-single-line.txt"
echo ""
echo "2. In Netlify (via UI):"
echo "   - Go to Site settings → Environment variables"
echo "   - Click 'Add variable'"
echo "   - Key: FIREBASE_SERVICE_ACCOUNT"
echo "   - Value: Paste the copied content (no quotes needed)"
echo ""
echo "3. Or via Netlify CLI:"
echo "   netlify env:set FIREBASE_SERVICE_ACCOUNT '\$(cat serviceAccountKey-single-line.txt)'"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - Never commit serviceAccountKey.json to Git"
echo "   - Never commit serviceAccountKey-single-line.txt to Git"
echo "   - Add them to .gitignore"
echo ""

# Add to .gitignore if not already there
if [ -f ".gitignore" ]; then
    if ! grep -q "serviceAccountKey" .gitignore; then
        echo "" >> .gitignore
        echo "# Firebase credentials - DO NOT COMMIT" >> .gitignore
        echo "serviceAccountKey.json" >> .gitignore
        echo "serviceAccountKey-single-line.txt" >> .gitignore
        echo "✅ Added to .gitignore"
    fi
else
    echo "# Firebase credentials - DO NOT COMMIT" > .gitignore
    echo "serviceAccountKey.json" >> .gitignore
    echo "serviceAccountKey-single-line.txt" >> .gitignore
    echo "✅ Created .gitignore"
fi

echo ""
echo "🚀 Ready to deploy to Netlify!"
