#!/usr/bin/env node

/**
 * Test Environment Variables in Browser Context
 * Verifies that VITE_ prefixed variables are accessible in the browser
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log("🔍 Testing Environment Variables for Browser");
console.log("==========================================\n");

// Test 1: Check .env file content
console.log("1. Checking .env file content:");
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf8");

const oauthLines = envContent
  .split("\n")
  .filter((line) => line.includes("VITE_MOODLE_OAUTH"));

oauthLines.forEach((line) => {
  console.log(`   ${line}`);
});

// Test 2: Check if VITE_ variables are loaded
console.log("\n2. Checking VITE_ variables in Node.js context:");
const viteVars = {
  clientId: process.env.VITE_MOODLE_OAUTH_CLIENT_ID,
  clientSecret: process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET,
  redirectUri: process.env.VITE_MOODLE_OAUTH_REDIRECT_URI,
};

console.log(
  `VITE_MOODLE_OAUTH_CLIENT_ID: ${viteVars.clientId ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `VITE_MOODLE_OAUTH_CLIENT_SECRET: ${
    viteVars.clientSecret ? "✅ Set" : "❌ Missing"
  }`
);
console.log(
  `VITE_MOODLE_OAUTH_REDIRECT_URI: ${viteVars.redirectUri || "❌ Missing"}`
);

// Test 3: Check if values are real (not placeholders)
console.log("\n3. Validating credential values:");
const placeholderValues = [
  "your_google_client_id",
  "demo_client_id",
  "placeholder_client_id",
  "your_google_client_secret",
  "demo_client_secret",
  "placeholder_client_secret",
];

if (placeholderValues.includes(viteVars.clientId)) {
  console.log("❌ Client ID is still a placeholder value!");
} else {
  console.log("✅ Client ID appears to be real");
}

if (placeholderValues.includes(viteVars.clientSecret)) {
  console.log("❌ Client Secret is still a placeholder value!");
} else {
  console.log("✅ Client Secret appears to be real");
}

// Test 4: Check Google OAuth format
console.log("\n4. Checking Google OAuth format:");
if (
  viteVars.clientId &&
  viteVars.clientId.includes(".apps.googleusercontent.com")
) {
  console.log("✅ Client ID has correct Google OAuth format");
} else {
  console.log("⚠️  Client ID doesn't match Google OAuth format");
}

if (viteVars.clientSecret && viteVars.clientSecret.startsWith("GOCSPX-")) {
  console.log("✅ Client Secret has correct Google OAuth format");
} else {
  console.log("⚠️  Client Secret doesn't match Google OAuth format");
}

// Test 5: Simulate browser environment
console.log("\n5. Browser environment simulation:");
console.log("In the browser, Vite will expose these variables as:");
console.log(
  `import.meta.env.VITE_MOODLE_OAUTH_CLIENT_ID = "${viteVars.clientId}"`
);
console.log(
  `import.meta.env.VITE_MOODLE_OAUTH_CLIENT_SECRET = "${viteVars.clientSecret?.substring(
    0,
    10
  )}..."`
);
console.log(
  `import.meta.env.VITE_MOODLE_OAUTH_REDIRECT_URI = "${viteVars.redirectUri}"`
);

// Test 6: Check if the issue might be in the env.ts file
console.log("\n6. Checking env.ts configuration:");
const envTsPath = path.join(process.cwd(), "src", "lib", "env.ts");
const envTsContent = fs.readFileSync(envTsPath, "utf8");

if (envTsContent.includes("VITE_MOODLE_OAUTH_CLIENT_ID")) {
  console.log("✅ env.ts correctly references VITE_MOODLE_OAUTH_CLIENT_ID");
} else {
  console.log("❌ env.ts missing VITE_MOODLE_OAUTH_CLIENT_ID reference");
}

if (envTsContent.includes("VITE_MOODLE_OAUTH_CLIENT_SECRET")) {
  console.log("✅ env.ts correctly references VITE_MOODLE_OAUTH_CLIENT_SECRET");
} else {
  console.log("❌ env.ts missing VITE_MOODLE_OAUTH_CLIENT_SECRET reference");
}

console.log("\n✅ Environment variable test completed");
console.log("\nIf you're still getting OAuth errors:");
console.log("1. Check browser console for any import.meta.env errors");
console.log("2. Verify the frontend server restarted after .env changes");
console.log("3. Check if there are any cached modules in node_modules/.vite");
console.log("4. Try hard refresh (Ctrl+Shift+R) in the browser");
