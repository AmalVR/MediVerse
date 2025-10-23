#!/usr/bin/env node

/**
 * OAuth Health Check
 * Quick test to verify OAuth configuration is working
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log("🏥 OAuth Health Check");
console.log("===================");

try {
    // Check .env file
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) {
        console.log("❌ .env file not found");
        process.exit(1);
    }

    // Check OAuth variables
    const clientId = process.env.VITE_MOODLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        console.log("❌ Missing OAuth environment variables");
        process.exit(1);
    }

    // Check for placeholder values
    const placeholderValues = [
        "your_google_client_id",
        "demo_client_id",
        "placeholder_client_id",
        "your_google_client_secret",
        "demo_client_secret",
        "placeholder_client_secret"
    ];

    if (placeholderValues.includes(clientId) || placeholderValues.includes(clientSecret)) {
        console.log("❌ Placeholder values detected");
        process.exit(1);
    }

    // Check Google OAuth format
    if (!clientId.includes(".apps.googleusercontent.com")) {
        console.log("⚠️  Client ID format may be incorrect");
    }

    if (!clientSecret.startsWith("GOCSPX-")) {
        console.log("⚠️  Client Secret format may be incorrect");
    }

    console.log("✅ OAuth configuration is healthy");
    console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...`);
    console.log(`   Redirect URI: ${redirectUri}`);

} catch (error) {
    console.log(`❌ OAuth health check failed: ${error.message}`);
    process.exit(1);
}
