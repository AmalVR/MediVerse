#!/usr/bin/env node

/**
 * Simple OAuth Configuration Test (No TypeScript)
 * Focuses on the specific error: "OAuth configuration is missing"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log("🔍 OAuth Configuration Debug Test");
console.log("==================================\n");

// Test 1: Check .env file
console.log("1. Checking .env file...");
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file does not exist");
  process.exit(1);
}
console.log("✅ .env file exists");

// Test 2: Check environment variables
console.log("\n2. Checking environment variables...");
const clientId = process.env.VITE_MOODLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
const redirectUri = process.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

console.log(
  `VITE_MOODLE_OAUTH_CLIENT_ID: ${clientId ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `VITE_MOODLE_OAUTH_CLIENT_SECRET: ${clientSecret ? "✅ Set" : "❌ Missing"}`
);
console.log(`VITE_MOODLE_OAUTH_REDIRECT_URI: ${redirectUri || "❌ Missing"}`);

if (!clientId || !clientSecret || !redirectUri) {
  console.log("\n❌ Missing required OAuth environment variables");
  process.exit(1);
}

// Test 3: Check for placeholder values
console.log("\n3. Checking for placeholder values...");
const placeholderValues = [
  "your_google_client_id",
  "demo_client_id",
  "placeholder_client_id",
  "your_google_client_secret",
  "demo_client_secret",
  "placeholder_client_secret",
];

if (placeholderValues.includes(clientId)) {
  console.log("❌ Client ID is a placeholder value!");
  console.log("   This is the root cause of the OAuth error.");
}

if (placeholderValues.includes(clientSecret)) {
  console.log("❌ Client Secret is a placeholder value!");
  console.log("   This is the root cause of the OAuth error.");
}

// Test 4: Check if values look like real Google OAuth credentials
console.log("\n4. Validating Google OAuth credentials...");
if (!clientId.includes(".apps.googleusercontent.com")) {
  console.log("❌ Client ID does not look like a valid Google OAuth client ID");
  console.log("   Expected format: xxxxxx.apps.googleusercontent.com");
}

if (!clientSecret.startsWith("GOCSPX-")) {
  console.log(
    "❌ Client Secret does not look like a valid Google OAuth client secret"
  );
  console.log("   Expected format: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx");
}

// Test 5: Simulate the MoodleAuthService configuration check
console.log("\n5. Simulating MoodleAuthService configuration check...");

// This is what the MoodleAuthService.isConfigured() method does

const isConfigured = !!(
  clientId &&
  clientSecret &&
  !placeholderValues.includes(clientId) &&
  !placeholderValues.includes(clientSecret)
);

console.log(`Is configured: ${isConfigured ? "✅ Yes" : "❌ No"}`);

if (!isConfigured) {
  console.log("\n❌ MoodleAuthService would report as NOT configured");
  console.log("This is exactly why you're getting the error:");
  console.log(
    '"OAuth configuration is missing. Please check your environment variables."'
  );
}

// Test 6: Show what needs to be fixed
console.log("\n6. What needs to be fixed:");
console.log("============================");

if (
  placeholderValues.includes(clientId) ||
  placeholderValues.includes(clientSecret)
) {
  console.log(
    "❌ You need to replace the placeholder OAuth credentials with real ones."
  );
  console.log("\nSteps to fix:");
  console.log(
    "1. Go to Google Cloud Console: https://console.cloud.google.com/"
  );
  console.log("2. Create or select a project");
  console.log("3. Enable Google+ API");
  console.log("4. Go to APIs & Services > Credentials");
  console.log("5. Create OAuth 2.0 Client ID");
  console.log("6. Set Authorized JavaScript origins: http://localhost:8080");
  console.log(
    "7. Set Authorized redirect URIs: http://localhost:8081/auth/oauth2/callback.php"
  );
  console.log("8. Copy the Client ID and Client Secret to your .env file");
  console.log("\nExample .env entries:");
  console.log(
    'VITE_MOODLE_OAUTH_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"'
  );
  console.log(
    'VITE_MOODLE_OAUTH_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"'
  );
} else {
  console.log("✅ OAuth credentials look valid");
}

console.log("\n✅ OAuth configuration test completed");
