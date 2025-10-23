#!/usr/bin/env node

/**
 * Simple OAuth Configuration Test
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
if (clientId === "demo_client_id" || clientId === "placeholder_client_id") {
  console.log("⚠️  Client ID appears to be a placeholder value");
}

if (
  clientSecret === "demo_client_secret" ||
  clientSecret === "placeholder_client_secret"
) {
  console.log("⚠️  Client Secret appears to be a placeholder value");
}

// Test 4: Check if values look like real Google OAuth credentials
console.log("\n4. Validating Google OAuth credentials...");
if (!clientId.includes(".apps.googleusercontent.com")) {
  console.log(
    "⚠️  Client ID does not look like a valid Google OAuth client ID"
  );
  console.log("   Expected format: xxxxxx.apps.googleusercontent.com");
}

if (!clientSecret.startsWith("GOCSPX-")) {
  console.log(
    "⚠️  Client Secret does not look like a valid Google OAuth client secret"
  );
  console.log("   Expected format: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx");
}

// Test 5: Test MoodleAuthService configuration
console.log("\n5. Testing MoodleAuthService configuration...");
try {
  // Import the auth service
  const { moodleAuth } = await import("../src/lib/moodle/auth.ts");

  console.log(`Auth service loaded: ${moodleAuth ? "✅ Yes" : "❌ No"}`);

  if (moodleAuth) {
    console.log(
      `Is configured: ${moodleAuth.isConfigured ? "✅ Yes" : "❌ No"}`
    );

    if (!moodleAuth.isConfigured) {
      console.log("\n❌ MoodleAuthService reports as NOT configured");
      console.log("This is likely the cause of the error.");
      process.exit(1);
    }
  }
} catch (error) {
  console.log(`❌ Error testing MoodleAuthService: ${error.message}`);
  console.log(`Stack trace: ${error.stack}`);
  process.exit(1);
}

// Test 6: Test the specific authenticateWithGoogle method
console.log("\n6. Testing authenticateWithGoogle method...");
try {
  const { moodleAuth } = await import("../src/lib/moodle/auth.ts");

  if (!moodleAuth.isConfigured) {
    console.log("❌ Cannot test authentication - service not configured");
    process.exit(1);
  }

  console.log("Testing authenticateWithGoogle method...");

  // This should not throw the error we're seeing
  const result = await moodleAuth.authenticateWithGoogle();

  if (result && result.success) {
    console.log("✅ Authentication flow completed successfully");
    console.log(`User: ${result.user?.email || "Unknown"}`);
  } else {
    console.log(
      `❌ Authentication failed: ${result?.error || "Unknown error"}`
    );
  }
} catch (error) {
  console.log(`❌ Error in authenticateWithGoogle: ${error.message}`);
  console.log(`Stack trace: ${error.stack}`);

  if (error.message.includes("OAuth configuration is missing")) {
    console.log("\n🔧 This is the exact error we're trying to fix!");
    console.log(
      "The issue is in the MoodleAuthService.authenticateWithGoogle method."
    );
  }
}

console.log("\n✅ OAuth configuration test completed");
console.log("\nIf you're still getting the error, check:");
console.log("1. Google Cloud Console OAuth configuration");
console.log("2. Redirect URI matches exactly");
console.log("3. OAuth consent screen is configured");
console.log("4. Client ID and secret are not placeholder values");
