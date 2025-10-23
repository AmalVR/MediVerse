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
