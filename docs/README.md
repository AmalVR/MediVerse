# MediVerse Documentation

Welcome to the MediVerse documentation! This directory contains comprehensive guides for setting up, deploying, and using the platform.

## 📚 Documentation Index

### Getting Started

- **[Quick Start Guide](./QUICK_START.md)** - Get running in 5 minutes

  - One-command setup
  - Environment configuration
  - Testing checklist
  - Common issues and solutions

- **[Startup Script Guide](./STARTUP_SCRIPT.md)** - Automated setup
  - Interactive menu
  - Command-line options
  - What each mode does
  - Troubleshooting

### Setup & Configuration

- **[Setup Guide](./SETUP.md)** - Comprehensive installation guide

  - Prerequisites and dependencies
  - Database setup
  - Z-Anatomy models configuration
  - Environment variables
  - Development workflow

- **[GCP Dialogflow Setup](./GCP_DIALOGFLOW_SETUP.md)** - Complete Dialogflow configuration

  - GCP project creation
  - Service account setup
  - Dialogflow agent configuration
  - Intent and entity creation
  - Testing and troubleshooting
  - Cost estimation

- **[Docker Setup](./DOCKER_SETUP.md)** - Container deployment guide
  - Docker Compose configuration
  - Service architecture
  - Volume management
  - Production deployment
  - Monitoring and logging

### Architecture & Development

- **[Architecture Guide](./ARCHITECTURE.md)** - Technical architecture

  - System overview
  - Data layer (ZenStack + Prisma)
  - Service layer (GCP, Anatomy)
  - API layer
  - UI components
  - Data flow diagrams
  - Performance optimizations

- **[Database Guide](./DATABASE.md)** - Database architecture

  - ZenStack + Prisma setup
  - Schema definition
  - Models and relationships
  - Migrations and seeding
  - Type-safe queries

- **[Z-Anatomy Models Guide](./Z_ANATOMY_MODELS.md)** - 3D models setup

  - Where to get models
  - Directory structure
  - Converting formats
  - Creating LOD versions
  - Testing and optimization

- **[Code Architecture](./CODE_ARCHITECTURE.md)** - SOLID principles

  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion
  - Examples and best practices

- **[SOLID Refactoring](./SOLID_REFACTORING.md)** - Refactoring guide
  - Before/after comparison
  - Benefits analysis
  - Usage examples
  - Migration path

## 🚀 Quick Navigation

### I want to...

**Get started immediately**
→ Run `./start.sh` or `npm start`, then see [Quick Start Guide](./QUICK_START.md)

**Set up GCP and Dialogflow**
→ [GCP Dialogflow Setup](./GCP_DIALOGFLOW_SETUP.md)

**Deploy with Docker**
→ [Docker Setup](./DOCKER_SETUP.md)

**Understand the architecture**
→ [Architecture Guide](./ARCHITECTURE.md)

**Convert Z-Anatomy models**
→ [Z-Anatomy Models Guide](./Z_ANATOMY_MODELS.md)

## 📋 Configuration Checklist

### Required for Development

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] `.env` file configured
- [ ] GCP service account created
- [ ] Dialogflow agent set up
- [ ] Z-Anatomy models downloaded
- [ ] Database seeded
- [ ] Dependencies installed

### Required for Docker Deployment

- [ ] Docker 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] `.env.docker` configured
- [ ] GCP credentials in `config/`
- [ ] Z-Anatomy models in `public/models/`

### Required for Production

- [ ] All development requirements ✓
- [ ] SSL certificates configured
- [ ] Domain configured
- [ ] GCP quotas reviewed
- [ ] Monitoring set up
- [ ] Backup strategy implemented

## 🔑 Key Concepts

### GCP Dialogflow

Dialogflow is the NLP engine that interprets voice commands:

```
"Show the heart" → Dialogflow → {
  intent: "anatomy.show",
  parameters: { anatomyPart: "heart" }
}
```

**Configuration Required:**

