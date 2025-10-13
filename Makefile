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
	@echo "  make docker-dev     Start Docker dev environment"
	@echo "  make docker-prod    Start Docker production"
	@echo "  make docker-stop    Stop Docker containers"
	@echo "  make docker-clean   Remove containers and volumes"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Start frontend dev server"
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

logs:
	@docker-compose logs -f

# Development
dev:
	@npm run dev

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

