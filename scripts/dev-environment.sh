#!/bin/bash
# scripts/dev-environment.sh
# Comprehensive development environment setup with build optimization

set -e

log_info() {
  echo -e "\033[0;34m[INFO]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log_error() {
  echo -e "\033[0;31m[ERROR]\033[0m $1"
  exit 1
}

log_warn() {
  echo -e "\033[0;33m[WARN]\033[0m $1"
}

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
BUILD_CACHE_DIR=".docker-cache"
IMAGE_TAG="mediverse-dev"

echo "🚀 MediVerse Development Environment Setup"
echo "=========================================="

# 1. Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Check Docker
  if ! command -v docker >/dev/null 2>&1; then
    log_error "Docker is not installed. Please install Docker Desktop."
  fi
  
  # Check Docker daemon
  if ! docker info >/dev/null 2>&1; then
    log_error "Docker daemon is not running. Please start Docker Desktop."
  fi
  
  # Check Docker Compose
  if ! command -v docker >/dev/null 2>&1; then
    log_error "Docker Compose is not installed."
  fi
  
  log_success "Prerequisites check passed"
}

# 2. Create build cache directory
setup_build_cache() {
  log_info "Setting up build cache..."
  mkdir -p "$BUILD_CACHE_DIR"
  log_success "Build cache directory created: $BUILD_CACHE_DIR"
}

# 3. Build images with cache optimization
build_images() {
  log_info "Building Docker images with cache optimization..."
  
  # Build API image
  log_info "Building API image..."
  docker build \
    --target production \
    --cache-from "$IMAGE_TAG-api:latest" \
    --tag "$IMAGE_TAG-api:latest" \
    --file Dockerfile.api \
    .
  
  # Build Moodle image
  log_info "Building Moodle image..."
  docker build \
    --cache-from "$IMAGE_TAG-moodle:latest" \
    --tag "$IMAGE_TAG-moodle:latest" \
    --file Dockerfile.moodle \
    .
  
  log_success "Images built successfully"
}

# 4. Start services with health checks
start_services() {
  log_info "Starting Docker services..."
  
  # Stop any existing containers
  docker compose -f "$DOCKER_COMPOSE_FILE" down -v 2>/dev/null || true
  
  # Start services
  docker compose -f "$DOCKER_COMPOSE_FILE" up -d
  
  log_success "Services started"
}

# 5. Wait for database to be ready
wait_for_database() {
  log_info "Waiting for database to be ready..."
  
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if docker compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U mediverse -d postgres >/dev/null 2>&1; then
      log_success "Database is ready"
      return 0
    fi
    
    log_info "Database not ready yet (attempt $attempt/$max_attempts)..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  log_error "Database failed to become ready after $max_attempts attempts"
}

# 6. Initialize databases
initialize_databases() {
  log_info "Initializing databases..."
  
  # Run database initialization script
  if [ -f "scripts/init-databases.sh" ]; then
    docker compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres bash -c "
      until pg_isready -U mediverse -d postgres; do
        echo 'Waiting for postgres...'
        sleep 1
      done
      
      # Create databases
      psql -U mediverse -d postgres -c 'CREATE DATABASE IF NOT EXISTS mediverse;' || true
      psql -U mediverse -d postgres -c 'CREATE DATABASE IF NOT EXISTS moodle;' || true
      
      # Grant privileges
      psql -U mediverse -d postgres -c 'GRANT ALL PRIVILEGES ON DATABASE mediverse TO mediverse;' || true
      psql -U mediverse -d postgres -c 'GRANT ALL PRIVILEGES ON DATABASE moodle TO mediverse;' || true
      
      echo 'Databases initialized successfully'
    "
  else
    log_warn "Database initialization script not found, skipping..."
  fi
  
  log_success "Database initialization completed"
}

# 7. Run Prisma migrations
run_migrations() {
  log_info "Running Prisma migrations..."
  
  # Generate Prisma client
  docker compose -f "$DOCKER_COMPOSE_FILE" exec -T api npx prisma generate
  
  # Run migrations
  docker compose -f "$DOCKER_COMPOSE_FILE" exec -T api npx prisma db push
  
  log_success "Migrations completed"
}

# 8. Start development servers
start_dev_servers() {
  log_info "Starting development servers..."
  
  # Start API server in background
  log_info "Starting API server..."
  docker compose -f "$DOCKER_COMPOSE_FILE" exec -d api npm run start &
  
  # Start frontend server
  log_info "Starting frontend server..."
  npm run dev &
  
  log_success "Development servers started"
}

# 9. Show status
show_status() {
  log_info "Development environment status:"
  echo ""
  
  # Docker containers
  echo "📦 Docker Containers:"
  docker compose -f "$DOCKER_COMPOSE_FILE" ps
  echo ""
  
  # Services
  echo "🌐 Services:"
  echo "  Frontend: http://localhost:8080"
  echo "  API: http://localhost:3000"
  echo "  Moodle: http://localhost:8081"
  echo "  Database: postgres:5432"
  echo ""
  
  # Health checks
  echo "🏥 Health Checks:"
  
  # Check frontend
  if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "  ✅ Frontend: Running"
  else
    echo "  ❌ Frontend: Not accessible"
  fi
  
  # Check API
  if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    echo "  ✅ API: Running"
  else
    echo "  ❌ API: Not accessible"
  fi
  
  # Check Moodle
  if curl -s http://localhost:8081 >/dev/null 2>&1; then
    echo "  ✅ Moodle: Running"
  else
    echo "  ❌ Moodle: Not accessible"
  fi
  
  # Check database
  if docker compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U mediverse -d postgres >/dev/null 2>&1; then
    echo "  ✅ Database: Running"
  else
    echo "  ❌ Database: Not accessible"
  fi
}

# 10. Cleanup function
cleanup() {
  log_info "Cleaning up..."
  docker compose -f "$DOCKER_COMPOSE_FILE" down -v
  log_success "Cleanup completed"
}

# Main execution
main() {
  case "${1:-setup}" in
    "setup")
      check_prerequisites
      setup_build_cache
      build_images
      start_services
      wait_for_database
      initialize_databases
      run_migrations
      start_dev_servers
      show_status
      ;;
    "start")
      start_services
      wait_for_database
      start_dev_servers
      show_status
      ;;
    "stop")
      cleanup
      ;;
    "status")
      show_status
      ;;
    "rebuild")
      cleanup
      build_images
      start_services
      wait_for_database
      initialize_databases
      run_migrations
      start_dev_servers
      show_status
      ;;
    *)
      echo "Usage: $0 {setup|start|stop|status|rebuild}"
      echo ""
      echo "Commands:"
      echo "  setup   - Full setup (build images, start services, run migrations)"
      echo "  start   - Start existing services"
      echo "  stop    - Stop all services"
      echo "  status  - Show current status"
      echo "  rebuild - Rebuild images and restart services"
      exit 1
      ;;
  esac
}

# Handle Ctrl+C
trap cleanup EXIT

# Run main function
main "$@"
