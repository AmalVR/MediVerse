#!/bin/bash
# scripts/fix-database-connectivity.sh
# Fix database connectivity issues

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

echo "🔧 Fixing Database Connectivity Issues"
echo "====================================="

# 1. Check Docker daemon
log_info "Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  log_error "Docker daemon is not running. Please start Docker Desktop."
fi
log_success "Docker daemon is running"

# 2. Stop existing containers
log_info "Stopping existing containers..."
docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
log_success "Existing containers stopped"

# 3. Clean up networks
log_info "Cleaning up Docker networks..."
docker network prune -f
log_success "Docker networks cleaned"

# 4. Start services with proper networking
log_info "Starting services with proper networking..."
docker compose -f docker-compose.dev.yml up -d postgres

# 5. Wait for database to be ready
log_info "Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mediverse -d postgres >/dev/null 2>&1; then
    log_success "Database is ready"
    break
  fi
  
  log_info "Database not ready yet (attempt $attempt/$max_attempts)..."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  log_error "Database failed to become ready after $max_attempts attempts"
fi

# 6. Initialize databases
log_info "Initializing databases..."
docker compose -f docker-compose.dev.yml exec -T postgres bash -c "
  # Create databases if they don't exist
  psql -U mediverse -d postgres -c 'CREATE DATABASE mediverse;' 2>/dev/null || echo 'mediverse database already exists'
  psql -U mediverse -d postgres -c 'CREATE DATABASE moodle;' 2>/dev/null || echo 'moodle database already exists'
  
  # Grant privileges
  psql -U mediverse -d postgres -c 'GRANT ALL PRIVILEGES ON DATABASE mediverse TO mediverse;'
  psql -U mediverse -d postgres -c 'GRANT ALL PRIVILEGES ON DATABASE moodle TO mediverse;'
  
  echo 'Databases initialized successfully'
"
log_success "Databases initialized"

# 7. Start remaining services
log_info "Starting remaining services..."
docker compose -f docker-compose.dev.yml up -d

# 8. Wait for all services to be healthy
log_info "Waiting for all services to be healthy..."
sleep 10

# 9. Test connectivity
log_info "Testing connectivity..."

# Test database connectivity
if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mediverse -d mediverse >/dev/null 2>&1; then
  log_success "MediVerse database connectivity: OK"
else
  log_warn "MediVerse database connectivity: FAILED"
fi

if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mediverse -d moodle >/dev/null 2>&1; then
  log_success "Moodle database connectivity: OK"
else
  log_warn "Moodle database connectivity: FAILED"
fi

# Test API connectivity
if curl -s http://localhost:3000/health >/dev/null 2>&1; then
  log_success "API connectivity: OK"
else
  log_warn "API connectivity: FAILED (may need time to start)"
fi

# Test Moodle connectivity
if curl -s http://localhost:8081 >/dev/null 2>&1; then
  log_success "Moodle connectivity: OK"
else
  log_warn "Moodle connectivity: FAILED (may need time to start)"
fi

# 10. Show final status
log_info "Final status:"
docker compose -f docker-compose.dev.yml ps

echo ""
log_success "Database connectivity fix completed!"
echo ""
echo "🌐 Services:"
echo "  Frontend: http://localhost:8080 (run 'npm run dev')"
echo "  API: http://localhost:3000"
echo "  Moodle: http://localhost:8081"
echo "  Database: postgres:5432"
echo ""
echo "📋 Useful commands:"
echo "  make dev-logs       - Show all logs"
echo "  make dev-logs-api   - Show API logs"
echo "  make dev-logs-db    - Show database logs"
echo "  make dev-status     - Show status"
