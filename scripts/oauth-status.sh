#!/bin/bash

# OAuth Status Check
# Quick status check for OAuth configuration

echo "📊 OAuth Configuration Status"
echo "============================"

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing"
    exit 1
fi

# Check OAuth variables
if grep -q "VITE_MOODLE_OAUTH_CLIENT_ID" .env; then
    echo "✅ Client ID configured"
else
    echo "❌ Client ID missing"
fi

if grep -q "VITE_MOODLE_OAUTH_CLIENT_SECRET" .env; then
    echo "✅ Client Secret configured"
else
    echo "❌ Client Secret missing"
fi

if grep -q "VITE_MOODLE_OAUTH_REDIRECT_URI" .env; then
    echo "✅ Redirect URI configured"
else
    echo "❌ Redirect URI missing"
fi

# Check for placeholder values
if grep -q "your_google_client_id" .env; then
    echo "⚠️  Placeholder Client ID detected"
fi

if grep -q "your_google_client_secret" .env; then
    echo "⚠️  Placeholder Client Secret detected"
fi

# Check development server
if pgrep -f "vite" > /dev/null; then
    echo "✅ Development server running"
else
    echo "❌ Development server not running"
fi

# Check API server
if pgrep -f "node.*api" > /dev/null; then
    echo "✅ API server running"
else
    echo "❌ API server not running"
fi

echo ""
echo "🔧 Quick fixes:"
echo "  make oauth-validate  # Validate configuration"
echo "  make oauth-restore   # Restore from backup"
echo "  make dev-safe        # Safe development start"
