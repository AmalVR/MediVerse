#!/usr/bin/env node
// Test Dialogflow integration

const { SessionsClient } = require("@google-cloud/dialogflow");

async function testDialogflow(text) {
  const projectId = process.env.VITE_GCP_PROJECT_ID;
  const sessionId = `test-session-${Date.now()}`;

  if (!projectId) {
    console.error("❌ VITE_GCP_PROJECT_ID not set");
    process.exit(1);
  }

  console.log("🧪 Testing Dialogflow...");
  console.log(`📝 Input: "${text}"`);
  console.log(`🔑 Project: ${projectId}`);

  const client = new SessionsClient();
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode: "en-US",
      },
    },
  };

  try {
    const [response] = await client.detectIntent(request);
    const result = response.queryResult;

    console.log("\n✅ Result:");
    console.log("━".repeat(50));
    console.log(`Intent: ${result.intent?.displayName || "unknown"}`);
    console.log(
      `Confidence: ${(result.intentDetectionConfidence || 0).toFixed(2)}`
    );
    console.log(`Action: ${result.action || "none"}`);

    if (result.parameters?.fields) {
      console.log("\nParameters:");
      for (const [key, value] of Object.entries(result.parameters.fields)) {
        console.log(
          `  - ${key}: ${value.stringValue || value.numberValue || "N/A"}`
        );
      }
    }

    if (result.fulfillmentText) {
      console.log(`\nResponse: ${result.fulfillmentText}`);
    }

    console.log("━".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Get input from command line
const input = process.argv[2];

if (!input) {
  console.log("Usage: node test-dialogflow.js <text>");
  console.log('Example: node test-dialogflow.js "show the heart"');
  process.exit(1);
}

testDialogflow(input);
