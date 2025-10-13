#!/usr/bin/env bash
# ----------------------------------------------------------------------
# Dialogflow CX Voice Agent Setup Script
# Creates a service account, grants minimal IAM roles, 
# and generates a key file for API authentication.
# ----------------------------------------------------------------------

set -e  # Exit on error

# === CONFIGURATION ===
PROJECT_ID="${1:-your-gcp-project-id}"
SA_NAME="dialogflow-agent"
KEY_PATH="./config/gcp-service-account.json"

# === PREP ===
echo "🚀 Setting up Dialogflow Voice Agent for MediVerse"
echo "📋 Project ID: $PROJECT_ID"
echo ""

if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
  echo "⚠️  Usage: ./scripts/setup-gcp.sh YOUR_PROJECT_ID"
  echo ""
  echo "Example:"
  echo "  ./scripts/setup-gcp.sh mediverse-123456"
  echo ""
  exit 1
fi

mkdir -p ./config

# === ENABLE REQUIRED APIS ===
echo "📦 Enabling required Google Cloud APIs..."
gcloud services enable dialogflow.googleapis.com \
                       speech.googleapis.com \
                       texttospeech.googleapis.com \
                       serviceusage.googleapis.com \
                       --project="$PROJECT_ID"

echo "✅ APIs enabled"
echo ""

# === CREATE SERVICE ACCOUNT ===
echo "👤 Creating service account: $SA_NAME"
if ! gcloud iam service-accounts list --project "$PROJECT_ID" \
    --filter="email:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --format="value(email)" | grep -q "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"; then
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name "Dialogflow CX Voice Agent" \
    --description "Service account for MediVerse voice-driven anatomy platform" \
    --project "$PROJECT_ID"
  echo "✅ Service account created"
else
  echo "ℹ️  Service account already exists, skipping creation."
fi

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""

# === ASSIGN ROLES ===
echo "🔐 Assigning IAM roles to $SA_EMAIL ..."
roles=(
  "roles/dialogflow.admin"
  "roles/dialogflow.client"
  "roles/speech.client"
  "roles/serviceusage.serviceUsageConsumer"
)

for role in "${roles[@]}"; do
  echo " → Granting $role"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$role" \
    --condition=None \
    --project="$PROJECT_ID" >/dev/null 2>&1 || true
done

echo "✅ IAM roles assigned"
echo ""

# === GENERATE SERVICE ACCOUNT KEY ===
echo "🔑 Creating service account key at: $KEY_PATH"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
  echo "⚠️  Key file already exists at $KEY_PATH"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping key creation."
  else
    gcloud iam service-accounts keys create "$KEY_PATH" \
      --iam-account="$SA_EMAIL" \
      --project "$PROJECT_ID"
    echo "✅ Key file created (old one replaced)"
  fi
else
  gcloud iam service-accounts keys create "$KEY_PATH" \
    --iam-account="$SA_EMAIL" \
    --project "$PROJECT_ID"
  echo "✅ Key file created"
fi

echo ""

# === VERIFY IAM BINDINGS ===
echo "🔍 Verifying IAM bindings..."
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SA_EMAIL}" \
  --format="table(bindings.role)"

echo ""

# === UPDATE .ENV FILE ===
if [ -f .env ]; then
  echo "📝 Updating .env file..."
  
  # Update or add PROJECT_ID
  if grep -q "VITE_GCP_PROJECT_ID=" .env; then
    sed -i.bak "s/VITE_GCP_PROJECT_ID=.*/VITE_GCP_PROJECT_ID=\"$PROJECT_ID\"/" .env
  else
    echo "VITE_GCP_PROJECT_ID=\"$PROJECT_ID\"" >> .env
  fi
  
  # Update credentials path
  if grep -q "GOOGLE_APPLICATION_CREDENTIALS=" .env; then
    sed -i.bak "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=\"$KEY_PATH\"|" .env
  else
    echo "GOOGLE_APPLICATION_CREDENTIALS=\"$KEY_PATH\"" >> .env
  fi
  
  rm -f .env.bak
  echo "✅ .env file updated"
else
  echo "⚠️  .env file not found. Run ./start.sh first to create it."
fi

echo ""

# === EXPORT ENVIRONMENT VARIABLE ===
echo "📌 To use in current shell, run:"
echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$KEY_PATH\""
echo ""

# === SUMMARY ===
echo "═══════════════════════════════════════════════════════════"
echo "✅ GCP Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "  Project ID:    $PROJECT_ID"
echo "  Service Email: $SA_EMAIL"
echo "  Key File:      $KEY_PATH"
echo ""
echo "📝 Next steps:"
echo "  1. Create Dialogflow agent at https://dialogflow.cloud.google.com/"
echo "  2. Import intents from config/dialogflow-intents.json"
echo "  3. Test: npm run test:dialogflow \"show the heart\""
echo "  4. Start app: npm start"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: docs/GCP_DIALOGFLOW_SETUP.md"
echo "  - Quick ref: GCP_SETUP_QUICK.md"
echo ""

