#!/usr/bin/env node
// Script to import Dialogflow intents from JSON file

const { SessionsClient } = require("@google-cloud/dialogflow");
const fs = require("fs");
const path = require("path");

async function importIntents() {
  // Load intents from JSON
  const intentsFile = path.join(
    __dirname,
    "..",
    "config",
    "dialogflow-intents.json"
  );
  const intentsData = JSON.parse(fs.readFileSync(intentsFile, "utf8"));

  console.log("🚀 Starting Dialogflow intents import...");
  console.log(`📂 Loading from: ${intentsFile}`);
  console.log(`📊 Found ${intentsData.intents.length} intents to import`);

  const projectId = process.env.VITE_GCP_PROJECT_ID;
  const sessionId = `import-session-${Date.now()}`;

  if (!projectId) {
    console.error("❌ VITE_GCP_PROJECT_ID not set in environment");
    process.exit(1);
  }

  const client = new SessionsClient();
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  // Import each intent
  for (const intentData of intentsData.intents) {
    console.log(`\n📝 Importing intent: ${intentData.displayName}`);

    try {
      // Test intent with sample phrase
      const testPhrase = intentData.trainingPhrases[0];
      console.log(`   Testing with: "${testPhrase}"`);

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: testPhrase,
            languageCode: "en-US",
          },
        },
      };

      const [response] = await client.detectIntent(request);
      const result = response.queryResult;

      console.log(`   ✅ Intent: ${result.intent?.displayName || "unknown"}`);
      console.log(`   📊 Confidence: ${result.intentDetectionConfidence || 0}`);

      if (result.parameters) {
        console.log(`   📋 Parameters:`, result.parameters.fields);
      }
    } catch (error) {
      console.error(
        `   ❌ Error importing ${intentData.displayName}:`,
        error.message
      );
    }
  }

  console.log("\n\n✨ Import process completed!");
  console.log("\n📝 Manual steps required:");
  console.log("1. Go to https://dialogflow.cloud.google.com/");
  console.log("2. Select your MediVerse agent");
  console.log("3. Import intents from config/dialogflow-intents.json");
  console.log("4. Train the agent");
}

// Run import
importIntents().catch(console.error);
