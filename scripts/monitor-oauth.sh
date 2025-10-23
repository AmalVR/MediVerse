#!/bin/bash

# OAuth Configuration Monitor
# Continuously monitors OAuth configuration health

set -e

echo "🔍 OAuth Configuration Monitor"
echo "============================="

while true; do
    echo "$(date): Checking OAuth configuration..."
    
    if [ -f scripts/validate-env.sh ]; then
        if ./scripts/validate-env.sh > /dev/null 2>&1; then
            echo "✅ OAuth configuration is healthy"
        else
            echo "❌ OAuth configuration issue detected!"
            echo "   Run: make oauth-validate for details"
        fi
    else
        echo "⚠️  OAuth validation script not found"
    fi
    
    sleep 30
done
