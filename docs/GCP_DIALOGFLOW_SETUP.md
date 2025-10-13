# Google Cloud Platform Dialogflow Setup Guide

Complete guide to configure Dialogflow for MediVerse anatomy voice commands.

## Prerequisites

- Google Cloud Platform account
- GCP Project created
- Billing enabled on project
- `gcloud` CLI installed

## Step 1: Create GCP Project

```bash
# Set variables
export PROJECT_ID="mediverse-$(date +%s)"
export PROJECT_NAME="MediVerse"
export REGION="us-central1"

# Create project
gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"

# Set as active project
gcloud config set project $PROJECT_ID

# Enable billing (replace BILLING_ACCOUNT_ID)
gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

## Step 2: Enable Required APIs

```bash
# Enable APIs
gcloud services enable \
  dialogflow.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  cloudresourcemanager.googleapis.com
```

## Step 3: Create Service Account

### Option A: Automated (Recommended)

```bash
# Run the setup script
./scripts/setup-gcp.sh YOUR_PROJECT_ID

# Example:
./scripts/setup-gcp.sh mediverse-123456
```

This handles everything: creates service account, grants roles, generates key, updates .env

### Option B: Manual

```bash
# Create service account
gcloud iam service-accounts create dialogflow-agent \
  --display-name="Dialogflow CX Voice Agent" \
  --description="Service account for MediVerse anatomy platform" \
  --project=$PROJECT_ID

# Get service account email
export SA_EMAIL="dialogflow-agent@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/dialogflow.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/speech.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/serviceusage.serviceUsageConsumer"

# Create and download key
mkdir -p config
gcloud iam service-accounts keys create ./config/gcp-service-account.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo "✅ Service account key saved to ./config/gcp-service-account.json"
```

## Step 4: Create Dialogflow Agent

### Option A: Using Console (Recommended)

1. **Go to Dialogflow Console:**

   - Visit https://dialogflow.cloud.google.com/
   - Sign in with your Google account

2. **Create Agent:**

   - Click "Create Agent"
   - Agent name: `MediVerse`
   - Default language: English
   - Default time zone: Your timezone
   - Google project: Select your project (`mediverse-XXXXX`)
   - Click "Create"

3. **Note Agent ID:**
   - Go to Agent Settings (⚙️ icon)
   - Copy the Agent ID (format: `projects/PROJECT_ID/locations/REGION/agents/AGENT_ID`)
   - Save this as `GCP_DIALOGFLOW_AGENT_ID` in your `.env` file

### Option B: Using API/CLI

```bash
# Install Dialogflow CLI (if not installed)
npm install -g @google-cloud/dialogflow-cx-cli

# Create agent
curl -X POST \
  "https://dialogflow.googleapis.com/v3/projects/${PROJECT_ID}/locations/${REGION}/agents" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "MediVerse",
    "defaultLanguageCode": "en",
    "timeZone": "America/New_York",
    "description": "Voice-driven anatomy learning assistant"
  }'
