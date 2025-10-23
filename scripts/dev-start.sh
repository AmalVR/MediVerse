#!/bin/bash

# Development Startup Script with OAuth Validation
# Ensures OAuth configuration is correct before starting

set -e

echo "🚀 Starting MediVerse Development Environment"
echo "============================================="

# Validate OAuth configuration
echo "1. Validating OAuth configuration..."
if [ -f scripts/validate-env.sh ]; then
    ./scripts/validate-env.sh
    if [ $? -ne 0 ]; then
        echo "❌ OAuth configuration validation failed"
        echo "   Please fix OAuth configuration before starting"
        exit 1
    fi
else
    echo "⚠️  OAuth validation script not found"
fi

# Clear Vite cache
echo "2. Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

# Kill existing processes
echo "3. Stopping existing processes..."
pkill -f "vite" || true
pkill -f "tsx watch" || true
pkill -f "concurrently" || true

# Start development server
echo "4. Starting development server..."
npm run dev
