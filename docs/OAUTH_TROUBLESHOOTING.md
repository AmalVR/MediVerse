# OAuth Configuration Troubleshooting Guide

## Common Issues and Solutions

### 1. "OAuth configuration is missing" Error

**Symptoms:**
- Error message: "OAuth configuration is missing. Please check your environment variables."
- Authentication fails when clicking login button

**Causes:**
- Placeholder values in .env file
- Missing environment variables
- Frontend server not restarted after .env changes
- Browser cache issues

**Solutions:**

1. **Check .env file:**
   ```bash
   # Validate OAuth configuration
   make oauth-validate
   ```

2. **Restore from backup:**
   ```bash
   # Restore working OAuth configuration
   make oauth-restore
   ```

3. **Clear cache and restart:**
   ```bash
   # Safe development start with validation
   make dev-safe
   ```

4. **Browser cache:**
   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Clear browser cache
   - Try incognito/private window

### 2. Environment Variables Not Loading

**Symptoms:**
- OAuth variables show as undefined in browser
- import.meta.env.VITE_MOODLE_OAUTH_CLIENT_ID is undefined

**Solutions:**

1. **Check .env file format:**
   ```bash
   # Ensure proper format (no spaces around =)
   VITE_MOODLE_OAUTH_CLIENT_ID="your-client-id"
   VITE_MOODLE_OAUTH_CLIENT_SECRET="your-client-secret"
   ```

2. **Restart development server:**
   ```bash
   # Kill all processes and restart
   pkill -f vite
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Verify Vite configuration:**
   - Check vite.config.ts for proper environment variable handling
   - Ensure .env file is in project root

### 3. Google Cloud Console Issues

**Symptoms:**
- OAuth redirect errors
- "Invalid client" errors
- Authorization errors

**Solutions:**

1. **Verify Google Cloud Console settings:**
   - Go to https://console.cloud.google.com/
   - Select project: mediverse-classroom-int
   - Go to APIs & Services > Credentials
   - Check OAuth 2.0 Client ID settings

2. **Required settings:**
   - **Authorized JavaScript origins:** http://localhost:8080
   - **Authorized redirect URIs:** http://localhost:8081/auth/oauth2/callback.php

3. **OAuth consent screen:**
   - Ensure OAuth consent screen is configured
   - Add test users if in testing mode

### 4. Placeholder Values Detected

**Symptoms:**
- OAuth validation fails
- "Placeholder value detected" error

**Solutions:**

1. **Update with real credentials:**
   ```bash
   # Use the restore script to get real credentials
   make oauth-restore
   ```

2. **Manual update:**
   - Edit .env file
   - Replace placeholder values with real Google OAuth credentials
   - Run validation: `make oauth-validate`

### 5. Multiple Development Servers

**Symptoms:**
- Port conflicts
- Inconsistent environment variable loading
- OAuth configuration not updating

**Solutions:**

1. **Kill all processes:**
   ```bash
   pkill -f vite
   pkill -f "tsx watch"
   pkill -f concurrently
   ```

2. **Clean restart:**
   ```bash
   make dev-safe
   ```

## Prevention Measures

### 1. Use Safe Development Commands

```bash
# Instead of: npm run dev
# Use: make dev-safe
make dev-safe
```

### 2. Regular OAuth Validation

```bash
# Validate before starting work
make oauth-validate
```

### 3. Backup Working Configuration

```bash
# Backup when OAuth is working
make oauth-backup
```

### 4. Pre-commit Validation

The pre-commit hook automatically validates OAuth configuration before commits.

## Quick Fix Commands

```bash
# Quick OAuth fix sequence
make oauth-validate || make oauth-restore
make dev-safe
```

## Emergency Recovery

If OAuth is completely broken:

1. **Restore from backup:**
   ```bash
   make oauth-restore
   ```

2. **If no backup exists:**
   ```bash
   # Restore from config file
   node scripts/restore-oauth-credentials.js
   ```

3. **Validate and start:**
   ```bash
   make oauth-validate
   make dev-safe
   ```

## Support

If issues persist:
1. Check browser console for errors
2. Verify Google Cloud Console configuration
3. Test OAuth configuration: `node scripts/comprehensive-oauth-test.js`
4. Check Docker containers are running: `docker compose ps`
