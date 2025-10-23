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
