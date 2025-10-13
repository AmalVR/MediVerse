# Database Setup Help

You're seeing a database connection error. Here's how to fix it.

## The Issue

From your terminal, you have Supabase running on port 54322, but your `.env` is configured for a different database.

## Quick Fix Options

### Option 1: Use Local PostgreSQL (Recommended)

Your local PostgreSQL is running. Just create the database:

```bash
# Create the database
createdb mediverse

# Or with specific user
createdb -U postgres mediverse

# Update .env to use your PostgreSQL user (usually your username)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/mediverse"

# Or use postgres user (if password is set)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mediverse"

# Then run migrations
npm run prisma:push
npm run db:seed
```

### Option 2: Use Docker PostgreSQL

```bash
# Start PostgreSQL in Docker
npm run docker:dev

# Use this DATABASE_URL in .env:
DATABASE_URL="postgresql://mediverse:mediverse_password@localhost:5432/mediverse"

# Then run migrations
npm run prisma:push
npm run db:seed
```

### Option 3: Use Your Running Supabase

```bash
# Update .env to use Supabase:
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Then run migrations
npm run prisma:push
npm run db:seed
```

## Check Your Current Setup

```bash
# 1. Check what's running
ps aux | grep postgres | grep -v grep
docker ps

# 2. Test connection
psql -U postgres -l  # List databases

# 3. Check your .env
cat .env | grep DATABASE_URL
```

## Default User Credentials

### Local PostgreSQL (Homebrew on macOS)

```bash
# Usually no password, username is your system user
DATABASE_URL="postgresql://$(whoami)@localhost:5432/mediverse"

# Or:
DATABASE_URL="postgresql://localhost:5432/mediverse"
```

### Docker PostgreSQL (from docker-compose)

```bash
DATABASE_URL="postgresql://mediverse:mediverse_password@localhost:5432/mediverse"
```

### Supabase Local

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

## Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE mediverse;
\q

# Or one-liner
psql -U postgres -c "CREATE DATABASE mediverse;"

# Or createdb command
createdb mediverse
```

## Test Connection

```bash
# Test with psql
psql "postgresql://YOUR_USER@localhost:5432/mediverse"

# Should connect without errors
# Type \q to quit
```

## Update Your .env

```bash
# Copy the example
cp env.example .env

# Edit and uncomment the DATABASE_URL that matches your setup
nano .env

# For local PostgreSQL (most common on Mac):
DATABASE_URL="postgresql://$(whoami)@localhost:5432/mediverse"
```

## Then Run

```bash
npm run prisma:push
npm run db:seed
npm start
```

Should work! ✅
