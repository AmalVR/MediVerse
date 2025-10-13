# GCP Roles Reference for MediVerse

## Correct Roles to Use

### Dialogflow

**Project-level roles (grantable):**

- `roles/dialogflow.client` - Detect intents, manage contexts
- `roles/dialogflow.reader` - Read agent configurations
- `roles/dialogflow.admin` - Full admin access (use with caution)

**Correct command:**

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/dialogflow.client"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/dialogflow.reader"
```

### Speech-to-Text

**No project-level role needed!**

- Just enable the API: `speech.googleapis.com`
- Service accounts automatically get access once API is enabled

**If you need specific access:**

```bash
# Not needed for most cases, but if required:
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/editor"
```

### Text-to-Speech

**No project-level role needed!**

- Just enable the API: `texttospeech.googleapis.com`
- Service accounts automatically get access once API is enabled

## ❌ Roles That DON'T Work

These roles are **internal to APIs** and **not grantable** at project level:

- ~~`roles/speech.admin`~~ ❌
- ~~`roles/speech.user`~~ ❌
- ~~`roles/texttospeech.admin`~~ ❌
- ~~`roles/texttospeech.user`~~ ❌

**Error you'll see:**

```
roles/texttospeech.admin is defined but not grantable on the project resource
```

## ✅ Minimal Setup (Recommended)

For MediVerse, you need these roles:

```bash
# Use the automated script (easiest)
./scripts/setup-gcp.sh YOUR_PROJECT_ID

# Or manually:
export PROJECT_ID="your-project-id"
export SA_EMAIL="dialogflow-agent@${PROJECT_ID}.iam.gserviceaccount.com"

# 1. Enable APIs
gcloud services enable \
  dialogflow.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  --project=$PROJECT_ID

# 2. Create service account
gcloud iam service-accounts create dialogflow-agent --project=$PROJECT_ID

# 3. Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/dialogflow.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/speech.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/serviceusage.serviceUsageConsumer"

# 4. Download key
gcloud iam service-accounts keys create ./config/gcp-service-account.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID
```

## Testing Access

### Test Dialogflow

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"

node scripts/test-dialogflow.js "show the heart"
```

### Test Speech-to-Text

```javascript
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

// If this works, you have access
const [response] = await client.recognize({
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  },
  audio: { content: audioContent },
});
```

### Test Text-to-Speech

```javascript
const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient();

// If this works, you have access
const [response] = await client.synthesizeSpeech({
  input: { text: "Hello" },
  voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
  audioConfig: { audioEncoding: "MP3" },
});
```

## Alternative: Use Editor Role (Not Recommended)

If you want a simple "all access" approach (not best practice):

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/editor"
```

This works but gives too many permissions. Only use for testing.

## Best Practice: Principle of Least Privilege

**For MediVerse, grant only:**

1. **Dialogflow Client** - To detect intents
2. **API Enabled** - Speech and TTS work automatically

**Don't grant:**

- `roles/owner` - Too much power
- `roles/editor` - Too broad
- Admin roles unless absolutely necessary

## Troubleshooting

### "Permission denied" error

```bash
# Check what roles are granted
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:YOUR_SA_EMAIL"

# Should see:
# - roles/dialogflow.client
# - roles/dialogflow.reader
```

### "API not enabled" error

```bash
# Check enabled APIs
gcloud services list --enabled

# Should include:
# - dialogflow.googleapis.com
# - speech.googleapis.com
# - texttospeech.googleapis.com
```

### "Invalid credentials" error

```bash
# Verify service account key
gcloud auth activate-service-account --key-file=./config/gcp-service-account.json

# Test
gcloud auth list
```

## Summary

**What you ACTUALLY need:**

```bash
# 1. APIs enabled ✅
gcloud services enable dialogflow.googleapis.com speech.googleapis.com texttospeech.googleapis.com

# 2. Service account created ✅
gcloud iam service-accounts create mediverse-service

# 3. Dialogflow client role ONLY ✅
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:mediverse-service@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/dialogflow.client"

# 4. Download credentials ✅
gcloud iam service-accounts keys create ./config/gcp-service-account.json \
  --iam-account=mediverse-service@PROJECT_ID.iam.gserviceaccount.com
```

**Speech-to-Text and Text-to-Speech work automatically once their APIs are enabled!** No additional roles needed. 🎉
