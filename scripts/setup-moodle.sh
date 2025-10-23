#!/bin/bash

# Moodle Setup Script for MediVerse
# This script helps set up Moodle LMS integration

set -e

echo "🚀 MediVerse Moodle Setup Script"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Use docker compose if available, otherwise docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ Docker and docker-compose are available"

# Function to start Moodle services
start_moodle() {
    echo "📦 Starting Moodle services..."
    
    if [ "$1" = "dev" ]; then
        echo "Starting development environment..."
        $DOCKER_COMPOSE -f docker-compose.dev.yml up moodle moodle-db-dev -d
        echo "✅ Moodle development environment started"
        echo "🌐 Access Moodle at: http://localhost:8081"
        echo "👤 Admin credentials: admin / admin123!"
    else
        echo "Starting production environment..."
        $DOCKER_COMPOSE up moodle moodle-db -d
        echo "✅ Moodle production environment started"
        echo "🌐 Access Moodle at: http://localhost:8081"
        echo "👤 Admin credentials: admin / admin123!"
    fi
}

# Function to check Moodle status
check_moodle() {
    echo "🔍 Checking Moodle status..."
    
    if [ "$1" = "dev" ]; then
        CONTAINER_NAME="mediverse-moodle-dev"
        DB_CONTAINER="mediverse-moodle-db-dev"
    else
        CONTAINER_NAME="mediverse-moodle"
        DB_CONTAINER="mediverse-moodle-db"
    fi
    
    # Check if containers are running
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo "✅ Moodle container is running"
    else
        echo "❌ Moodle container is not running"
        return 1
    fi
    
    if docker ps | grep -q "$DB_CONTAINER"; then
        echo "✅ Moodle database container is running"
    else
        echo "❌ Moodle database container is not running"
        return 1
    fi
    
    # Check if Moodle is accessible
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200\|302"; then
        echo "✅ Moodle is accessible at http://localhost:8081"
    else
        echo "⚠️  Moodle may still be starting up. Please wait a moment and check http://localhost:8081"
    fi
}

# Function to stop Moodle services
stop_moodle() {
    echo "🛑 Stopping Moodle services..."
    
    if [ "$1" = "dev" ]; then
        $DOCKER_COMPOSE -f docker-compose.dev.yml stop moodle moodle-db-dev
        echo "✅ Moodle development environment stopped"
    else
        $DOCKER_COMPOSE stop moodle moodle-db
        echo "✅ Moodle production environment stopped"
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Showing Moodle logs..."
    
    if [ "$1" = "dev" ]; then
        CONTAINER_NAME="mediverse-moodle-dev"
    else
        CONTAINER_NAME="mediverse-moodle"
    fi
    
    docker logs -f "$CONTAINER_NAME"
}

# Function to reset Moodle data
reset_moodle() {
    echo "⚠️  This will delete all Moodle data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  Resetting Moodle data..."
        
        if [ "$1" = "dev" ]; then
            $DOCKER_COMPOSE -f docker-compose.dev.yml down -v
            docker volume rm mediverse_moodle_dev_data mediverse_moodle_dev_code mediverse_moodle_db_dev_data 2>/dev/null || true
            echo "✅ Moodle development data reset"
        else
            $DOCKER_COMPOSE down -v
            docker volume rm mediverse_moodle_data mediverse_moodle_code mediverse_moodle_db_data 2>/dev/null || true
            echo "✅ Moodle production data reset"
        fi
    else
        echo "❌ Reset cancelled"
    fi
}

# Function to create API token
create_api_token() {
    echo "🔑 Creating API token..."
    echo "Please follow these steps:"
    echo "1. Go to http://localhost:8081"
    echo "2. Login as admin (admin / admin123!)"
    echo "3. Go to Site Administration → Server → Web services → Manage tokens"
    echo "4. Create a new token for user 'mediverse_api'"
    echo "5. Copy the token and add it to your .env file as MOODLE_API_TOKEN"
    echo ""
    echo "Press Enter when done..."
    read -r
}

# Function to configure OAuth
configure_oauth() {
    echo "🔐 Configuring OAuth 2.0..."
    echo "Please follow these steps:"
    echo "1. Go to Google Cloud Console (https://console.cloud.google.com/)"
    echo "2. Create OAuth 2.0 credentials"
    echo "3. Add redirect URI: http://localhost:8081/auth/oauth2/callback.php"
    echo "4. Copy Client ID and Client Secret"
    echo "5. Go to Moodle → Site Administration → Plugins → Authentication → Manage authentication"
    echo "6. Enable OAuth 2 and configure Google provider"
    echo ""
    echo "Press Enter when done..."
    read -r
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Start Moodle (development)"
    echo "2) Start Moodle (production)"
    echo "3) Check Moodle status"
    echo "4) Stop Moodle"
    echo "5) Show Moodle logs"
    echo "6) Reset Moodle data"
    echo "7) Create API token"
    echo "8) Configure OAuth 2.0"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice (1-9): " choice
}

# Main script logic
case "${1:-menu}" in
    "start-dev")
        start_moodle "dev"
        ;;
    "start-prod")
        start_moodle "prod"
        ;;
    "status")
        check_moodle "${2:-dev}"
        ;;
    "stop")
        stop_moodle "${2:-dev}"
        ;;
    "logs")
        show_logs "${2:-dev}"
        ;;
    "reset")
        reset_moodle "${2:-dev}"
        ;;
    "api-token")
        create_api_token
        ;;
    "oauth")
        configure_oauth
        ;;
    "menu"|*)
        while true; do
            show_menu
            case $choice in
                1)
                    start_moodle "dev"
                    check_moodle "dev"
                    ;;
                2)
                    start_moodle "prod"
                    check_moodle "prod"
                    ;;
                3)
                    check_moodle "dev"
                    ;;
                4)
                    stop_moodle "dev"
                    ;;
                5)
                    show_logs "dev"
                    ;;
                6)
                    reset_moodle "dev"
                    ;;
                7)
                    create_api_token
                    ;;
                8)
                    configure_oauth
                    ;;
                9)
                    echo "👋 Goodbye!"
                    exit 0
                    ;;
                *)
                    echo "❌ Invalid choice. Please try again."
                    ;;
            esac
        done
        ;;
esac
