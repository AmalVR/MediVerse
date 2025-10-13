# MediVerse Architecture Documentation

## Overview

MediVerse is a voice-driven anatomy learning platform using Z-Anatomy 3D models, Google Cloud Platform services, and real-time collaboration features.

## Tech Stack

### Frontend

- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Three.js helpers
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Socket.io Client** - WebSocket for real-time sync

### Backend Services

- **GCP Speech-to-Text** - Voice transcription with medical model
- **GCP Dialogflow** - Natural language understanding
- **GCP Text-to-Speech** - Voice feedback
- **PostgreSQL** - Database
- **Prisma** - ORM
- **ZenStack** - Type-safe API generation
- **Socket.io Server** - WebSocket server

### 3D Assets

- **Z-Anatomy** - Open-source anatomical models (GLTF/GLB)
- **LOD (Level of Detail)** - Multiple quality levels for performance

## Architecture Layers

### 1. Data Layer (ZenStack + Prisma)

```
schema.zmodel
├── AnatomyPart - Core anatomical structures
├── AnatomySynonym - Multi-language name mappings
├── TeachingSession - Live teaching sessions
├── SessionStudent - Student participants
├── SessionNote - Student notes
└── VoiceCommand - Analytics logs
```

**Key Features:**

- Hierarchical part relationships (parent-child)
- Multi-language synonym support
- System-based grouping (skeletal, muscular, etc.)
- 3D model metadata (paths, LOD levels, bounding boxes)

### 2. Service Layer

#### Anatomy Services

- **Model Loader** (`src/lib/anatomy/model-loader.ts`)

  - GLTF/GLB loading with caching
  - LOD support (high/medium/low detail)
  - Automatic bounding box calculation
  - Material optimization

- **Ontology Mapper** (`src/lib/anatomy/ontology-mapper.ts`)
  - Natural language → Part ID mapping
  - Fuzzy matching with Levenshtein distance
  - Hierarchical navigation
  - Multi-language support

#### GCP Services

- **Speech-to-Text** (`src/lib/gcp/speech-to-text.ts`)

  - Medical conversation model
  - Streaming recognition
  - Multi-language support

- **Dialogflow** (`src/lib/gcp/dialogflow.ts`)

  - Intent recognition
  - Entity extraction
  - Command parsing

- **Text-to-Speech** (`src/lib/gcp/text-to-speech.ts`)
  - Voice feedback generation
  - Pre-generated common phrases
  - Multi-voice support

#### Real-time Sync

- **WebSocket Client** (`src/lib/websocket/session-sync.ts`)
  - Bidirectional communication
  - Session state synchronization
  - Student join/leave events
  - Command broadcasting

### 3. API Layer

**Type-Safe API** (`src/lib/api/anatomy-api.ts`)

- Anatomy part queries
- Session management
- Voice command processing
- Analytics

**Endpoints:**

```
GET    /api/anatomy/parts?system={system}
GET    /api/anatomy/search?q={query}
GET    /api/anatomy/parts/{partId}
GET    /api/anatomy/parts/{partId}/synonyms
POST   /api/voice/process
POST   /api/voice/feedback
POST   /api/sessions
POST   /api/sessions/join
PATCH  /api/sessions/{id}/state
POST   /api/sessions/{id}/end
GET    /api/sessions/{id}/analytics
```

### 4. UI Layer

#### Components

**Enhanced Anatomy Viewer** (`src/components/EnhancedAnatomyViewer.tsx`)

- GLTF model rendering
- Part highlighting with effects
- Camera auto-positioning
- Cross-section clipping planes
- LOD-based rendering
- Isolation mode

**Enhanced Voice Input** (`src/components/EnhancedVoiceInput.tsx`)

- GCP Speech-to-Text integration
- Real-time transcription
- Command processing
- Audio feedback playback
- Visual feedback

**Teacher Dashboard** (`src/pages/Teacher.tsx`)

- Session creation
- Voice command control
- Real-time student sync
- Analytics view

**Student View** (`src/pages/Student.tsx`)

- Session joining by code
- Synchronized viewer
- Note-taking
- Passive following

## Data Flow

### Voice Command Flow

```
1. User speaks → Microphone capture
2. Audio stream → GCP Speech-to-Text
3. Transcript → Dialogflow NLP
4. Intent + Entities → Command Parser
5. Command → Ontology Mapper (resolve part ID)
6. Action → 3D Viewer Update
7. Feedback → GCP Text-to-Speech
8. Audio → User playback
```

### Session Sync Flow

```
Teacher:
1. Execute command → Update local state
2. State change → WebSocket emit
3. Server broadcasts → All students

Students:
1. Receive WebSocket message
2. Update viewer state
3. Sync 3D view
```

## Z-Anatomy Integration

### Model Organization

```
/public/models/
├── skeleton/
│   ├── skeleton-full.glb (high detail)
│   ├── skeleton-med.glb (medium detail)
│   ├── skeleton-low.glb (low detail)
│   ├── skull.glb
│   ├── femur-left.glb
│   └── ...
├── cardiovascular/
│   ├── heart.glb
│   ├── left-ventricle.glb
│   └── ...
├── respiratory/
│   ├── lungs.glb
│   └── ...
└── ...
```

### Model Requirements

1. **Format:** GLTF 2.0 or GLB
2. **Attribution:** CC BY-SA 4.0 (Z-Anatomy)
3. **Optimization:**
   - Draco compression
   - Texture atlasing
   - LOD variants
4. **Metadata:**
   - Bounding boxes
   - Named hierarchies
   - Material properties

## Performance Optimizations

1. **Model Loading**

   - Lazy loading
   - Progressive loading (LOD)
   - Model caching
   - Preloading common parts

2. **Rendering**

   - Frustum culling
   - Occlusion culling
   - Shadow optimization
   - Material instancing

3. **Network**

   - WebSocket connection pooling
   - Message batching
   - Compression

4. **Database**
   - Indexed queries
   - Cached synonyms
   - Connection pooling

## Security

1. **Authentication:** (To be implemented)

   - JWT tokens
   - Role-based access (teacher/student)

2. **API Security:**

   - Rate limiting
   - CORS configuration
   - Input validation

3. **GCP Security:**
   - Service account credentials
   - API key restrictions
   - Quota management

## Deployment

### Prerequisites

1. GCP account with enabled APIs:

   - Speech-to-Text API
   - Dialogflow API
   - Text-to-Speech API

2. PostgreSQL database

3. Z-Anatomy models (download and convert)

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Configure your GCP credentials and database

# 3. Generate Prisma client and ZenStack
npm run zenstack
npm run prisma:generate

# 4. Push database schema
npm run prisma:push

# 5. Seed anatomy data
npm run db:seed

# 6. Import Dialogflow intents
# Use config/dialogflow-intents.json

# 7. Run development
npm run dev
```

### Production Deployment

- **Frontend:** Vercel, Netlify, or GCP Cloud Run
- **API Server:** GCP Cloud Run or App Engine
- **WebSocket:** Dedicated server or GCP Compute Engine
- **Database:** GCP Cloud SQL (PostgreSQL)
- **Models:** GCP Cloud Storage + CDN

## Attribution

This project uses:

- **Z-Anatomy** (CC BY-SA 4.0) - 3D anatomical models
- **Google Cloud Platform** - AI/ML services
- Powered by Z-Anatomy (https://www.z-anatomy.com/)

## License

See LICENSE file for project-specific licensing.
