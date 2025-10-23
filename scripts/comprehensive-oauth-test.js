#!/usr/bin/env node

/**
 * Comprehensive OAuth Test
 * Tests both frontend and backend OAuth configuration
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log("🔍 Comprehensive OAuth Configuration Test");
console.log("=========================================\n");

// Test 1: Check .env file
console.log("1. Checking .env file...");
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf8");

const oauthLines = envContent
  .split("\n")
  .filter((line) => line.includes("VITE_MOODLE_OAUTH"));

console.log("OAuth variables in .env:");
oauthLines.forEach((line) => {
  console.log(`   ${line}`);
});

// Test 2: Check environment variables
console.log("\n2. Checking environment variables...");
const clientId = process.env.VITE_MOODLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
const redirectUri = process.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

console.log(`Client ID: ${clientId ? "✅ Set" : "❌ Missing"}`);
console.log(`Client Secret: ${clientSecret ? "✅ Set" : "❌ Missing"}`);
console.log(`Redirect URI: ${redirectUri || "❌ Missing"}`);

// Test 3: Validate credentials
console.log("\n3. Validating credentials...");
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
} else {
  console.log("✅ Client ID appears to be real");
}

if (placeholderValues.includes(clientSecret)) {
  console.log("❌ Client Secret is a placeholder value!");
} else {
  console.log("✅ Client Secret appears to be real");
}

// Test 4: Check Google OAuth format
console.log("\n4. Checking Google OAuth format...");
if (clientId && clientId.includes(".apps.googleusercontent.com")) {
  console.log("✅ Client ID has correct Google OAuth format");
} else {
  console.log("⚠️  Client ID doesn't match Google OAuth format");
}

if (clientSecret && clientSecret.startsWith("GOCSPX-")) {
  console.log("✅ Client Secret has correct Google OAuth format");
} else {
  console.log("⚠️  Client Secret doesn't match Google OAuth format");
}

// Test 5: Check Google Cloud Console configuration
console.log("\n5. Google Cloud Console configuration check...");
console.log("Please verify the following in Google Cloud Console:");
console.log("1. Go to https://console.cloud.google.com/");
console.log("2. Select your project: mediverse-classroom-int");
console.log("3. Go to APIs & Services > Credentials");
console.log("4. Check your OAuth 2.0 Client ID:");
console.log(
  "   - Client ID: 576948928537-jl3e070vrnse60doatif8n8anigs5ar7.apps.googleusercontent.com"
);
console.log("   - Authorized JavaScript origins: http://localhost:8080");
console.log(
  "   - Authorized redirect URIs: http://localhost:8081/auth/oauth2/callback.php"
);
console.log("5. Make sure the OAuth consent screen is configured");

// Test 6: Test frontend server
console.log("\n6. Testing frontend server...");
try {
  const response = await fetch("http://localhost:8080");
  if (response.ok) {
    console.log("✅ Frontend server is running on http://localhost:8080");
  } else {
    console.log("❌ Frontend server is not responding");
  }
} catch (error) {
  console.log("❌ Frontend server is not running or not accessible");
  console.log("   Error:", error.message);
}

// Test 7: Test OAuth URL generation
console.log("\n7. Testing OAuth URL generation...");
if (clientId && redirectUri) {
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent("openid profile email")}&` +
    `access_type=offline`;

  console.log("✅ OAuth URL generated successfully");
  console.log(`URL: ${authUrl.substring(0, 100)}...`);
} else {
  console.log("❌ Cannot generate OAuth URL - missing credentials");
}

// Test 8: Check if the issue might be browser cache
console.log("\n8. Browser cache check...");
console.log("If you're still getting OAuth errors, try:");
console.log("1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)");
console.log("2. Clear browser cache and cookies");
console.log("3. Open browser developer tools and check console for errors");
console.log("4. Try opening the app in an incognito/private window");

console.log("\n✅ Comprehensive OAuth test completed");

// Summary
console.log("\n📋 Summary:");
const allGood =
  clientId &&
  clientSecret &&
  redirectUri &&
  !placeholderValues.includes(clientId) &&
  !placeholderValues.includes(clientSecret);

if (allGood) {
  console.log("✅ OAuth configuration appears to be correct");
  console.log("   If you're still getting errors, the issue might be:");
  console.log("   - Browser cache");
  console.log("   - Google Cloud Console configuration");
  console.log("   - Frontend server not restarted");
} else {
  console.log("❌ OAuth configuration has issues");
  console.log("   Please fix the issues above before testing authentication");
}
