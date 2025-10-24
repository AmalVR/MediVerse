#!/bin/bash

# Script to monitor Moodle installation progress
echo "🔍 Monitoring Moodle installation progress..."
echo "============================================="

while true; do
    echo -n "$(date '+%H:%M:%S') - "
    
    # Check if Moodle container is running
    if ! docker ps | grep -q mediverse-moodle; then
        echo "❌ Moodle container is not running"
        break
    fi
    
    # Check if Moodle is accessible
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Moodle is accessible! (HTTP $HTTP_CODE)"
        echo "🎉 Moodle installation completed successfully!"
        break
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "⏳ Moodle still installing... (not accessible yet)"
    else
        echo "⚠️ Moodle responding with HTTP $HTTP_CODE"
    fi
    
    # Check container logs for progress
    LAST_LOG=$(docker logs mediverse-moodle --tail 1 2>/dev/null)
    if [ -n "$LAST_LOG" ]; then
        echo "   Latest log: $LAST_LOG"
    fi
    
    sleep 10
done

echo ""
echo "🧪 Testing Moodle API endpoints..."
echo "================================="

# Test Moodle API endpoints
echo "Testing Moodle REST API..."
API_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8081/webservice/rest/server.php 2>/dev/null)
echo "REST API endpoint: HTTP $API_RESPONSE"

echo "Testing Moodle login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8081/login/token.php 2>/dev/null)
echo "Login endpoint: HTTP $LOGIN_RESPONSE"

echo ""
echo "🎯 Next steps:"
echo "1. Complete Moodle web setup (if needed)"
echo "2. Configure Moodle web services"
echo "3. Test OAuth integration"
echo "4. Generate real API tokens"
