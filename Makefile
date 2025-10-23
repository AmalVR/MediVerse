# MediVerse Makefile - Quick commands

.PHONY: help start stop install setup db clean test

# Default target
help:
	@echo "MediVerse - Available Commands"
	@echo "================================"
	@echo ""
	@echo "Startup:"
	@echo "  make start          Start the application (interactive)"
	@echo "  make start-full     Full setup + start"
	@echo "  make start-quick    Quick start (skip setup)"
	@echo ""
	@echo "Setup:"
	@echo "  make install        Install all dependencies"
	@echo "  make setup          Full project setup"
	@echo "  make db             Setup database"
	@echo ""
	@echo "Database:"
	@echo "  make db-push        Push schema to database"
	@echo "  make db-seed        Seed anatomy data"
	@echo "  make db-reset       Reset and reseed database"
	@echo "  make db-studio      Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev         Start Docker dev environment"
	@echo "  make docker-prod        Start Docker production"
	@echo "  make docker-stop        Stop Docker containers"
	@echo "  make docker-clean       Remove containers and volumes"
	@echo "  make docker-rebuild-api Rebuild API container (no-cache)"
	@echo "  make docker-rebuild-moodle Rebuild Moodle container (no-cache)"
	@echo "  make docker-rebuild-all Rebuild all containers (no-cache)"
	@echo "  make docker-restart-api Restart API container only"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Start frontend dev server"
	@echo "  make dev-full       Full development setup (clean + rebuild + start)"
	@echo "  make dev-clean      Clean development artifacts"
	@echo "  make dev-rebuild    Rebuild development environment"
	@echo "  make dev-status     Show development status"
	@echo "  make server         Start backend servers"
	@echo ""
	@echo "Models:"
	@echo "  make convert-models Convert Z-Anatomy Blender to GLB"
	@echo "  make inspect-models Inspect Blender file structure"
	@echo ""
	@echo "Testing:"
	@echo "  make test-api       Test API endpoints"
	@echo "  make test-dialogflow Test Dialogflow integration"
	@echo ""
	@echo "Build:"
	@echo "  make build              Build frontend"
	@echo "  make build-server       Build server only"
	@echo "  make build-docker       Build Docker images"
	@echo "  make build-docker-clean Build Docker images (no-cache)"
	@echo "  make build-all          Build everything (no-cache)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          Clean build artifacts"
	@echo "  make clean-all      Deep clean (includes node_modules)"
	@echo "  make logs           View Docker logs"
	@echo ""

# Startup
start:
	@./start.sh

start-full:
	@./start.sh --full

start-quick:
	@./start.sh --quick

stop:
	@pkill -f "vite" || true
	@pkill -f "node.*server" || true
	@echo "✅ Servers stopped"

# Installation
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@cd server && npm install
	@echo "✅ Dependencies installed"

setup: install
	@echo "⚙️  Setting up project..."
	@test -f .env || cp .env.example .env
	@npm run zenstack
	@npm run prisma:generate
	@echo "✅ Setup complete"

# Database
db:
	@./start.sh --db

db-push:
	@npm run prisma:push

db-seed:
	@npm run db:seed

db-reset:
	@npm run prisma:push -- --force-reset
	@npm run db:seed
	@echo "✅ Database reset complete"

db-studio:
	@npm run prisma:studio

# Docker
docker-dev:
	@docker-compose -f docker-compose.dev.yml up -d
	@docker-compose -f docker-compose.dev.yml ps

docker-prod:
	@docker-compose up -d
	@docker-compose ps

docker-stop:
	@docker-compose down

docker-clean:
	@docker-compose down -v
	@echo "✅ Docker cleaned"

docker-rebuild-api:
	@echo "🔨 Rebuilding API container with no-cache..."
	@./scripts/docker-rebuild.sh api
	@echo "✅ API container rebuilt"

docker-rebuild-all:
	@echo "🔨 Rebuilding all containers with no-cache..."
	@./scripts/docker-rebuild.sh
	@echo "✅ All containers rebuilt"

docker-rebuild-moodle:
	@echo "🔨 Rebuilding Moodle container with no-cache..."
	@./scripts/docker-rebuild.sh moodle
	@echo "✅ Moodle container rebuilt"

docker-restart-api:
	@echo "🔄 Restarting API container..."
	@docker-compose restart api
	@echo "✅ API container restarted"

logs:
	@docker-compose logs -f

# Development
dev:
	@npm run dev

dev-full:
	@echo "🚀 Starting full development environment..."
	@./scripts/dev-workflow.sh full

dev-clean:
	@echo "🧹 Cleaning development environment..."
	@./scripts/dev-workflow.sh clean

dev-rebuild:
	@echo "🔨 Rebuilding development environment..."
	@./scripts/dev-workflow.sh rebuild

dev-status:
	@./scripts/dev-workflow.sh status

server:
	@npm run server

# Models
convert-models:
	@echo "🎨 Converting Z-Anatomy models to GLB..."
	@blender --background public/models/Z-Anatomy/Startup.blend \
		--python scripts/export-z-anatomy-main-systems.py
	@echo "✅ Models converted"

inspect-models:
	@echo "🔍 Inspecting Z-Anatomy Blender file..."
	@blender --background public/models/Z-Anatomy/Startup.blend \
		--python scripts/inspect-blender.py

extract-ontology:
	@echo "📋 Extracting Z-Anatomy part names ontology..."
	@npm run extract:ontology
	@echo "✅ Ontology extracted to data/z-anatomy-ontology.json"

integrate-z-anatomy: convert-models extract-ontology
	@echo "🔄 Updating database with Z-Anatomy ontology..."
	@npm run db:seed:z-anatomy
	@echo "✅ Z-Anatomy fully integrated!"

# Testing
test-api:
	@echo "🧪 Testing API..."
	@curl -s http://localhost:3000/health | jq '.'
	@curl -s http://localhost:3000/api/anatomy/parts?system=SKELETAL | jq 'length'

test-dialogflow:
	@npm run test:dialogflow "show the heart"

# Maintenance
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist server/dist .zenstack
	@echo "✅ Clean complete"

clean-all: clean
	@echo "🧹 Deep cleaning..."
	@rm -rf node_modules server/node_modules package-lock.json server/package-lock.json
	@echo "✅ Deep clean complete"

# Build
build:
	@npm run build

build-docker:
	@docker-compose build

build-docker-clean:
	@echo "🔨 Clean Docker build (no-cache)..."
	@docker-compose build --no-cache
	@echo "✅ Clean Docker build complete"

build-server:
	@echo "🔨 Building server..."
	@cd server && npm run build
	@echo "✅ Server built"

build-all: build-server build-docker-clean
	@echo "✅ All builds complete"


# OAuth Configuration
oauth-validate:
	@echo "🔍 Validating OAuth configuration..."
	@./scripts/validate-env.sh

oauth-backup:
	@echo "💾 Backing up OAuth configuration..."
	@./scripts/backup-oauth-config.sh

oauth-restore:
	@echo "🔄 Restoring OAuth configuration..."
	@./scripts/restore-oauth-config.sh

dev-safe:
	@echo "🚀 Starting development with OAuth validation..."
	@./scripts/dev-start.sh

oauth-status:
	@echo "📊 Checking OAuth status..."
	@./scripts/oauth-status.sh
