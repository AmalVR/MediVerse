# Fix OAuth Redirect URI Mismatch

## Issue

You're getting "Error 400: redirect_uri_mismatch" because the redirect URI in Google Cloud Console doesn't match what's being sent in the OAuth request.

## Current Configuration

- **MediVerse redirect URI**: `http://localhost:8080`
- **Previous Moodle redirect URI**: `http://localhost:8081/auth/oauth2/callback.php`

## Solution

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project (e.g., `mediverse-classroom-int`)
3. Click on your OAuth 2.0 Client ID
4. In the "Authorized redirect URIs" section, **remove**:
   ```
   http://localhost:8081/auth/oauth2/callback.php
   ```
5. **Add**:
   ```
   http://localhost:8080
   ```
6. Click "Save"

### 2. Verify Environment Variables

Your `.env` file should now have:

```bash
VITE_MOODLE_OAUTH_REDIRECT_URI="http://localhost:8080"
```

### 3. Test the OAuth Flow

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:8080
3. Click "Sign In / Sign Up"
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth consent screen
6. After granting permissions, you should be redirected back to MediVerse

### 4. For Production

When deploying to production, update the redirect URI to your production domain:

```
https://your-domain.com
```

## Why This Change?

The previous configuration was designed for Moodle to handle OAuth callbacks directly. However, we've implemented OAuth directly in MediVerse, so:

- **Before**: Google → Moodle → MediVerse
- **After**: Google → MediVerse (direct)

This simplifies the flow and gives MediVerse full control over the authentication process.

## Troubleshooting

If you still get redirect URI errors:

1. **Check Google Cloud Console**: Ensure the exact URI matches
2. **Check environment variables**: Verify `VITE_MOODLE_OAUTH_REDIRECT_URI`
3. **Clear browser cache**: OAuth errors can be cached
4. **Check port**: Ensure MediVerse is running on port 8080

## Next Steps

After fixing the redirect URI:

1. Test the complete OAuth flow
2. Verify user creation in Moodle
3. Test logout functionality
4. Verify real user data is displayed (not demo data)
