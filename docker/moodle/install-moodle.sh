#!/bin/bash
# Moodle installation script

set -e

echo "🔧 Installing Moodle..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h postgres -p 5432 -U mediverse -d postgres; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready!"

# Create Moodle configuration
echo "Creating Moodle configuration..."
envsubst < /var/www/html/config.php.template > /var/www/html/config.php

# Set proper permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Install Moodle CLI
echo "Installing Moodle via CLI..."
php /var/www/html/admin/cli/install.php \
    --lang=en \
    --wwwroot=http://localhost:8081 \
    --dataroot=/var/moodledata \
    --dbtype=pgsql \
    --dbhost=postgres \
    --dbname=moodle \
    --dbuser=mediverse \
    --dbpass=mediverse_password \
    --fullname="MediVerse Moodle" \
    --shortname="mediverse" \
    --adminuser=admin \
    --adminpass=admin123 \
    --adminemail=admin@mediverse.com \
    --agree-license \
    --non-interactive

echo "✅ Moodle installation completed!"

# Start Apache
exec apache2-foreground
