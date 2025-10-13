# GCP Setup - Quick Reference

## ✅ One-Command Setup (Recommended)

```bash
# Run the automated setup script
./scripts/setup-gcp.sh YOUR_PROJECT_ID

# Example:
./scripts/setup-gcp.sh mediverse-123456
```

This script:

- ✅ Enables all required APIs
- ✅ Creates service account
- ✅ Grants correct IAM roles
- ✅ Creates credentials file
- ✅ Updates your .env file
- ✅ Verifies everything

## ✅ Manual Setup

If you prefer manual setup:

```bash
# Set variables
export PROJECT_ID="your-project-id"
export SA_NAME="dialogflow-agent"

# 1. Enable APIs
gcloud services enable \
  dialogflow.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  --project=$PROJECT_ID

# 2. Create service account
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID

export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

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

# 4. Create key
mkdir -p config
gcloud iam service-accounts keys create ./config/gcp-service-account.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo "✅ GCP setup complete!"
```

## Correct Roles Explained

### Dialogflow

- `roles/dialogflow.admin` - Full Dialogflow access ✅
- `roles/dialogflow.client` - Detect intents only ✅

### Speech-to-Text

- `roles/speech.client` - Use Speech-to-Text API ✅
- ~~`roles/speech.admin`~~ - Not grantable ❌

### Text-to-Speech

- Works automatically once API is enabled ✅
- No specific role needed
- ~~`roles/texttospeech.admin`~~ - Not grantable ❌

### Service Usage

- `roles/serviceusage.serviceUsageConsumer` - Monitor API usage ✅

## Roles That DON'T Work

❌ These roles are NOT grantable at project level:

- `roles/speech.admin`
- `roles/speech.user`
- `roles/texttospeech.admin`
- `roles/texttospeech.user`

## Testing

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-service-account.json"

# Test Dialogflow
npm run test:dialogflow "show the heart"

# Test in app
npm start
```

## Troubleshooting

### "Role not grantable" error

You're trying to grant an internal API role. Use the roles above instead.

### "Permission denied"

```bash
# Check granted roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SA_EMAIL}"
```

## See Also

- [Full GCP Setup Guide](./docs/GCP_DIALOGFLOW_SETUP.md)
- [GCP Roles Reference](./docs/GCP_ROLES_REFERENCE.md)