- Project ID
- Agent ID
- Service account credentials
- Intents imported
- Entities configured

See: [GCP Dialogflow Setup](./GCP_DIALOGFLOW_SETUP.md)

### Z-Anatomy Models

3D anatomical models in GLTF/GLB format:

```
public/models/
├── skeleton/       # Skeletal system
├── cardiovascular/ # Heart, vessels
├── respiratory/    # Lungs, trachea
└── ...
```

**LOD Levels:**

- `high` - Full detail (close-up)
- `medium` - Reduced polygons
- `low` - Minimal detail (far away)

### Docker Architecture

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│     API     │
│  (Nginx)    │     │  (Express)  │
│   :5173     │     │    :3000    │
└─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  WebSocket  │
                    │ (Socket.io) │
                    │    :3001    │
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌──────────┐   ┌──────────┐
            │ Postgres │   │  Redis   │
            │  :5432   │   │  :6379   │
            └──────────┘   └──────────┘
```

See: [Docker Setup](./DOCKER_SETUP.md)

## 🛠️ Common Tasks

### Start Development Environment

```bash
# Option 1: Local
npm run dev
npm run server

# Option 2: Docker infrastructure
docker-compose -f docker-compose.dev.yml up -d
npm run dev
npm run server
```

### Reset Database

```bash
# Local
npm run prisma:push --force-reset
npm run db:seed

# Docker
docker-compose exec api npm run prisma:push --force-reset
docker-compose exec api npm run db:seed
```

### Test Dialogflow

```bash
# Test voice command processing
node scripts/test-dialogflow.js "show the heart"

# Import intents
node scripts/import-dialogflow-intents.js
```

### View Logs

```bash
# Docker
docker-compose logs -f api
docker-compose logs -f websocket

# Local
# Check terminal output
```

## 📊 Monitoring

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Database
docker-compose exec postgres pg_isready -U mediverse

# WebSocket
curl http://localhost:3001/socket.io/
```

### Database Management

```bash
# Prisma Studio
npm run prisma:studio
# Open http://localhost:5555

# pgAdmin (Docker)
docker-compose --profile tools up -d pgadmin
# Open http://localhost:5050
```

## 🔒 Security Notes

1. **Never commit:**

   - `.env` files
   - `config/gcp-service-account.json`
   - Database credentials

2. **In production:**

   - Use secret management (GCP Secret Manager)
   - Enable SSL/TLS
   - Rotate service account keys
   - Set up audit logging

3. **API keys:**
   - Restrict GCP API keys by IP/domain
   - Set usage quotas
   - Monitor usage dashboard

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
→ Check PostgreSQL is running, verify DATABASE_URL

**GCP authentication error**
→ Verify GOOGLE_APPLICATION_CREDENTIALS path

**Models not loading**
→ Check files exist in public/models/, verify paths in DB

**Docker out of memory**
→ Increase Docker memory limit in settings

**WebSocket not connecting**
→ Check CORS settings, verify WS_URL

See individual guides for detailed troubleshooting.

## 📚 Additional Resources

### External Documentation

- [Z-Anatomy Website](https://www.z-anatomy.com/)
- [GCP Dialogflow Docs](https://cloud.google.com/dialogflow/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Project Files

- [schema.zmodel](../schema.zmodel) - Database schema
- [docker-compose.yml](../docker-compose.yml) - Production config
- [docker-compose.dev.yml](../docker-compose.dev.yml) - Development config
- [config/dialogflow-intents.json](../config/dialogflow-intents.json) - NLP intents

## 🤝 Contributing

When adding documentation:

1. Follow existing structure
2. Use clear headings and examples
3. Include code snippets
4. Add troubleshooting sections
5. Update this README index

## 📝 Documentation Standards

- Use Markdown formatting
- Include code examples with syntax highlighting
- Provide both terminal commands and explanations
- Add emoji for visual hierarchy (sparingly)
- Keep content up-to-date with code changes

---

**Need help?** Check the appropriate guide above or open an issue on GitHub.
