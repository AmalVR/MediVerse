#!/bin/bash

echo "🚀 Unity Z-Anatomy WebGL Build Setup"
echo "======================================"
echo ""

# Check if Unity Hub is installed
if [ -d "/Applications/Unity Hub.app" ]; then
    echo "✅ Unity Hub found"
else
    echo "❌ Unity Hub not found"
    echo ""
    echo "📥 Installing Unity Hub via Homebrew..."
    brew install --cask unity-hub
    
    if [ $? -eq 0 ]; then
        echo "✅ Unity Hub installed!"
    else
        echo "❌ Install failed. Please download from: https://unity.com/download"
        exit 1
    fi
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Open Unity Hub: open '/Applications/Unity Hub.app'"
echo "2. Install Unity 2021.3 LTS with WebGL support"
echo "3. Add project: /Users/avr/dev-external/Z-Anatomy/Z-Anatomy PC"
echo "4. Build to: /Users/avr/dev-external/MediVerse/public/unity/pc-build"
echo ""
echo "📚 Full guide: BUILD_UNITY_NOW.md"
echo ""

# Open Unity Hub if installed
if [ -d "/Applications/Unity Hub.app" ]; then
    read -p "Open Unity Hub now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "/Applications/Unity Hub.app"
    fi
fi
