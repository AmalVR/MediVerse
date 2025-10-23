#!/bin/bash

# Docker Rebuild Script for MediVerse
# Ensures clean builds to prevent caching issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to stop containers gracefully
stop_containers() {
    print_status "Stopping containers..."
    docker-compose down || true
    print_success "Containers stopped"
}

# Function to clean up old images
cleanup_images() {
    print_status "Cleaning up old images..."
    docker image prune -f || true
    print_success "Image cleanup complete"
}

# Function to rebuild with no-cache
rebuild_no_cache() {
    local service=${1:-""}
    
    if [ -n "$service" ]; then
        print_status "Rebuilding $service with no-cache..."
        docker-compose build --no-cache "$service"
        print_success "$service rebuilt"
    else
        print_status "Rebuilding all services with no-cache..."
        docker-compose build --no-cache
        print_success "All services rebuilt"
    fi
}

# Function to start services
start_services() {
    local service=${1:-""}
    
    print_status "Starting services..."
    if [ -n "$service" ]; then
        docker-compose up -d "$service"
    else
        docker-compose up -d
    fi
    print_success "Services started"
}

# Function to wait for services to be healthy
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    # Check if API is responding
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            print_success "API is healthy"
            return 0
        fi
        
        print_status "Waiting for API... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "API health check timeout - please check logs manually"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Main function
main() {
    local service=${1:-""}
    local skip_cleanup=${2:-"false"}
    
    echo "🔨 MediVerse Docker Rebuild Script"
    echo "=================================="
    
    # Check Docker
    check_docker
    
    # Stop containers
    stop_containers
    
    # Cleanup (optional)
    if [ "$skip_cleanup" != "true" ]; then
        cleanup_images
    fi
    
    # Rebuild
    rebuild_no_cache "$service"
    
    # Start services
    start_services "$service"
    
    # Wait for health
    wait_for_health
    
    # Show status
    show_status
    
    print_success "Rebuild complete! 🎉"
}

# Help function
show_help() {
    echo "Usage: $0 [service] [skip-cleanup]"
    echo ""
    echo "Arguments:"
    echo "  service       Specific service to rebuild (e.g., 'api', 'moodle')"
    echo "  skip-cleanup  Set to 'true' to skip image cleanup"
    echo ""
    echo "Examples:"
    echo "  $0                    # Rebuild all services"
    echo "  $0 api                # Rebuild only API service"
    echo "  $0 api true           # Rebuild API without cleanup"
    echo ""
    echo "Available services:"
    echo "  api, websocket, moodle, postgres, redis"
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
