#!/bin/bash

# OAuth Configuration Safeguards
# Prevents OAuth configuration issues from recurring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🛡️  OAuth Configuration Safeguards"
echo "=================================="

# 1. Create .env validation script
print_status "Creating .env validation script..."

cat > scripts/validate-env.sh << 'EOF'
#!/bin/bash

# Environment Variables Validation Script
# Ensures OAuth configuration is correct

set -e

echo "🔍 Validating Environment Configuration"
echo "======================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "   Run: cp env.example .env"
    exit 1
fi

# Check for required OAuth variables
required_vars=(
    "VITE_MOODLE_OAUTH_CLIENT_ID"
    "VITE_MOODLE_OAUTH_CLIENT_SECRET"
    "VITE_MOODLE_OAUTH_REDIRECT_URI"
)

placeholder_values=(
    "your_google_client_id"
    "demo_client_id"
    "placeholder_client_id"
    "your_google_client_secret"
    "demo_client_secret"
    "placeholder_client_secret"
)

echo "Checking required OAuth variables..."

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo "❌ Missing: $var"
        exit 1
    fi
    
    value=$(grep "^${var}=" .env | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$value" ]; then
        echo "❌ Empty value for: $var"
        exit 1
    fi
    
    # Check for placeholder values
    for placeholder in "${placeholder_values[@]}"; do
        if [ "$value" = "$placeholder" ]; then
            echo "❌ Placeholder value detected for: $var"
            echo "   Current value: $value"
            echo "   Please update with real OAuth credentials"
            exit 1
        fi
    done
    
    echo "✅ $var is set correctly"
done

echo "✅ All OAuth environment variables are valid"
EOF

chmod +x scripts/validate-env.sh
print_success "Created scripts/validate-env.sh"

# 2. Create pre-commit hook
print_status "Creating pre-commit hook..."

mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to validate OAuth configuration
echo "🔍 Validating OAuth configuration before commit..."

# Check if .env is being committed
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "⚠️  .env file is being committed"
    echo "   This should not happen in production!"
    echo "   Consider adding .env to .gitignore"
fi

# Validate OAuth configuration
if [ -f scripts/validate-env.sh ]; then
    ./scripts/validate-env.sh
    if [ $? -ne 0 ]; then
        echo "❌ OAuth configuration validation failed"
        echo "   Please fix OAuth configuration before committing"
        exit 1
    fi
fi

echo "✅ OAuth configuration validation passed"
EOF

chmod +x .git/hooks/pre-commit
print_success "Created pre-commit hook"

# 3. Create development startup script
print_status "Creating development startup script..."

cat > scripts/dev-start.sh << 'EOF'
#!/bin/bash

# Development Startup Script with OAuth Validation
# Ensures OAuth configuration is correct before starting

set -e

echo "🚀 Starting MediVerse Development Environment"
echo "============================================="

# Validate OAuth configuration
echo "1. Validating OAuth configuration..."
if [ -f scripts/validate-env.sh ]; then
    ./scripts/validate-env.sh
    if [ $? -ne 0 ]; then
        echo "❌ OAuth configuration validation failed"
        echo "   Please fix OAuth configuration before starting"
        exit 1
    fi
else
    echo "⚠️  OAuth validation script not found"
fi

# Clear Vite cache
echo "2. Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

# Kill existing processes
echo "3. Stopping existing processes..."
pkill -f "vite" || true
pkill -f "tsx watch" || true
pkill -f "concurrently" || true

# Start development server
echo "4. Starting development server..."
npm run dev
EOF

chmod +x scripts/dev-start.sh
print_success "Created scripts/dev-start.sh"

# 4. Create OAuth configuration backup script
print_status "Creating OAuth configuration backup script..."

cat > scripts/backup-oauth-config.sh << 'EOF'
#!/bin/bash

# Backup OAuth Configuration
# Creates a backup of working OAuth configuration

set -e

echo "💾 Backing up OAuth configuration"
echo "================================="

# Create backup directory
mkdir -p .oauth-backup

# Backup .env file
if [ -f .env ]; then
    cp .env .oauth-backup/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ .env file backed up"
else
    echo "❌ .env file not found"
    exit 1
fi

# Backup config file
if [ -f config/client_secret_*.json ]; then
    cp config/client_secret_*.json .oauth-backup/
    echo "✅ OAuth config file backed up"
fi

echo "✅ OAuth configuration backup completed"
echo "   Backup location: .oauth-backup/"
EOF

chmod +x scripts/backup-oauth-config.sh
print_success "Created scripts/backup-oauth-config.sh"

# 5. Create OAuth configuration restore script
print_status "Creating OAuth configuration restore script..."

cat > scripts/restore-oauth-config.sh << 'EOF'
#!/bin/bash

# Restore OAuth Configuration
# Restores OAuth configuration from backup

set -e

echo "🔄 Restoring OAuth configuration"
echo "==============================="

# Check if backup exists
if [ ! -d .oauth-backup ]; then
    echo "❌ No backup directory found"
    echo "   Run: ./scripts/backup-oauth-config.sh first"
    exit 1
fi

# Find latest backup
latest_backup=$(ls -t .oauth-backup/.env.backup.* 2>/dev/null | head -n1)

if [ -z "$latest_backup" ]; then
    echo "❌ No .env backup found"
    exit 1
fi

echo "Found backup: $latest_backup"

# Restore .env file
cp "$latest_backup" .env
echo "✅ .env file restored from backup"

# Restore config file if exists
if [ -f .oauth-backup/client_secret_*.json ]; then
    cp .oauth-backup/client_secret_*.json config/
    echo "✅ OAuth config file restored"
fi

# Validate restored configuration
echo "Validating restored configuration..."
if [ -f scripts/validate-env.sh ]; then
    ./scripts/validate-env.sh
    if [ $? -eq 0 ]; then
        echo "✅ OAuth configuration restored and validated"
    else
        echo "❌ Restored configuration validation failed"
        exit 1
    fi
fi
EOF

chmod +x scripts/restore-oauth-config.sh
print_success "Created scripts/restore-oauth-config.sh"

# 6. Update Makefile with OAuth safeguards
print_status "Updating Makefile with OAuth safeguards..."

# Add OAuth validation commands to Makefile
cat >> Makefile << 'EOF'

# OAuth Configuration
oauth-validate:
	@echo "🔍 Validating OAuth configuration..."
	@./scripts/validate-env.sh

oauth-backup:
	@echo "💾 Backing up OAuth configuration..."
	@./scripts/backup-oauth-config.sh

oauth-restore:
	@echo "🔄 Restoring OAuth configuration..."
	@./scripts/restore-oauth-config.sh

dev-safe:
	@echo "🚀 Starting development with OAuth validation..."
	@./scripts/dev-start.sh
EOF

print_success "Updated Makefile with OAuth commands"

# 7. Create OAuth troubleshooting guide
print_status "Creating OAuth troubleshooting guide..."

cat > docs/OAUTH_TROUBLESHOOTING.md << 'EOF'
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
EOF

print_success "Created docs/OAUTH_TROUBLESHOOTING.md"

# 8. Create OAuth monitoring script
print_status "Creating OAuth monitoring script..."

cat > scripts/monitor-oauth.sh << 'EOF'
#!/bin/bash

# OAuth Configuration Monitor
# Continuously monitors OAuth configuration health

set -e

echo "🔍 OAuth Configuration Monitor"
echo "============================="

while true; do
    echo "$(date): Checking OAuth configuration..."
    
    if [ -f scripts/validate-env.sh ]; then
        if ./scripts/validate-env.sh > /dev/null 2>&1; then
            echo "✅ OAuth configuration is healthy"
        else
            echo "❌ OAuth configuration issue detected!"
            echo "   Run: make oauth-validate for details"
        fi
    else
        echo "⚠️  OAuth validation script not found"
    fi
    
    sleep 30
done
EOF

chmod +x scripts/monitor-oauth.sh
print_success "Created scripts/monitor-oauth.sh"

# 9. Update package.json scripts
print_status "Updating package.json with OAuth-safe scripts..."

# Add OAuth-safe scripts to package.json
if [ -f package.json ]; then
    # Create a temporary file with updated scripts
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['dev:safe'] = './scripts/dev-start.sh';
    pkg.scripts['oauth:validate'] = './scripts/validate-env.sh';
    pkg.scripts['oauth:backup'] = './scripts/backup-oauth-config.sh';
    pkg.scripts['oauth:restore'] = './scripts/restore-oauth-config.sh';
    pkg.scripts['oauth:monitor'] = './scripts/monitor-oauth.sh';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json with OAuth-safe scripts');
    "
fi

# 10. Create OAuth configuration test
print_status "Creating OAuth configuration test..."

cat > scripts/test-oauth-health.js << 'EOF'
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
EOF

chmod +x scripts/test-oauth-health.js
print_success "Created scripts/test-oauth-health.js"

# 11. Create OAuth configuration documentation
print_status "Creating OAuth configuration documentation..."

cat > docs/OAUTH_CONFIGURATION.md << 'EOF'
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
- **OAuth 2.0 Client ID**: 576948928537-jl3e070vrnse60doatif8n8anigs5ar7.apps.googleusercontent.com
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
EOF

print_success "Created docs/OAUTH_CONFIGURATION.md"

# 12. Create OAuth status check
print_status "Creating OAuth status check..."

cat > scripts/oauth-status.sh << 'EOF'
#!/bin/bash

# OAuth Status Check
# Quick status check for OAuth configuration

echo "📊 OAuth Configuration Status"
echo "============================"

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing"
    exit 1
fi

# Check OAuth variables
if grep -q "VITE_MOODLE_OAUTH_CLIENT_ID" .env; then
    echo "✅ Client ID configured"
else
    echo "❌ Client ID missing"
fi

if grep -q "VITE_MOODLE_OAUTH_CLIENT_SECRET" .env; then
    echo "✅ Client Secret configured"
else
    echo "❌ Client Secret missing"
fi

if grep -q "VITE_MOODLE_OAUTH_REDIRECT_URI" .env; then
    echo "✅ Redirect URI configured"
else
    echo "❌ Redirect URI missing"
fi

# Check for placeholder values
if grep -q "your_google_client_id" .env; then
    echo "⚠️  Placeholder Client ID detected"
fi

if grep -q "your_google_client_secret" .env; then
    echo "⚠️  Placeholder Client Secret detected"
fi

# Check development server
if pgrep -f "vite" > /dev/null; then
    echo "✅ Development server running"
else
    echo "❌ Development server not running"
fi

# Check API server
if pgrep -f "node.*api" > /dev/null; then
    echo "✅ API server running"
else
    echo "❌ API server not running"
fi

echo ""
echo "🔧 Quick fixes:"
echo "  make oauth-validate  # Validate configuration"
echo "  make oauth-restore   # Restore from backup"
echo "  make dev-safe        # Safe development start"
EOF

chmod +x scripts/oauth-status.sh
print_success "Created scripts/oauth-status.sh"

# 13. Add OAuth status to Makefile
print_status "Adding OAuth status to Makefile..."

cat >> Makefile << 'EOF'

oauth-status:
	@echo "📊 Checking OAuth status..."
	@./scripts/oauth-status.sh
EOF

print_success "Added OAuth status to Makefile"

# 14. Create OAuth configuration summary
print_status "Creating OAuth configuration summary..."

echo ""
echo "🛡️  OAuth Configuration Safeguards Installed"
echo "============================================="
echo ""
echo "✅ Created validation script: scripts/validate-env.sh"
echo "✅ Created pre-commit hook: .git/hooks/pre-commit"
echo "✅ Created safe development script: scripts/dev-start.sh"
echo "✅ Created backup script: scripts/backup-oauth-config.sh"
echo "✅ Created restore script: scripts/restore-oauth-config.sh"
echo "✅ Created monitoring script: scripts/monitor-oauth.sh"
echo "✅ Created health check: scripts/test-oauth-health.js"
echo "✅ Created status check: scripts/oauth-status.sh"
echo "✅ Updated Makefile with OAuth commands"
echo "✅ Updated package.json with OAuth scripts"
echo "✅ Created troubleshooting guide: docs/OAUTH_TROUBLESHOOTING.md"
echo "✅ Created configuration guide: docs/OAUTH_CONFIGURATION.md"
echo ""
echo "🚀 Available Commands:"
echo "  make oauth-validate  # Validate OAuth configuration"
echo "  make oauth-backup    # Backup working OAuth config"
echo "  make oauth-restore   # Restore OAuth config from backup"
echo "  make oauth-status    # Check OAuth status"
echo "  make dev-safe        # Safe development start with validation"
echo ""
echo "📚 Documentation:"
echo "  docs/OAUTH_CONFIGURATION.md     # Configuration guide"
echo "  docs/OAUTH_TROUBLESHOOTING.md   # Troubleshooting guide"
echo ""
echo "🔧 Quick OAuth Fix:"
echo "  make oauth-validate || make oauth-restore"
echo "  make dev-safe"
echo ""
echo "✅ OAuth configuration safeguards are now in place!"
echo "   Similar issues should not happen again."
