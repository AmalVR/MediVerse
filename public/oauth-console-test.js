// Quick OAuth configuration test
// Run this in browser console at http://localhost:8080

console.log("🔍 OAuth Configuration Test");
console.log("========================");

// Check environment variables
const clientId = import.meta.env.VITE_MOODLE_OAUTH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_MOODLE_OAUTH_CLIENT_SECRET;
const redirectUri = import.meta.env.VITE_MOODLE_OAUTH_REDIRECT_URI;

console.log(
  "Client ID:",
  clientId ? "✅ Set" : "❌ Missing",
  clientId ? `(${clientId.substring(0, 20)}...)` : ""
);
console.log(
  "Client Secret:",
  clientSecret ? "✅ Set" : "❌ Missing",
  clientSecret ? `(${clientSecret.substring(0, 10)}...)` : ""
);
console.log(
  "Redirect URI:",
  redirectUri ? "✅ Set" : "❌ Missing",
  redirectUri || ""
);

// Check for placeholder values
const placeholderValues = [
  "your_google_client_id",
  "demo_client_id",
  "placeholder_client_id",
];
const hasPlaceholder = placeholderValues.some(
  (placeholder) => clientId === placeholder || clientSecret === placeholder
);

console.log(
  "Placeholder Check:",
  hasPlaceholder ? "❌ Contains placeholders" : "✅ No placeholders"
);

// Validate redirect URI format
const isValidRedirectUri =
  redirectUri &&
  (redirectUri.startsWith("http://localhost:8080") ||
    redirectUri.startsWith("https://"));

console.log(
  "Redirect URI Format:",
  isValidRedirectUri ? "✅ Valid format" : "❌ Invalid format"
);

// Check Google OAuth format
const isValidGoogleClientId =
  clientId && clientId.includes(".apps.googleusercontent.com");
console.log(
  "Google Client ID Format:",
  isValidGoogleClientId ? "✅ Valid Google format" : "❌ Invalid Google format"
);

console.log("========================");
console.log(
  "If any values are missing or invalid, restart the frontend server with: npm run dev"
);
