# Docker Setup Guide

Complete guide to run MediVerse using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- GCP service account credentials
- Z-Anatomy models downloaded

## Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd MediVerse

# 2. Copy environment file
cp .env.docker.example .env.docker

# 3. Add GCP credentials
mkdir -p config
# Place your gcp-service-account.json in config/

# 4. Update environment variables
nano .env.docker
# Set VITE_GCP_PROJECT_ID and GCP_DIALOGFLOW_AGENT_ID

# 5. Start services
docker-compose up -d

# 6. Initialize database
docker-compose exec api npm run prisma:push
docker-compose exec api npm run db:seed

# 7. Open application
open http://localhost:5173
```

## Services Overview

### Core Services

| Service     | Port | Description                |
| ----------- | ---- | -------------------------- |
| `frontend`  | 5173 | React frontend with Nginx  |
| `api`       | 3000 | Express REST API server    |
| `websocket` | 3001 | Socket.io WebSocket server |
| `postgres`  | 5432 | PostgreSQL database        |
| `redis`     | 6379 | Redis cache                |

### Optional Services

| Service   | Port | Description         |
| --------- | ---- | ------------------- |
| `pgadmin` | 5050 | PostgreSQL admin UI |

## Detailed Setup

### 1. Environment Configuration

Create `.env.docker`:

```bash
# GCP - REQUIRED
VITE_GCP_PROJECT_ID=mediverse-123456
GCP_DIALOGFLOW_AGENT_ID=projects/mediverse-123456/locations/us-central1/agents/abc123

# Database - Auto-configured
DATABASE_URL=postgresql://mediverse:mediverse_password@postgres:5432/mediverse

# API URLs
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3001

# Feature flags
VITE_ENABLE_GCP_SPEECH=true
VITE_ENABLE_VOICE_FEEDBACK=true
```

### 2. GCP Credentials Setup

```bash
# Create config directory
mkdir -p config

# Copy your service account key
cp ~/Downloads/gcp-service-account.json config/

# Verify file exists
ls -la config/gcp-service-account.json
```

### 3. Z-Anatomy Models

```bash
# Create models directory
mkdir -p public/models

# Download Z-Anatomy models
# Place models in appropriate subdirectories:
public/models/
├── skeleton/
│   ├── skeleton-full.glb
│   ├── skull.glb
│   └── femur-left.glb
├── cardiovascular/
│   └── heart.glb
└── respiratory/
    └── lungs.glb
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Initialize Database

```bash
# Run migrations
docker-compose exec api npm run prisma:push

# Seed anatomy data
docker-compose exec api npm run db:seed

# Verify data
docker-compose exec api npm run prisma:studio
# Open http://localhost:5555
```

## Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart api

# View logs
docker-compose logs -f api
docker-compose logs -f websocket

# Execute commands in container
docker-compose exec api sh
docker-compose exec postgres psql -U mediverse
```

### Database Operations

```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec api npm run prisma:push
docker-compose exec api npm run db:seed

# Backup database
docker-compose exec postgres pg_dump -U mediverse mediverse > backup.sql

# Restore database
docker-compose exec -T postgres psql -U mediverse mediverse < backup.sql

# Open pgAdmin (optional tool)
docker-compose --profile tools up -d pgadmin
open http://localhost:5050
# Login: admin@mediverse.local / admin
```

### Development

```bash
# Run in development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# View real-time logs
docker-compose logs -f --tail=100

# Inspect containers
docker-compose exec api sh
docker-compose exec frontend sh
```

## Docker Compose Files

### Production: `docker-compose.yml`

Full stack with optimized builds:

- Frontend served via Nginx
- API and WebSocket in production mode
- Database with persistence
- Redis for caching

### Development: `docker-compose.dev.yml`

Create this for development:

```yaml
version: "3.8"

