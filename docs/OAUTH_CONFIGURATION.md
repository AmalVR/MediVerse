# OAuth Configuration Guide

## Overview

This guide explains how to properly configure OAuth authentication for MediVerse and prevent common configuration issues.

## Quick Start

### 1. Validate Current Configuration

```bash
# Check if OAuth is properly configured
make oauth-validate
```

### 2. Safe Development Start

```bash
# Start development with OAuth validation
make dev-safe
```

### 3. Backup Working Configuration

```bash
# Backup when OAuth is working
make oauth-backup
```

## Configuration Files

### .env File

The `.env` file contains OAuth configuration:

```bash
# Google OAuth Configuration
VITE_MOODLE_OAUTH_CLIENT_ID="your-client-id.apps.googleusercontent.com"
VITE_MOODLE_OAUTH_CLIENT_SECRET="GOCSPX-your-client-secret"
VITE_MOODLE_OAUTH_REDIRECT_URI="http://localhost:8081/auth/oauth2/callback.php"
```

### Google Cloud Console

Required Google Cloud Console settings:

- **Project**: mediverse-classroom-int
- **OAuth 2.0 Client ID**: your-client-id.apps.googleusercontent.com
- **Authorized JavaScript origins**: http://localhost:8080
- **Authorized redirect URIs**: http://localhost:8081/auth/oauth2/callback.php

## Available Commands

### Make Commands

```bash
# OAuth validation
make oauth-validate

# OAuth backup
make oauth-backup

# OAuth restore
make oauth-restore

# Safe development start
make dev-safe
```

### NPM Scripts

```bash
# Safe development start
npm run dev:safe

# OAuth validation
npm run oauth:validate

# OAuth backup
npm run oauth:backup

# OAuth restore
npm run oauth:restore

# OAuth monitoring
npm run oauth:monitor
```

## Troubleshooting

See [OAUTH_TROUBLESHOOTING.md](./OAUTH_TROUBLESHOOTING.md) for detailed troubleshooting steps.

## Prevention

1. **Always use safe commands**: `make dev-safe` instead of `npm run dev`
2. **Regular validation**: Run `make oauth-validate` before starting work
3. **Backup working config**: Use `make oauth-backup` when OAuth is working
4. **Pre-commit validation**: Automatic validation before commits

## Emergency Recovery

If OAuth is completely broken:

```bash
# Restore from backup
make oauth-restore

# Or restore from config file
node scripts/restore-oauth-credentials.js

# Validate and start
make oauth-validate
make dev-safe
```
