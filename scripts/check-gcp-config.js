#!/usr/bin/env node

// Script to help verify Google Cloud Console OAuth configuration
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🔍 Google Cloud Console OAuth Configuration Checker");
console.log("==================================================\n");

const clientId = process.env.VITE_MOODLE_OAUTH_CLIENT_ID;
const redirectUri = process.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

console.log("📋 Your Current Configuration:");
console.log(`   Client ID: ${clientId}`);
console.log(`   Redirect URI: ${redirectUri}`);
console.log(`   Project: mediverse-classroom-int`);

console.log("\n🔧 What You Need to Do in Google Cloud Console:");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
console.log("2. Select project: mediverse-classroom-int");
console.log("3. Find OAuth client: " + clientId);
console.log("4. Edit the client");
console.log("5. Set Authorized JavaScript origins to: http://localhost:8080");
console.log("6. Set Authorized redirect URIs to: http://localhost:8080");
console.log("7. Save changes");

console.log("\n⚠️  Common Mistakes to Avoid:");
console.log("   ❌ Don't add trailing slashes: http://localhost:8080/");
console.log("   ❌ Don't use wrong port: http://localhost:8081");
console.log("   ❌ Don't use HTTPS: https://localhost:8080");
console.log("   ❌ Don't forget to save changes");

console.log("\n✅ Correct Configuration Should Look Like:");
console.log("   Authorized JavaScript origins:");
console.log("   - http://localhost:8080");
console.log("");
console.log("   Authorized redirect URIs:");
console.log("   - http://localhost:8080");

console.log("\n🧪 After Updating Google Cloud Console:");
console.log("1. Wait 5-10 minutes for changes to propagate");
console.log("2. Clear browser cache (Ctrl+Shift+R)");
console.log("3. Try OAuth login again");
console.log("4. If still failing, try incognito mode");

console.log("\n📞 If Still Not Working:");
console.log("1. Take a screenshot of your Google Cloud Console OAuth client");
console.log("2. Check the exact error message from Google");
console.log(
  "3. Verify you're in the correct project (mediverse-classroom-int)"
);
console.log("4. Make sure the Client ID matches exactly");

console.log("\n🎯 Expected Success Flow:");
console.log("1. Click 'Sign In with Google' → Google OAuth page opens");
console.log("2. Authorize app → Google redirects to http://localhost:8080");
console.log("3. MediVerse processes code → User logged in");
console.log("4. Redirected to home page → Success!");

console.log("\n✅ Configuration checker completed");
