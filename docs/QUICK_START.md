# 🚀 MediVerse Quick Start Guide

## One-Command Setup (After Prerequisites)

```bash
# Complete setup in one go
npm install && \
npm run zenstack && \
npm run prisma:generate && \
npm run prisma:push && \
npm run db:seed && \
cd server && npm install && cd ..
```

## Start Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (API + WebSocket)
npm run server
```

Open http://localhost:5173

## Environment Variables

Create `.env`:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/mediverse"
GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
VITE_GCP_PROJECT_ID="your-project-id"

# Optional
VITE_API_URL="http://localhost:3000/api"
VITE_WS_URL="http://localhost:3001"
```

## GCP Quick Setup

```bash
# One command - handles everything
./scripts/setup-gcp.sh YOUR_PROJECT_ID

# Then import Dialogflow intents:
# 1. Go to https://dialogflow.cloud.google.com/
# 2. Create agent "MediVerse"
# 3. Import config/dialogflow-intents.json
```

## Key Commands

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start frontend dev server     |
| `npm run server`        | Start API + WebSocket servers |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI)   |
| `npm run db:seed`       | Seed anatomy database         |
| `npm run build`         | Build for production          |

## Project Structure

```
MediVerse/
├── src/
│   ├── components/EnhancedAnatomyViewer.tsx  # 3D viewer
│   ├── components/EnhancedVoiceInput.tsx     # Voice input
│   ├── lib/gcp/                              # GCP services
│   ├── lib/anatomy/                          # Model loader
│   └── lib/api/                              # API client
├── server/
│   ├── api/index.ts                          # REST API
│   └── websocket/index.ts                    # WebSocket
├── schema.zmodel                             # Database schema
└── config/dialogflow-intents.json            # NLP intents
```

## Voice Commands Examples

- "Show the skeleton"
- "Highlight the heart"
- "Isolate left femur"
- "Rotate left"
- "Zoom in"
- "Create cross section"
- "Show cardiovascular system"

## Testing

1. **Test Voice Recognition:**

   - Click "Voice Command" button
   - Say "Show the skeleton"
   - Check console for transcript

2. **Test API:**

   ```bash
   curl http://localhost:3000/api/anatomy/parts?system=SKELETAL
   ```

3. **Test WebSocket:**
   - Open Teacher view
   - Create session
   - Open Student view in another tab
   - Join with code
   - Execute voice command in teacher view
   - Verify student view updates

## Common Issues

**Database Error:**

```bash
# Reset database
npm run prisma:push --force-reset
npm run db:seed
```

**GCP Auth Error:**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
```

**Models Not Loading:**

- Check models exist in `public/models/`
- Verify paths in database match files
- Check browser console for 404 errors

## Next Steps

1. ✅ Setup complete
2. 📥 Download Z-Anatomy models → `public/models/`
3. 🎤 Test voice commands
4. 👥 Test teacher-student sync
5. 🚀 Deploy to production

## Resources

- [Full Setup Guide](./SETUP.md)
- [Architecture Docs](./ARCHITECTURE.md)
- [Z-Anatomy](https://www.z-anatomy.com/)
- [GCP Dialogflow](https://dialogflow.cloud.google.com/)

---

**Need help?** Check the full documentation or open an issue.
