#!/bin/bash

# Moodle Integration Test Script
# This script tests the Moodle integration functionality

set -e

echo "🧪 Testing Moodle Integration..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_database_connectivity() {
    echo -e "\n${YELLOW}1. Testing Database Connectivity...${NC}"
    
    # Test MediVerse database
    if docker compose exec postgres psql -U mediverse -d mediverse -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "   ✅ MediVerse database connection: ${GREEN}PASS${NC}"
    else
        echo -e "   ❌ MediVerse database connection: ${RED}FAIL${NC}"
        return 1
    fi
    
    # Test Moodle database
    if docker compose exec postgres psql -U mediverse -d moodle -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "   ✅ Moodle database connection: ${GREEN}PASS${NC}"
    else
        echo -e "   ❌ Moodle database connection: ${RED}FAIL${NC}"
        return 1
    fi
}

test_moodle_service() {
    echo -e "\n${YELLOW}2. Testing Moodle Service...${NC}"
    
    # Check if Moodle container is running
    if docker compose ps moodle | grep -q "Up"; then
        echo -e "   ✅ Moodle container: ${GREEN}RUNNING${NC}"
    else
        echo -e "   ❌ Moodle container: ${RED}NOT RUNNING${NC}"
        return 1
    fi
    
    # Test Moodle web access
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200\|302"; then
        echo -e "   ✅ Moodle web access: ${GREEN}PASS${NC}"
    else
        echo -e "   ❌ Moodle web access: ${RED}FAIL${NC}"
        return 1
    fi
}

test_oauth_configuration() {
    echo -e "\n${YELLOW}3. Testing OAuth Configuration...${NC}"
    
    # Check if OAuth environment variables are set
    if [ -f .env ]; then
        if grep -q "MOODLE_OAUTH_CLIENT_ID" .env && grep -q "MOODLE_OAUTH_CLIENT_SECRET" .env; then
            echo -e "   ✅ OAuth environment variables: ${GREEN}CONFIGURED${NC}"
        else
            echo -e "   ⚠️  OAuth environment variables: ${YELLOW}NOT CONFIGURED${NC}"
        fi
    else
        echo -e "   ⚠️  .env file: ${YELLOW}NOT FOUND${NC}"
    fi
}

test_api_endpoints() {
    echo -e "\n${YELLOW}4. Testing API Endpoints...${NC}"
    
    # Test MediVerse API
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "   ✅ MediVerse frontend: ${GREEN}PASS${NC}"
    else
        echo -e "   ❌ MediVerse frontend: ${RED}FAIL${NC}"
        return 1
    fi
    
    # Test Moodle API endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/webservice/rest/server.php | grep -q "200\|400"; then
        echo -e "   ✅ Moodle API endpoint: ${GREEN}PASS${NC}"
    else
        echo -e "   ❌ Moodle API endpoint: ${RED}FAIL${NC}"
        return 1
    fi
}

test_content_services() {
    echo -e "\n${YELLOW}5. Testing Content Services...${NC}"
    
    # Check if Moodle content service files exist
    if [ -f "src/lib/moodle/content.ts" ]; then
        echo -e "   ✅ Moodle content service: ${GREEN}EXISTS${NC}"
    else
        echo -e "   ❌ Moodle content service: ${RED}MISSING${NC}"
        return 1
    fi
    
    if [ -f "src/lib/moodle/sync.ts" ]; then
        echo -e "   ✅ Moodle sync service: ${GREEN}EXISTS${NC}"
    else
        echo -e "   ❌ Moodle sync service: ${RED}MISSING${NC}"
        return 1
    fi
    
    if [ -f "src/contexts/UserContext.tsx" ]; then
        echo -e "   ✅ User context: ${GREEN}EXISTS${NC}"
    else
        echo -e "   ❌ User context: ${RED}MISSING${NC}"
        return 1
    fi
}

test_ui_components() {
    echo -e "\n${YELLOW}6. Testing UI Components...${NC}"
    
    # Check if Moodle UI components exist
    components=(
        "src/components/UnifiedLogin.tsx"
        "src/components/MoodleVideoUpload.tsx"
        "src/components/MoodleQuizBuilder.tsx"
        "src/components/MoodleAssignmentCreator.tsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo -e "   ✅ $(basename $component): ${GREEN}EXISTS${NC}"
        else
            echo -e "   ❌ $(basename $component): ${RED}MISSING${NC}"
            return 1
        fi
    done
}

test_google_classroom_removal() {
    echo -e "\n${YELLOW}7. Testing Google Classroom Removal...${NC}"
    
    # Check if Google Classroom files are removed
    if [ ! -f "src/pages/GoogleClassroom.tsx" ]; then
        echo -e "   ✅ Google Classroom page: ${GREEN}REMOVED${NC}"
    else
        echo -e "   ❌ Google Classroom page: ${RED}STILL EXISTS${NC}"
        return 1
    fi
    
    if [ ! -f "src/lib/google-classroom/index.ts" ]; then
        echo -e "   ✅ Google Classroom service: ${GREEN}REMOVED${NC}"
    else
        echo -e "   ❌ Google Classroom service: ${RED}STILL EXISTS${NC}"
        return 1
    fi
    
    if [ ! -f "docs/GOOGLE_CLASSROOM_SETUP.md" ]; then
        echo -e "   ✅ Google Classroom docs: ${GREEN}REMOVED${NC}"
    else
        echo -e "   ❌ Google Classroom docs: ${RED}STILL EXISTS${NC}"
        return 1
    fi
}

# Main test execution
main() {
    echo "Starting Moodle Integration Tests..."
    echo "===================================="
    
    local failed_tests=0
    
    # Run all tests
    test_database_connectivity || ((failed_tests++))
    test_moodle_service || ((failed_tests++))
    test_oauth_configuration || ((failed_tests++))
    test_api_endpoints || ((failed_tests++))
    test_content_services || ((failed_tests++))
    test_ui_components || ((failed_tests++))
    test_google_classroom_removal || ((failed_tests++))
    
    echo -e "\n================================"
    echo -e "Test Results Summary"
    echo -e "================================"
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "🎉 All tests ${GREEN}PASSED${NC}!"
        echo -e "✅ Moodle integration is working correctly."
        exit 0
    else
        echo -e "❌ $failed_tests test(s) ${RED}FAILED${NC}."
        echo -e "⚠️  Please check the failed tests above."
        exit 1
    fi
}

# Check if Docker Compose is available
if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed or not in PATH${NC}"
    exit 1
fi

# Check if services are running
if ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Warning: Some services may not be running. Starting services...${NC}"
    docker compose up -d
    sleep 10
fi

# Run tests
main
