#!/usr/bin/env node

/**
 * OAuth Credentials Update Helper
 * Helps update .env file with real Google OAuth credentials
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateOAuthCredentials() {
  console.log("🔧 OAuth Credentials Update Helper");
  console.log("==================================\n");

  console.log(
    "This will help you update your .env file with real Google OAuth credentials."
  );
  console.log("You can get these from: https://console.cloud.google.com/\n");

  try {
    // Get current values
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Get new values from user
    const clientId = await question("Enter your Google OAuth Client ID: ");
    const clientSecret = await question(
      "Enter your Google OAuth Client Secret: "
    );

    // Optional: get redirect URI
    const redirectUri =
      (await question("Enter redirect URI (or press Enter for default): ")) ||
      "http://localhost:8081/auth/oauth2/callback.php";

    if (!clientId || !clientSecret) {
      console.log("❌ Client ID and Client Secret are required!");
      process.exit(1);
    }

    // Update the .env file
    let updatedContent = envContent;

    // Replace or add the OAuth variables
    const updates = [
      { key: "VITE_MOODLE_OAUTH_CLIENT_ID", value: clientId },
      { key: "VITE_MOODLE_OAUTH_CLIENT_SECRET", value: clientSecret },
      { key: "VITE_MOODLE_OAUTH_REDIRECT_URI", value: redirectUri },
    ];

    updates.forEach(({ key, value }) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      const newLine = `${key}="${value}"`;

      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, newLine);
      } else {
        updatedContent += `\n${newLine}`;
      }
    });

    // Write the updated content
    fs.writeFileSync(envPath, updatedContent);

    console.log("\n✅ .env file updated successfully!");
    console.log("\nUpdated values:");
    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ${clientSecret.substring(0, 10)}...`);
    console.log(`Redirect URI: ${redirectUri}`);

    console.log("\n🔧 Next steps:");
    console.log("1. Restart your development server");
    console.log("2. Test the OAuth configuration:");
    console.log("   node scripts/simple-oauth-test.js");
    console.log("3. Try logging in through the application");
  } catch (error) {
    console.error("❌ Error updating credentials:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the update
if (import.meta.url === `file://${process.argv[1]}`) {
  updateOAuthCredentials();
}
