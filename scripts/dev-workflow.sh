#!/bin/bash

# Development Workflow Script for MediVerse
# Ensures clean builds and proper environment setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env file not found, creating from example..."
        cp env.example .env
        print_success ".env file created"
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Prerequisites check complete"
}

# Function to clean build artifacts
clean_build_artifacts() {
    print_status "Cleaning build artifacts..."
    
    # Clean frontend build
    rm -rf dist .vite node_modules/.vite
    
    # Clean server build
    rm -rf server/dist
    
    # Clean Prisma generated files
    rm -rf node_modules/.prisma generated
    
    print_success "Build artifacts cleaned"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server && npm install && cd ..
    
    print_success "Dependencies installed"
}

# Function to generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npm run prisma:generate
    print_success "Prisma client generated"
}

# Function to build server
build_server() {
    print_status "Building server..."
    cd server && npm run build && cd ..
    print_success "Server built"
}

# Function to rebuild Docker containers
rebuild_docker() {
    print_status "Rebuilding Docker containers..."
    ./scripts/docker-rebuild.sh
    print_success "Docker containers rebuilt"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Start Docker services
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 10
    
    # Start frontend dev server
    print_status "Starting frontend dev server..."
    npm run dev &
    
    print_success "Development environment started"
    print_status "Frontend: http://localhost:8080"
    print_status "API: http://localhost:3000"
    print_status "Moodle: http://localhost:8081"
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Available endpoints:"
    echo "  Frontend: http://localhost:8080"
    echo "  API: http://localhost:3000"
    echo "  API Health: http://localhost:3000/health"
    echo "  Moodle: http://localhost:8081"
    echo "  Prisma Studio: npm run prisma:studio"
}

# Main function
main() {
    local action=${1:-"full"}
    
    echo "🚀 MediVerse Development Workflow"
    echo "================================="
    
    case "$action" in
        "full")
            print_status "Running full development setup..."
            check_prerequisites
            clean_build_artififacts
            install_dependencies
            generate_prisma
            build_server
            rebuild_docker
            start_dev
            show_status
            ;;
        "clean")
            print_status "Cleaning build artifacts..."
            clean_build_artifacts
            print_success "Clean complete"
            ;;
        "rebuild")
            print_status "Rebuilding everything..."
            clean_build_artifacts
            build_server
            rebuild_docker
            print_success "Rebuild complete"
            ;;
        "docker")
            print_status "Rebuilding Docker containers..."
            rebuild_docker
            print_success "Docker rebuild complete"
            ;;
        "start")
            print_status "Starting development environment..."
            start_dev
            show_status
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 [action]"
            echo ""
            echo "Actions:"
            echo "  full     Full development setup (default)"
            echo "  clean    Clean build artifacts only"
            echo "  rebuild  Rebuild everything"
            echo "  docker   Rebuild Docker containers only"
            echo "  start    Start development environment"
            echo "  status   Show service status"
            ;;
    esac
}

main "$@"