```

## Step 5: Import Intents and Entities

### Using Dialogflow Console

1. **Import Intents:**

   - Go to Dialogflow Console
   - Select your "MediVerse" agent
   - Click "Intents" in left sidebar
   - Click "⋮" (three dots) → "Upload Intents"
   - Select `config/dialogflow-intents.json`
   - Click "Upload"

2. **Create Entities Manually:**

   **Entity: `anatomy-part`**

   - Click "Entities" → "Create Entity"
   - Name: `anatomy-part`
   - Add entries:
     ```
     skeleton: skeleton, skeletal system, bones
     skull: skull, cranium, head bone
     femur: femur, thigh bone, leg bone
     heart: heart, cardiac muscle, cor
     lungs: lungs, respiratory organs
     brain: brain, cerebrum
     biceps: biceps, arm muscle
     ```

   **Entity: `anatomy-system`**

   - Name: `anatomy-system`
   - Entries:
     ```
     skeletal: skeletal, skeleton, bones
     muscular: muscular, muscles
     nervous: nervous, neural
     cardiovascular: cardiovascular, circulatory, heart
     respiratory: respiratory, breathing, lungs
     digestive: digestive, gastrointestinal
     ```

   **Entity: `direction`**

   - Name: `direction`
   - Entries:
     ```
     left: left, counterclockwise
     right: right, clockwise
     up: up, upward
     down: down, downward
     ```

   **Entity: `zoom-direction`**

   - Name: `zoom-direction`
   - Entries:
     ```
     in: in, closer, forward
     out: out, back, away
     ```

   **Entity: `axis`**

   - Name: `axis`
   - Entries:
     ```
     x: x, horizontal, lateral
     y: y, vertical, superior-inferior
     z: z, sagittal, front-back
     ```

3. **Create Intents:**

   For each intent, create with these training phrases:

   **Intent: `anatomy.show`**

   - Training phrases:
     - "show the @anatomy-part:skeleton"
     - "display @anatomy-part:heart"
     - "let me see @anatomy-part:lungs"
   - Action: `show`
   - Parameters: `anatomyPart` (required)

   **Intent: `anatomy.hide`**

   - Training phrases:
     - "hide @anatomy-part:skeleton"
     - "remove @anatomy-part:heart"
   - Action: `hide`
   - Parameters: `anatomyPart` (required)

   **Intent: `anatomy.highlight`**

   - Training phrases:
     - "highlight @anatomy-part:heart"
     - "focus on @anatomy-part:brain"
   - Action: `highlight`
   - Parameters: `anatomyPart` (required)

   **Intent: `anatomy.isolate`**

   - Training phrases:
     - "isolate @anatomy-part:femur"
     - "show only @anatomy-part:skull"
   - Action: `isolate`
   - Parameters: `anatomyPart` (required)

   **Intent: `anatomy.rotate`**

   - Training phrases:
     - "rotate @direction:left"
     - "turn @direction:right"
   - Action: `rotate`
   - Parameters: `direction` (required)

   **Intent: `anatomy.zoom`**

   - Training phrases:
     - "zoom @zoom-direction:in"
     - "zoom @zoom-direction:out"
   - Action: `zoom`
   - Parameters: `zoomDirection` (required)

   **Intent: `anatomy.system`**

   - Training phrases:
     - "show @anatomy-system:skeletal system"
     - "display @anatomy-system:cardiovascular system"
   - Action: `system`
   - Parameters: `system` (required)

### Using API (Automated Import)

```bash
# Install Node.js script dependencies
npm install @google-cloud/dialogflow

# Run import script
node scripts/import-dialogflow-intents.js
```

## Step 6: Configure Environment Variables

Update `.env` file:

```bash
# GCP Configuration
GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"
VITE_GCP_PROJECT_ID="mediverse-XXXXX"
GCP_DIALOGFLOW_AGENT_ID="projects/mediverse-XXXXX/locations/us-central1/agents/XXXXX"

# Speech Configuration
VITE_ENABLE_GCP_SPEECH="true"
VITE_SPEECH_LANGUAGE="en-US"
```

## Step 7: Test Dialogflow Integration

### Test in Console

1. Go to Dialogflow Console
2. Click "Test Agent" on right sidebar
3. Type or speak: "show the heart"
4. Verify response:
   ```json
   {
     "intent": "anatomy.show",
     "parameters": {
       "anatomyPart": "heart"
     },
     "confidence": 0.95
   }
   ```

### Test via API

```bash
# Test intent detection
node scripts/test-dialogflow.js "show the skeleton"
```

Create `scripts/test-dialogflow.js`:

```javascript
const { SessionsClient } = require("@google-cloud/dialogflow");

async function detectIntent(text) {
  const client = new SessionsClient();
  const sessionPath = client.projectAgentSessionPath(
    process.env.VITE_GCP_PROJECT_ID,
    "test-session"
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode: "en-US",
      },
    },
  };

  const [response] = await client.detectIntent(request);
  console.log(JSON.stringify(response.queryResult, null, 2));
}

