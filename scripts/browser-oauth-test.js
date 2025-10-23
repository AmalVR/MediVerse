// Test OAuth Configuration in Browser Console
// Run this in the browser console to debug OAuth issues

console.log("🔍 OAuth Configuration Debug - Browser Console");
console.log("=============================================");

// Test 1: Check Vite environment variables
console.log("1. Checking Vite environment variables...");
try {
  const clientId = import.meta.env.VITE_MOODLE_OAUTH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

  console.log("Client ID:", clientId ? "✅ Set" : "❌ Missing", clientId);
  console.log(
    "Client Secret:",
    clientSecret ? "✅ Set" : "❌ Missing",
    clientSecret?.substring(0, 10) + "..."
  );
  console.log("Redirect URI:", redirectUri || "❌ Missing");

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("❌ Missing required OAuth environment variables");
    throw new Error("Missing OAuth configuration");
  }

  // Test 2: Check for placeholder values
  console.log("2. Checking for placeholder values...");
  const placeholderValues = [
    "your_google_client_id",
    "demo_client_id",
    "placeholder_client_id",
    "your_google_client_secret",
    "demo_client_secret",
    "placeholder_client_secret",
  ];

  if (placeholderValues.includes(clientId)) {
    console.error("❌ Client ID is a placeholder value!");
  } else {
    console.log("✅ Client ID appears to be real");
  }

  if (placeholderValues.includes(clientSecret)) {
    console.error("❌ Client Secret is a placeholder value!");
  } else {
    console.log("✅ Client Secret appears to be real");
  }

  // Test 3: Check Google OAuth format
  console.log("3. Checking Google OAuth format...");
  if (clientId.includes(".apps.googleusercontent.com")) {
    console.log("✅ Client ID has correct Google OAuth format");
  } else {
    console.warn("⚠️ Client ID doesn't match Google OAuth format");
  }

  if (clientSecret.startsWith("GOCSPX-")) {
    console.log("✅ Client Secret has correct Google OAuth format");
  } else {
    console.warn("⚠️ Client Secret doesn't match Google OAuth format");
  }

  // Test 4: Test MoodleAuthService configuration
  console.log("4. Testing MoodleAuthService configuration...");

  // Simulate the isConfigured check
  const isConfigured = !!(
    clientId &&
    clientSecret &&
    !placeholderValues.includes(clientId) &&
    !placeholderValues.includes(clientSecret)
  );

  console.log("Is configured:", isConfigured ? "✅ Yes" : "❌ No");

  if (isConfigured) {
    console.log("✅ OAuth configuration is valid!");
    console.log("The authentication should work correctly.");
  } else {
    console.error("❌ OAuth configuration is invalid");
    console.error("This is why you're getting the OAuth error.");
  }
} catch (error) {
  console.error("❌ Error testing OAuth configuration:", error.message);
}

console.log("✅ OAuth configuration test completed");

// Test 5: Try to import and test the actual MoodleAuthService
console.log("5. Testing actual MoodleAuthService...");
try {
  // This will only work if the module is available
  import("/src/lib/moodle/auth.ts")
    .then(({ moodleAuth }) => {
      console.log("MoodleAuthService loaded:", moodleAuth ? "✅ Yes" : "❌ No");
      if (moodleAuth) {
        console.log(
          "Is configured:",
          moodleAuth.isConfigured ? "✅ Yes" : "❌ No"
        );
      }
    })
    .catch((error) => {
      console.error("❌ Error loading MoodleAuthService:", error.message);
    });
} catch (error) {
  console.error("❌ Error importing MoodleAuthService:", error.message);
}