services:
  postgres:
    extends:
      file: docker-compose.yml
      service: postgres

  redis:
    extends:
      file: docker-compose.yml
      service: redis

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ./server:/app/server
    environment:
      - NODE_ENV=development
    command: npm run server:api

  websocket:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ./server:/app/server
    command: npm run server:ws

  # Frontend runs locally for hot reload
  # Run: npm run dev
```

## Volume Management

### Persistent Volumes

```bash
# List volumes
docker volume ls | grep mediverse

# Inspect volume
docker volume inspect mediverse_postgres_data

# Backup volume
docker run --rm -v mediverse_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v mediverse_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

### Clean Up

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove unused images
docker image prune -a

# Full cleanup
docker system prune -a --volumes
```

## Networking

### Access Services

```bash
# From host
curl http://localhost:3000/health
curl http://localhost:3000/api/anatomy/parts

# Between containers
# Services use service names as hostnames
# api → postgres:5432
# frontend → api:3000
```

### Custom Network

Services communicate via `mediverse-network`:

```bash
# Inspect network
docker network inspect mediverse_mediverse-network

# Connect external container
docker run --network mediverse_mediverse-network alpine ping postgres
```

## Health Checks

Services include health checks:

```bash
# Check health status
docker-compose ps

# API health
curl http://localhost:3000/health

# Database health
docker-compose exec postgres pg_isready -U mediverse

# WebSocket health
curl http://localhost:3001/socket.io/
```

## Scaling

Scale WebSocket servers:

```bash
# Scale to 3 instances
docker-compose up -d --scale websocket=3

# Use load balancer (nginx)
# Add to nginx.conf:
upstream websocket {
  server websocket:3001;
  # Add more as scaled
}
```

## Production Deployment

### 1. Build Images

```bash
# Build all images
docker-compose build

# Tag for registry
docker tag mediverse-frontend:latest gcr.io/PROJECT_ID/mediverse-frontend
docker tag mediverse-api:latest gcr.io/PROJECT_ID/mediverse-api
```

### 2. Push to Registry

```bash
# Google Container Registry
gcloud auth configure-docker
docker push gcr.io/PROJECT_ID/mediverse-frontend
docker push gcr.io/PROJECT_ID/mediverse-api

# Or Docker Hub
docker login
docker push yourusername/mediverse-frontend
docker push yourusername/mediverse-api
```

### 3. Deploy

**Google Cloud Run:**

```bash
# Deploy API
gcloud run deploy mediverse-api \
  --image gcr.io/PROJECT_ID/mediverse-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy Frontend
gcloud run deploy mediverse-frontend \
  --image gcr.io/PROJECT_ID/mediverse-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Docker Swarm:**

```bash
docker swarm init
docker stack deploy -c docker-compose.yml mediverse
```

**Kubernetes:**

```bash
# Generate k8s manifests from docker-compose
kompose convert -f docker-compose.yml

# Deploy to k8s
kubectl apply -f .
```

## Monitoring

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Save logs to file
docker-compose logs > logs.txt
```

### Metrics

Add Prometheus and Grafana:

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs api

# Check if port is in use
lsof -i :3000

# Restart service
docker-compose restart api
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec api sh
npm run prisma:studio
```

### Out of Memory

```bash
# Check resource usage
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix volume permissions
docker-compose exec api chown -R node:node /app
```

## Security

### Best Practices

1. **Use Secrets:**

   ```yaml
   services:
     api:
       secrets:
         - gcp_credentials

   secrets:
     gcp_credentials:
       file: ./config/gcp-service-account.json
   ```

2. **Network Isolation:**

   ```yaml
   networks:
     frontend:
     backend:
       internal: true
   ```

3. **Read-only Root:**

   ```yaml
   services:
     frontend:
       read_only: true
   ```

4. **Drop Capabilities:**
   ```yaml
   services:
     api:
       cap_drop:
         - ALL
       cap_add:
         - NET_BIND_SERVICE
   ```

## Resources

- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)

## Next Steps

1. ✅ Complete Docker setup
2. 🔄 Test all services
3. 📊 Configure monitoring
4. 🚀 Deploy to production
