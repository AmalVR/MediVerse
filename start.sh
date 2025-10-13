#!/bin/bash

# MediVerse Startup Script
# Checks prerequisites, sets up environment, and starts the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║         MediVerse - Startup Script                ║"
    echo "║    Voice-Driven Anatomy Learning Platform         ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found!"
        missing_tools+=("Node.js (install from https://nodejs.org/ or use: brew install node)")
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_success "npm installed: v$NPM_VERSION"
    else
        print_error "npm not found!"
        missing_tools+=("npm (usually comes with Node.js)")
    fi
    
    # Check PostgreSQL (optional - can use Docker)
    if command_exists psql; then
        PSQL_VERSION=$(psql --version | awk '{print $3}')
        print_success "PostgreSQL installed: $PSQL_VERSION"
    else
        print_warning "PostgreSQL not found (will use Docker)"
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker installed"
    else
        print_warning "Docker not found (optional for database)"
    fi
    
    # If any tools are missing, show installation instructions
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi
    
    echo ""
}

# Check and create .env file
setup_environment() {
    print_info "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            print_warning ".env file not found, creating from env.example"
            cp env.example .env
            print_success ".env file created"
            print_warning "Please edit .env file with your GCP credentials before running again"
            exit 0
        elif [ -f .env.example ]; then
            print_warning ".env file not found, creating from .env.example"
            cp .env.example .env
            print_success ".env file created"
            print_warning "Please edit .env file with your GCP credentials before running again"
            exit 0
        else
            print_error "env.example not found! Creating default..."
            cat > .env << 'ENVEOF'
# Database
DATABASE_URL="postgresql://mediverse:mediverse_password@localhost:5432/mediverse"

# GCP Configuration (EDIT THESE!)
GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
VITE_GCP_PROJECT_ID="your-gcp-project-id"
GCP_DIALOGFLOW_AGENT_ID="projects/your-project-id/locations/us-central1/agents/your-agent-id"

# API URLs
VITE_API_URL="http://localhost:3000/api"
VITE_WS_URL="http://localhost:3001"

# Models
VITE_MODELS_BASE_URL="/models"

# Feature Flags
VITE_ENABLE_GCP_SPEECH="true"
VITE_ENABLE_VOICE_FEEDBACK="true"
VITE_ENABLE_REALTIME_SYNC="true"

# Development
NODE_ENV="development"
PORT="3000"
WS_PORT="3001"
ENVEOF
            print_success ".env file created with defaults"
            print_warning "Please edit .env file with your GCP credentials before running again"
            exit 0
        fi
    else
        print_success ".env file exists"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi
    
    if [ ! -d "server/node_modules" ]; then
        print_info "Installing server dependencies..."
        cd server && npm install && cd ..
        print_success "Server dependencies installed"
    else
        print_success "Server dependencies already installed"
    fi
    
    echo ""
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env 2>/dev/null; then
        # Check if using Docker
        if command_exists docker && docker ps | grep -q mediverse-db; then
            print_success "Database container already running"
        elif command_exists docker; then
            print_info "Starting PostgreSQL in Docker..."
            docker compose -f docker-compose.dev.yml up -d postgres 2>/dev/null || \
            docker-compose -f docker-compose.dev.yml up -d postgres
            print_info "Waiting for database to be ready..."
            sleep 5
            print_success "Database container started"
        fi
        
        # Generate Prisma client
        if [ ! -d "node_modules/.prisma" ]; then
            print_info "Generating Prisma client..."
            npm run zenstack
            npm run prisma:generate
            print_success "Prisma client generated"
        fi
        
        # Push schema
        print_info "Pushing database schema..."
        npm run prisma:push 2>/dev/null || {
            print_warning "Database might not be ready or schema already pushed"
        }
        
        # Seed database
        print_info "Seeding database..."
        npm run db:seed 2>/dev/null || {
            print_warning "Database seeding skipped (might already be seeded)"
        }
        
        print_success "Database setup complete"
    else
        print_warning "DATABASE_URL not set in .env, skipping database setup"
    fi
    
    echo ""
}

# Start development servers
start_servers() {
    print_info "Starting development servers..."
    
    echo ""
    print_success "🚀 MediVerse is starting!"
    echo ""
    echo -e "${CYAN}Frontend:${NC}  http://localhost:5173"
    echo -e "${CYAN}API:${NC}       http://localhost:3000"
    echo -e "${CYAN}WebSocket:${NC} http://localhost:3001"
    if command_exists docker && docker ps | grep -q mediverse-pgadmin; then
        echo -e "${CYAN}pgAdmin:${NC}   http://localhost:5050"
    fi
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
    echo ""
    
    # Create a trap to kill all background processes on exit
    trap 'kill $(jobs -p) 2>/dev/null; exit' INT TERM EXIT
    
    # Start frontend
    print_info "Starting frontend (Vite)..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a bit for frontend to start
    sleep 3
    
    # Start backend (API + WebSocket)
    if [ -d "server" ]; then
        print_info "Starting backend servers..."
        npm run server &
        BACKEND_PID=$!
    fi
    
    # Wait for all background processes
    wait
}

# Main menu
show_menu() {
    echo ""
    echo -e "${CYAN}Choose startup mode:${NC}"
    echo "1) Full setup + start (first time or after changes)"
    echo "2) Quick start (skip setup, just run servers)"
    echo "3) Database only (setup/reset database)"
    echo "4) Docker mode (infrastructure only)"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice
    echo ""
    
    case $choice in
        1)
            print_header
            check_prerequisites
            setup_environment
            install_dependencies
            setup_database
            start_servers
            ;;
        2)
            print_header
            print_info "Quick start mode - skipping setup checks"
            echo ""
            start_servers
            ;;
        3)
            print_header
            print_info "Database setup mode"
            echo ""
            setup_database
            print_success "Database setup complete!"
            ;;
        4)
            print_header
            print_info "Starting Docker infrastructure..."
            docker-compose -f docker-compose.dev.yml up -d
            print_success "Docker containers started:"
            echo ""
            docker-compose -f docker-compose.dev.yml ps
            echo ""
            print_info "Now run: npm run dev (in another terminal)"
            ;;
        5)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice!"
            show_menu
            ;;
    esac
}

# Check if script is run with arguments
if [ $# -eq 0 ]; then
    show_menu
else
    case "$1" in
        --full)
            print_header
            check_prerequisites
            setup_environment
            install_dependencies
            setup_database
            start_servers
            ;;
        --quick)
            print_header
            start_servers
            ;;
        --db)
            print_header
            setup_database
            ;;
        --docker)
            print_header
            print_info "Starting Docker infrastructure..."
            docker-compose -f docker-compose.dev.yml up -d
            docker-compose -f docker-compose.dev.yml ps
            ;;
        --help)
            echo "MediVerse Startup Script"
            echo ""
            echo "Usage: ./start.sh [option]"
            echo ""
            echo "Options:"
            echo "  (no args)   Show interactive menu"
            echo "  --full      Full setup + start"
            echo "  --quick     Quick start (skip setup)"
            echo "  --db        Setup database only"
            echo "  --docker    Start Docker containers only"
            echo "  --help      Show this help"
            echo ""
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
fi

