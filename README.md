# MediVerse

> Voice-driven anatomy learning platform with real-time teacher-student collaboration

## Features

- 🎯 **3D Anatomy Viewer** - Unity WebGL-based Z-Anatomy models
- 🎤 **Voice Commands** - AI-powered natural language anatomy commands
- 👥 **Real-time Collaboration** - Teacher controls sync to students via WebSocket
- 🎮 **Command System** - Type-safe Unity command execution following SOLID principles
- 📝 **AI Interactive Mode** - ChatGPT-style interface for learning and exploration
- 🔐 **Type-safe Backend** - Prisma with PostgreSQL
- 🌐 **Multi-platform** - Responsive design, auto-detects desktop/mobile (PC/Mobile Unity builds)
- 📱 **PWA Support** - Install as app, works offline with cached models

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Unity Hub (for building 3D viewer)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd MediVerse

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Configure DATABASE_URL and GCP credentials

# Setup database
npm run zenstack
npm run prisma:push
npm run db:seed

# Build Unity viewer (one-time setup)
# See docs/SETUP_UNITY.md

# Start development servers
npm run dev          # Frontend (Vite)
npm run server       # Backend API + WebSocket
```

## Project Structure

```
MediVerse/
├── docs/                    # Documentation
├── public/                  # Static assets
│   ├── models/             # Z-Anatomy 3D models
│   └── unity/              # Unity WebGL builds
├── schema.zmodel           # Database schema (ZenStack)
├── server/                 # Backend
│   ├── api/               # REST API (Express)
│   └── websocket/         # Real-time sync (Socket.io)
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # UI components
│   ├── lib/               # Utilities
│   ├── pages/             # Route pages
│   └── types/             # TypeScript types
└── scripts/                # Build & setup scripts
```

## Documentation

### Getting Started

- **[Quick Start](docs/QUICK_START.md)** - Get running in 5 minutes
- **[Database Setup](docs/SETUP_DATABASE.md)** - Schema & migrations
- **[Unity Setup](docs/SETUP_UNITY.md)** - Build 3D viewer

### Core Features ⭐

- **[Unity Commands](docs/UNITY_COMMANDS.md)** - Complete command system guide
- **[Unity Implementation](docs/UNITY_IMPLEMENTATION_SUMMARY.md)** - Architecture & SOLID principles
- **[API Standards](docs/API_STANDARDS.md)** - Consistent response formats
- **[PWA Setup](docs/PWA_SETUP.md)** - Progressive Web App features

### Development

- **[Architecture](docs/ARCHITECTURE.md)** - System design & patterns
- **[Testing Guide](docs/TESTING.md)** - E2E tests with Playwright
- **[GCP Setup](docs/SETUP_GCP.md)** - Voice & NLP configuration
- **[Roadmap](docs/ROADMAP.md)** - Future features

## Tech Stack

**Frontend:**

- React 18 + TypeScript
- Unity WebGL (Z-Anatomy viewer) via react-unity-webgl
- TailwindCSS + shadcn/ui
- Socket.io client (real-time sync)
- Progressive Web App (PWA)

**Backend:**

- Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- Socket.io (WebSocket server)
- RESTful API with consistent response format

**Architecture:**

- SOLID Principles
- Command Pattern for Unity integration
- Dependency Injection
- Type-safe interfaces throughout

## Scripts

```bash
# Development
npm run dev              # Start frontend dev server
npm run server           # Start backend (API + WebSocket)

# Database
npm run zenstack         # Generate Prisma schema from ZenStack
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open database GUI
npm run db:seed          # Seed anatomy data

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Quality
npm run lint             # Run ESLint
npm run test             # Run tests
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mediverse"

# Google Cloud Platform
GCP_PROJECT_ID="your-project-id"
GCP_DIALOGFLOW_AGENT_ID="your-agent-id"
GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"

# Server
PORT=3000
WS_PORT=3001
NODE_ENV=development
```

## Development Workflow

1. **Teacher creates session** → Generates unique code
2. **Students join** → Enter code, sync viewer state
3. **Teacher uses voice** → "Show the heart"
4. **NLP processes** → Dialogflow extracts intent
5. **Viewer updates** → Highlights anatomy part
6. **State syncs** → All students see changes
7. **Students take notes** → Collaborative notepad

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
