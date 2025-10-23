#!/bin/bash

# Database Initialization Script for MediVerse
# This script initializes both mediverse and moodle databases in a single PostgreSQL instance

set -e

echo "Initializing databases for MediVerse..."

# Database connection parameters
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-mediverse}
DB_PASSWORD=${DB_PASSWORD:-mediverse_password}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

# Create databases
echo "Creating databases..."

# Create mediverse database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE IF NOT EXISTS mediverse;" || echo "Database mediverse already exists"

# Create moodle database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE IF NOT EXISTS moodle;" || echo "Database moodle already exists"

# Grant privileges
echo "Setting up database privileges..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE mediverse TO $DB_USER;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE moodle TO $DB_USER;"

# Create moodle user for Moodle-specific access (optional)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE USER IF NOT EXISTS moodle WITH PASSWORD 'moodle_password';" || echo "User moodle already exists"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE moodle TO moodle;"

echo "Database initialization completed successfully!"
echo "Databases created:"
echo "  - mediverse (for MediVerse application data)"
echo "  - moodle (for Moodle LMS data)"
echo ""
echo "Connection strings:"
echo "  MediVerse: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/mediverse"
echo "  Moodle: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/moodle"
