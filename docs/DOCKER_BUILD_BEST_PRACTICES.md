# Docker Build Best Practices

## Preventing Build Issues

To prevent caching issues that can cause "Can't reach database server" errors, always use clean builds when:

- Adding new environment variables (like `.env` files)
- Changing Dockerfile configuration
- Updating dependencies
- Modifying server code

## Quick Commands

### Clean Rebuilds

```bash
# Rebuild API container with no-cache
make docker-rebuild-api

# Rebuild all containers with no-cache
make docker-rebuild-all

# Rebuild Moodle container with no-cache
make docker-rebuild-moodle
```

### Development Workflow

```bash
# Full clean development setup
make dev-full

# Clean and rebuild everything
make dev-rebuild

# Check service status
make dev-status
```

### Manual Clean Rebuilds

```bash
# Stop containers
docker-compose down

# Build with no-cache
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

## When to Use Clean Builds

Always use `--no-cache` when:

1. **Environment Variables**: Adding/updating `.env` files
2. **Dockerfile Changes**: Modifying Docker configuration
3. **Dependencies**: Updating package.json files
4. **Code Changes**: After major refactoring
5. **Database Issues**: When getting connection errors

## Troubleshooting

If you encounter database connection issues:

1. **Check Environment Variables**:

   ```bash
   docker exec mediverse-api env | grep DATABASE_URL
   ```

2. **Verify .env File**:

   ```bash
   docker exec mediverse-api cat /app/.env
   ```

3. **Clean Rebuild**:

   ```bash
   make docker-rebuild-api
   ```

4. **Check Logs**:
   ```bash
   make logs
   ```

## Best Practices

- Always use `make docker-rebuild-api` instead of `docker-compose restart api`
- Use `make dev-full` for complete development setup
- Check `make dev-status` to verify all services are running
- Use `make logs` to debug issues
