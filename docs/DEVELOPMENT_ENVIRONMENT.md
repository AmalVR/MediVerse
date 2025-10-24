# MediVerse Development Environment

This document outlines the optimized development environment setup that addresses database connectivity issues and provides efficient build caching.

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)

```bash
# Full setup with optimized builds
make dev-setup
```

### Option 2: Fix Existing Issues

```bash
# If you're experiencing database connectivity issues
make dev-fix-db
```

### Option 3: Quick Start (if images already built)

```bash
# Quick start assuming images are already built
make dev-quick
```

## 🔧 Available Commands

### Development Environment Management

- `make dev-setup` - Set up complete development environment
- `make dev-start` - Start existing development services
- `make dev-stop` - Stop all development services
- `make dev-status` - Show development environment status
- `make dev-rebuild` - Rebuild images and restart services

### Quick Commands

- `make dev-quick` - Quick start (assumes images built)
- `make dev-fix-db` - Fix database connectivity issues

### Logging

- `make dev-logs` - Show logs for all services
- `make dev-logs-api` - Show API logs
- `make dev-logs-moodle` - Show Moodle logs
- `make dev-logs-db` - Show database logs

## 🏗️ Architecture Improvements

### 1. Optimized Docker Builds

- **Separate Dockerfiles**: `Dockerfile.api` and `Dockerfile.moodle`
- **Build Caching**: Images are built once and cached
- **Layer Optimization**: Efficient layer ordering for faster rebuilds

### 2. Better Networking

- **Isolated Network**: `mediverse-network` with custom subnet
- **Health Checks**: Proper health checks for all services
- **Service Dependencies**: Services start in correct order

### 3. Database Connectivity Fixes

- **Proper Health Checks**: Database readiness verification
- **Network Isolation**: Services communicate via Docker network
- **Automatic Initialization**: Database setup scripts run automatically

## 📁 File Structure

```
scripts/
├── dev-environment.sh          # Main development environment script
├── fix-database-connectivity.sh # Database connectivity fix
└── init-databases.sh          # Database initialization

docker/
└── moodle/
    ├── apache.conf            # Apache configuration
    ├── config.php.template     # Moodle config template
    └── install-moodle.sh      # Moodle installation script

Dockerfile.moodle              # Optimized Moodle build
docker-compose.dev.yml         # Development compose file
```

## 🔍 Troubleshooting

### Database Connectivity Issues

**Problem**: `Can't reach database server at postgres:5432`

**Solution**:

```bash
make dev-fix-db
```

This script will:

1. Stop existing containers
2. Clean up Docker networks
3. Start services with proper networking
4. Wait for database readiness
5. Initialize databases
6. Test connectivity

### Service Not Starting

**Check status**:

```bash
make dev-status
```

**View logs**:

```bash
make dev-logs-api    # API logs
make dev-logs-db     # Database logs
make dev-logs-moodle # Moodle logs
```

### Rebuild Everything

**Complete rebuild**:

```bash
make dev-rebuild
```

## 🌐 Service URLs

After successful setup:

- **Frontend**: http://localhost:8080 (run `npm run dev`)
- **API**: http://localhost:3000
- **Moodle**: http://localhost:8081
- **Database**: postgres:5432 (internal), localhost:5432 (external)
- **pgAdmin**: http://localhost:5050 (dev@mediverse.local / dev)

## 🔄 Development Workflow

### First Time Setup

```bash
# 1. Complete setup
make dev-setup

# 2. Start frontend (in separate terminal)
npm run dev
```

### Daily Development

```bash
# 1. Start services
make dev-start

# 2. Start frontend
npm run dev
```

### When Things Go Wrong

```bash
# 1. Fix database issues
make dev-fix-db

# 2. Or rebuild everything
make dev-rebuild
```

### End of Day

```bash
# Stop all services
make dev-stop
```

## 🎯 Benefits

### Performance

- **Faster Builds**: Images cached and reused
- **Quick Startup**: Services start in parallel
- **Efficient Networking**: Isolated Docker network

### Reliability

- **Health Checks**: Services wait for dependencies
- **Automatic Recovery**: Failed services restart automatically
- **Network Isolation**: No port conflicts

### Developer Experience

- **Simple Commands**: One-command setup
- **Clear Status**: Easy to see what's running
- **Comprehensive Logs**: Easy debugging

## 🔧 Advanced Configuration

### Environment Variables

The system uses these environment variables:

- `VITE_MOODLE_OAUTH_CLIENT_ID` - Google OAuth client ID
- `VITE_MOODLE_OAUTH_CLIENT_SECRET` - Google OAuth client secret
- `VITE_MOODLE_OAUTH_REDIRECT_URI` - OAuth redirect URI

### Custom Network

The development environment uses a custom Docker network:

- **Name**: `mediverse-network`
- **Subnet**: `172.20.0.0/16`
- **Driver**: bridge

### Volume Persistence

Data persists across container restarts:

- `postgres_dev_data` - Database data
- `moodle_dev_data` - Moodle data
- `pgadmin_dev_data` - pgAdmin data

## 🆘 Support

If you encounter issues:

1. **Check Docker**: Ensure Docker Desktop is running
2. **Check Status**: Run `make dev-status`
3. **Check Logs**: Run `make dev-logs`
4. **Fix Database**: Run `make dev-fix-db`
5. **Rebuild**: Run `make dev-rebuild`

For persistent issues, check the logs and ensure all prerequisites are met.
