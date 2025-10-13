# MediVerse Setup Guide

## Prerequisites

1. **Node.js 18+** and **npm**
2. **PostgreSQL** database
3. **Google Cloud Platform** account
4. **Z-Anatomy** models (download from https://www.z-anatomy.com/)

## GCP Setup

### 1. Create GCP Project

```bash
gcloud projects create mediverse-PROJECT_ID
gcloud config set project mediverse-PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable speech.googleapis.com
gcloud services enable dialogflow.googleapis.com
gcloud services enable texttospeech.googleapis.com
```

### 3. Create Service Account

```bash
gcloud iam service-accounts create mediverse-service \
  --display-name="MediVerse Service Account"

gcloud iam service-accounts keys create ./config/gcp-service-account.json \
  --iam-account=mediverse-service@mediverse-PROJECT_ID.iam.gserviceaccount.com

# Grant permissions
gcloud projects add-iam-policy-binding mediverse-PROJECT_ID \
  --member="serviceAccount:mediverse-service@mediverse-PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dialogflow.client"

gcloud projects add-iam-policy-binding mediverse-PROJECT_ID \
  --member="serviceAccount:mediverse-service@mediverse-PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dialogflow.reader"

# Note: Speech-to-Text and Text-to-Speech work automatically once APIs are enabled
# No additional project-level roles needed

```

### 4. Setup Dialogflow Agent

1. Go to https://dialogflow.cloud.google.com/
2. Create new agent: "MediVerse"
3. Import intents from `config/dialogflow-intents.json`
4. Train the agent

## Environment Setup

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mediverse"

# GCP
GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
VITE_GCP_PROJECT_ID="mediverse-PROJECT_ID"
GCP_DIALOGFLOW_AGENT_ID="your-agent-id"

# API
VITE_API_URL="http://localhost:3000/api"
VITE_WS_URL="http://localhost:3001"

# Models
VITE_MODELS_BASE_URL="/models"
VITE_ENABLE_GCP_SPEECH="true"
```

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma + ZenStack
npm run zenstack
npm run prisma:generate

# 3. Push database schema
npm run prisma:push

# 4. Seed anatomy data
npm run db:seed
```

## Z-Anatomy Models Setup

### Download Models

1. Visit https://www.z-anatomy.com/
2. Download anatomy models (GLTF/GLB format)
3. Organize into systems:

```
public/models/
├── skeleton/
├── cardiovascular/
├── respiratory/
├── nervous/
├── muscular/
└── digestive/
```

### Convert to Web-Optimized Format

If models are not in GLB format, use gltf-pipeline:

```bash
npm install -g gltf-pipeline

# Convert and compress
gltf-pipeline -i input.gltf -o output.glb -d
```

### Create LOD Levels

Use Blender or other 3D tools to create low/medium/high detail versions:

```
skeleton-full.glb  (high - original)
skeleton-med.glb   (medium - 50% poly reduction)
skeleton-low.glb   (low - 80% poly reduction)
```

## Running the Application

### Development

```bash
# Start frontend
npm run dev

# In separate terminal: Start API server (to be implemented)
npm run server

# In separate terminal: Start WebSocket server (to be implemented)
npm run ws-server
```

### Production Build

```bash
npm run build
npm run preview
```

## Dialogflow Intent Import

1. Open Dialogflow Console
2. Go to your agent settings
3. Click "Export and Import"
4. Import from `config/dialogflow-intents.json`

Or use Dialogflow API:

```bash
# Install Dialogflow CLI
npm install -g dialogflow-cli

# Import intents
dialogflow-cli import-intents \
  --project=mediverse-PROJECT_ID \
  --agent=your-agent-id \
  --intents=./config/dialogflow-intents.json
```

## Database Schema

The schema includes:

- **AnatomyPart** - Anatomical structures with hierarchies
- **AnatomySynonym** - Multi-language name mappings
- **TeachingSession** - Live classroom sessions
- **SessionStudent** - Student participants
- **SessionNote** - Student notes
- **VoiceCommand** - Command analytics

View schema: `schema.zmodel`

## Testing Voice Commands

Example commands to test:

- "Show the skeleton"
- "Highlight the heart"
- "Isolate the left femur"
- "Rotate left"
- "Zoom in"
- "Create cross-section"
- "Show cardiovascular system"

## Troubleshooting

### GCP Authentication Error

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
```

### Database Connection Error

Check PostgreSQL is running:

```bash
pg_isready
```

### Model Loading Error

Ensure models are in `public/models/` and paths match database entries.

### Voice Recognition Not Working

1. Check microphone permissions
2. Use HTTPS (required for getUserMedia)
3. Verify GCP Speech-to-Text API is enabled

## License & Attribution

This project uses **Z-Anatomy** models licensed under CC BY-SA 4.0.

**Required Attribution:**

- Display "Powered by Z-Anatomy" in your application
- Link to https://www.z-anatomy.com/
- Maintain CC BY-SA 4.0 license for derivative works

## Next Steps

1. ✅ Setup GCP project and credentials
2. ✅ Install dependencies
3. ✅ Configure database
4. ✅ Seed anatomy data
5. ✅ Download Z-Anatomy models
6. ✅ Import Dialogflow intents
7. 🔄 Implement backend API server
8. 🔄 Implement WebSocket server
9. 🔄 Deploy to production

## Support

For issues:

- Check ARCHITECTURE.md for technical details
- Review GCP documentation
- Visit Z-Anatomy website for model questions
