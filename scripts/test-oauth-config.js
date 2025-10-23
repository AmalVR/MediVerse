#!/usr/bin/env node

/**
 * OAuth Configuration Test Script
 * Tests Moodle OAuth configuration and Google authentication flow
 */

const fs = require("fs");
const path = require("path");

// Colors for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n=== ${title} ===`, "blue");
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Test 1: Check .env file exists and is readable
function testEnvFile() {
  logSection("Testing .env File");

  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    logError(".env file does not exist");
    return false;
  }

  logSuccess(".env file exists");

  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    logSuccess(".env file is readable");

    // Check for required OAuth variables
    const requiredVars = [
      "VITE_MOODLE_OAUTH_CLIENT_ID",
      "VITE_MOODLE_OAUTH_CLIENT_SECRET",
      "VITE_MOODLE_OAUTH_REDIRECT_URI",
    ];

    const missingVars = [];
    requiredVars.forEach((varName) => {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      logError(`Missing environment variables: ${missingVars.join(", ")}`);
      return false;
    }

    logSuccess("All required OAuth environment variables present");
    return true;
  } catch (error) {
    logError(`Error reading .env file: ${error.message}`);
    return false;
  }
}

// Test 2: Check environment variable values
function testEnvValues() {
  logSection("Testing Environment Variable Values");

  // Load environment variables
  require("dotenv").config();

  const oauthConfig = {
    clientId: process.env.VITE_MOODLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.VITE_MOODLE_OAUTH_REDIRECT_URI,
  };

  log(`Client ID: ${oauthConfig.clientId ? "✅ Set" : "❌ Missing"}`);
  log(`Client Secret: ${oauthConfig.clientSecret ? "✅ Set" : "❌ Missing"}`);
  log(`Redirect URI: ${oauthConfig.redirectUri || "❌ Missing"}`);

  // Check for placeholder values
  if (
    oauthConfig.clientId === "demo_client_id" ||
    oauthConfig.clientId === "placeholder_client_id"
  ) {
    logWarning("Client ID appears to be a placeholder value");
  }

  if (
    oauthConfig.clientSecret === "demo_client_secret" ||
    oauthConfig.clientSecret === "placeholder_client_secret"
  ) {
    logWarning("Client Secret appears to be a placeholder value");
  }

  // Check if values look like real Google OAuth credentials
  if (
    oauthConfig.clientId &&
    !oauthConfig.clientId.includes(".apps.googleusercontent.com")
  ) {
    logWarning("Client ID does not look like a valid Google OAuth client ID");
  }

  if (
    oauthConfig.clientSecret &&
    !oauthConfig.clientSecret.startsWith("GOCSPX-")
  ) {
    logWarning(
      "Client Secret does not look like a valid Google OAuth client secret"
    );
  }

  return (
    oauthConfig.clientId && oauthConfig.clientSecret && oauthConfig.redirectUri
  );
}

// Test 3: Test MoodleAuthService configuration
async function testMoodleAuthService() {
  logSection("Testing MoodleAuthService Configuration");

  try {
    // Import the auth service
    const { moodleAuth } = await import("../src/lib/moodle/auth.ts");

    log(`Auth service loaded: ${moodleAuth ? "✅ Yes" : "❌ No"}`);

    if (moodleAuth) {
      log(`Is configured: ${moodleAuth.isConfigured ? "✅ Yes" : "❌ No"}`);

      // Test configuration check
      if (moodleAuth.isConfigured) {
        logSuccess("MoodleAuthService reports as configured");
      } else {
        logError("MoodleAuthService reports as NOT configured");
        return false;
      }
    }

    return true;
  } catch (error) {
    logError(`Error testing MoodleAuthService: ${error.message}`);
    logError(`Stack trace: ${error.stack}`);
    return false;
  }
}

// Test 4: Test Google OAuth configuration
async function testGoogleOAuthConfig() {
  logSection("Testing Google OAuth Configuration");

  try {
    // Load environment variables
    require("dotenv").config();

    const clientId = process.env.VITE_MOODLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      logError("Missing OAuth configuration");
      return false;
    }

    // Test OAuth URL generation
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("openid profile email")}&` +
      `access_type=offline`;

    log(`Generated OAuth URL: ${authUrl.substring(0, 100)}...`);
    logSuccess("OAuth URL generation successful");

    return true;
  } catch (error) {
    logError(`Error testing Google OAuth: ${error.message}`);
    return false;
  }
}

// Test 5: Test actual authentication flow (mock)
async function testAuthenticationFlow() {
  logSection("Testing Authentication Flow (Mock)");

  try {
    // Import the auth service
    const { moodleAuth } = await import("../src/lib/moodle/auth.ts");

    if (!moodleAuth.isConfigured) {
      logError("Cannot test authentication flow - service not configured");
      return false;
    }

    // Test the authenticateWithGoogle method
    log("Testing authenticateWithGoogle method...");

    const result = await moodleAuth.authenticateWithGoogle();

    if (result.success) {
      logSuccess("Authentication flow completed successfully");
      log(`User: ${result.user?.email || "Unknown"}`);
      return true;
    } else {
      logError(`Authentication failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    logError(`Error in authentication flow: ${error.message}`);
    logError(`Stack trace: ${error.stack}`);
    return false;
  }
}

// Test 6: Check Google Cloud Console configuration
function testGoogleCloudConfig() {
  logSection("Google Cloud Console Configuration Check");

  log("Please verify the following in Google Cloud Console:");
  log("1. Go to https://console.cloud.google.com/");
  log("2. Select your project");
  log("3. Go to APIs & Services > Credentials");
  log("4. Check your OAuth 2.0 Client ID:");
  log("   - Authorized JavaScript origins: http://localhost:8080");
  log(
    "   - Authorized redirect URIs: http://localhost:8081/auth/oauth2/callback.php"
  );
  log("5. Make sure the OAuth consent screen is configured");
  log("6. Verify the client ID and secret match your .env file");

  return true;
}

// Main test function
async function runTests() {
  log("🔍 OAuth Configuration Test Suite", "blue");
  log("=====================================", "blue");

  const tests = [
    { name: "Environment File", fn: testEnvFile },
    { name: "Environment Values", fn: testEnvValues },
    { name: "MoodleAuthService", fn: testMoodleAuthService },
    { name: "Google OAuth Config", fn: testGoogleOAuthConfig },
    { name: "Authentication Flow", fn: testAuthenticationFlow },
    { name: "Google Cloud Console", fn: testGoogleCloudConfig },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      logError(`Test ${test.name} failed with error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  logSection("Test Results Summary");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    log(`${status} ${result.name}`);
  });

  log(
    `\nOverall: ${passed}/${total} tests passed`,
    passed === total ? "green" : "red"
  );

  if (passed < total) {
    log("\n🔧 Troubleshooting Steps:", "yellow");
    log("1. Check your .env file has correct OAuth credentials");
    log("2. Verify Google Cloud Console configuration");
    log("3. Ensure redirect URI matches exactly");
    log("4. Check that OAuth consent screen is configured");
    log("5. Verify client ID and secret are not placeholder values");
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
