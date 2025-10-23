#!/bin/bash

# Environment Variables Validation Script
# Ensures OAuth configuration is correct

set -e

echo "🔍 Validating Environment Configuration"
echo "======================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Run: cp env.example .env"
    exit 1
fi

# Check for required OAuth variables
required_vars=(
    "VITE_MOODLE_OAUTH_CLIENT_ID"
    "VITE_MOODLE_OAUTH_CLIENT_SECRET"
    "VITE_MOODLE_OAUTH_REDIRECT_URI"
)

placeholder_values=(
    "your_google_client_id"
    "demo_client_id"
    "placeholder_client_id"
    "your_google_client_secret"
    "demo_client_secret"
    "placeholder_client_secret"
)

echo "Checking required OAuth variables..."

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo "❌ Missing: $var"
        exit 1
    fi
    
    value=$(grep "^${var}=" .env | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$value" ]; then
        echo "❌ Empty value for: $var"
        exit 1
    fi
    
    # Check for placeholder values
    for placeholder in "${placeholder_values[@]}"; do
        if [ "$value" = "$placeholder" ]; then
            echo "❌ Placeholder value detected for: $var"
            echo "   Current value: $value"
            echo "   Please update with real OAuth credentials"
            exit 1
        fi
    done
    
    echo "✅ $var is set correctly"
done

echo "✅ All OAuth environment variables are valid"
