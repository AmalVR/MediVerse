# MediVerse Architecture Documentation

## Overview

MediVerse is a voice-driven anatomy learning platform using Z-Anatomy 3D models, Moodle LMS integration, and real-time collaboration features. The platform combines interactive 3D anatomy visualization with comprehensive learning management capabilities.

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
- **PostgreSQL** - Database (shared instance for MediVerse and Moodle)
- **Prisma** - ORM
- **ZenStack** - Type-safe API generation
- **Socket.io Server** - WebSocket server
- **Moodle LMS** - Learning Management System

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

#### Moodle LMS Integration

- **Moodle API Service** (`src/lib/moodle/api.ts`)

  - REST API integration with Moodle
  - User management and authentication
  - Course creation and management
  - Content upload and organization

- **Moodle Auth Service** (`src/lib/moodle/auth.ts`)

  - OAuth 2.0 authentication flow
  - Google Sign-In integration
  - User session management
  - Token generation and refresh

- **Moodle Course Service** (`src/lib/moodle/course.ts`)

  - Anatomy-specific course creation
  - Student enrollment management
  - Course content organization
  - Progress tracking integration

- **Moodle Content Service** (`src/lib/moodle/content.ts`)

  - Video upload to Moodle courses
  - Quiz and assignment creation
  - File management and organization
  - Content metadata handling

- **Moodle Sync Service** (`src/lib/moodle/sync.ts`)
  - Bidirectional data synchronization
  - Teaching session to Moodle activity mapping
  - Content updates and deletions
  - Performance optimization with caching

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

### 4. Database Architecture

#### Shared PostgreSQL Instance

MediVerse uses a single PostgreSQL instance with two separate databases:

- **`mediverse`** - MediVerse application data
- **`moodle`** - Moodle LMS data

**Benefits:**

- Simplified infrastructure management
- Reduced resource usage
- Easier backup and maintenance
- Shared connection pooling

#### MediVerse Database Schema

```
mediverse database
├── AnatomyPart - Core anatomical structures
├── AnatomySynonym - Multi-language name mappings
├── TeachingSession - Live teaching sessions
│   ├── moodleCourseId - Reference to Moodle course
│   └── moodleActivityId - Reference to Moodle activity
├── SessionStudent - Student participants
├── SessionNote - Student notes
└── VoiceCommand - Analytics logs
```

#### Moodle Database Schema

```
moodle database
├── mdl_course - Course definitions
├── mdl_course_modules - Course activities
├── mdl_user - User accounts
├── mdl_enrol - Enrollment records
├── mdl_quiz - Quiz definitions
├── mdl_assign - Assignment definitions
├── mdl_resource - File resources
└── mdl_files - File storage metadata
```

#### Data Synchronization

- **Teaching Sessions** → Moodle Activities
- **User Authentication** → Moodle User Accounts
- **Course Content** → Moodle Resources
- **Progress Tracking** → Moodle Completion Status

### 5. UI Layer

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

**Moodle Integration Components**

- **MoodleAuth** (`src/components/MoodleAuth.tsx`)

  - OAuth 2.0 authentication flow
  - Google Sign-In integration
  - User session management
  - Authentication status display

- **CourseManagement** (`src/components/CourseManagement.tsx`)

  - Teacher course creation and management
  - Content upload integration
  - Student enrollment tracking
  - Course analytics and reporting

- **StudentCourseEnrollment** (`src/components/StudentCourseEnrollment.tsx`)

  - Course browsing and search
  - Student enrollment management
  - Progress tracking
  - Course content access

- **MoodleVideoUpload** (`src/components/MoodleVideoUpload.tsx`)

  - Video file upload to Moodle courses
  - Metadata management
  - Upload progress tracking
  - File validation and processing

- **MoodleQuizBuilder** (`src/components/MoodleQuizBuilder.tsx`)

  - Interactive quiz creation
  - Question and answer management
  - Quiz configuration options
  - Preview and validation

- **MoodleAssignmentCreator** (`src/components/MoodleAssignmentCreator.tsx`)
  - Assignment creation and configuration
  - Due date and grading setup
  - Assignment type selection
  - Preview and validation

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

### Moodle Integration Flow

```
Authentication:
1. User signs in via Google OAuth → MediVerse
2. MediVerse creates/updates Moodle user account
3. Generate Moodle API token for seamless access
4. Store both MediVerse session and Moodle token

Content Creation:
1. Teacher creates content in MediVerse UI
2. Content uploaded to Moodle course via API
3. Moodle activity created and linked
4. Teaching session synced to Moodle activity

Student Access:
1. Student enrolls in Moodle course
2. Course content displayed in MediVerse UI
3. Progress tracked in both systems
4. Assessments completed through Moodle
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