detectIntent(process.argv[2]);
```

## Step 8: Advanced Configuration

### Enable Speech Adaptation

Improve recognition of anatomy terms:

```bash
curl -X POST \
  "https://speech.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/phraseSets" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "anatomy-terms",
    "phrases": [
      {"value": "skeleton", "boost": 20},
      {"value": "femur", "boost": 20},
      {"value": "cranium", "boost": 20},
      {"value": "cardiovascular", "boost": 20}
    ]
  }'
```

### Configure Webhook (Optional)

For complex logic:

1. Create Cloud Function or Cloud Run service
2. In Dialogflow Console → Fulfillment
3. Enable Webhook
4. Enter URL: `https://your-api.com/dialogflow-webhook`

## Configuration Summary

**Required Environment Variables:**

```bash
# Service Account
GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"

# Project
VITE_GCP_PROJECT_ID="mediverse-XXXXX"

# Dialogflow
GCP_DIALOGFLOW_AGENT_ID="projects/PROJECT_ID/locations/REGION/agents/AGENT_ID"

# Speech
VITE_SPEECH_LANGUAGE="en-US"
```

**Required Files:**

- `config/gcp-service-account.json` - Service account credentials
- `config/dialogflow-intents.json` - Intent definitions

**IAM Roles Required:**

- `roles/dialogflow.admin` - Full Dialogflow access
- `roles/speech.client` - Speech-to-Text API access
- `roles/serviceusage.serviceUsageConsumer` - Monitor API usage
- Text-to-Speech works automatically once API is enabled

## Troubleshooting

### Error: "Permission denied"

```bash
# Verify service account has correct roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SA_EMAIL}"
```

### Error: "Agent not found"

```bash
# List agents
gcloud dialogflow agents list --location=$REGION
```

### Error: "Quota exceeded"

- Check quotas: https://console.cloud.google.com/iam-admin/quotas
- Request quota increase if needed

### Test Connection

```bash
# Test Speech-to-Text
curl -X POST \
  "https://speech.googleapis.com/v1/speech:recognize" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "encoding": "LINEAR16",
      "sampleRateHertz": 16000,
      "languageCode": "en-US"
    },
    "audio": {
      "content": "..."
    }
  }'
```

## Cost Estimation

**Dialogflow ES:**

- Text requests: $0.002 per request
- Voice requests: $0.0065 per request
- Free tier: 1000 text requests/month

**Speech-to-Text:**

- Standard model: $0.006 per 15 seconds
- Enhanced model: $0.009 per 15 seconds
- Free tier: 60 minutes/month

**Text-to-Speech:**

- Standard voices: $4 per 1M characters
- WaveNet voices: $16 per 1M characters
- Free tier: 1M characters/month (Standard)

## Security Best Practices

1. **Restrict Service Account:**

   ```bash
   # Use principle of least privilege
   # Only grant necessary roles
   ```

2. **Rotate Keys:**

   ```bash
   # Create new key
   gcloud iam service-accounts keys create new-key.json \
     --iam-account=$SA_EMAIL

   # Delete old key
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=$SA_EMAIL
   ```

3. **Use Secret Manager:**

   ```bash
   # Store credentials in Secret Manager
   gcloud secrets create dialogflow-credentials \
     --data-file=./config/gcp-service-account.json
   ```

4. **Enable Audit Logging:**
   - Go to IAM & Admin → Audit Logs
   - Enable for Dialogflow, Speech, Text-to-Speech

## Resources

- [Dialogflow Documentation](https://cloud.google.com/dialogflow/docs)
- [Speech-to-Text Guide](https://cloud.google.com/speech-to-text/docs)
- [Text-to-Speech Guide](https://cloud.google.com/text-to-speech/docs)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

## Next Steps

1. ✅ Complete Dialogflow setup
2. 🔄 Test voice commands
3. 📊 Monitor usage in GCP Console
4. 🚀 Deploy to production
