# Moodle LMS Setup Guide

## Overview

MediVerse now integrates with a self-hosted Moodle LMS instance, providing comprehensive course management, student enrollment, assessments, and progress tracking for anatomy learning.

## Prerequisites

- Docker and Docker Compose installed
- Google Cloud Console account (for OAuth 2.0)
- PostgreSQL knowledge (basic)

## Quick Start

### 1. Start Moodle Services

**For Development:**

```bash
# Start only Moodle services for development
docker-compose -f docker-compose.dev.yml up moodle moodle-db-dev -d

# Or start all development services
docker-compose -f docker-compose.dev.yml up -d
```

**For Production:**

```bash
# Start all services including Moodle
docker-compose up -d
```

### 2. Access Moodle

- **Moodle Admin Panel**: http://localhost:8080
- **Admin Credentials**:
  - Username: `admin`
  - Password: `admin123!`
  - Email: `admin@mediverse.local`

### 3. Initial Configuration

1. **Complete Moodle Installation**:

   - Access http://localhost:8080
   - Follow the installation wizard
   - Database settings are pre-configured

2. **Configure OAuth 2.0**:
   - Go to Site Administration → Plugins → Authentication → Manage authentication
   - Enable "OAuth 2" authentication
   - Configure Google OAuth provider

## Detailed Setup

### Environment Variables

Add to your `.env` file:

```env
# Moodle Configuration
MOODLE_URL=http://localhost:8080
MOODLE_API_URL=http://localhost:8080/webservice/rest/server.php
MOODLE_API_TOKEN=your_moodle_api_token_here
MOODLE_ADMIN_USERNAME=admin
MOODLE_ADMIN_PASSWORD=admin123!

# OAuth 2.0 Configuration (Google Cloud Console)
MOODLE_OAUTH_CLIENT_ID=your_google_client_id
MOODLE_OAUTH_CLIENT_SECRET=your_google_client_secret
MOODLE_OAUTH_REDIRECT_URI=http://localhost:8080/auth/oauth2/callback.php
```

### OAuth 2.0 Setup

#### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:8080/auth/oauth2/callback.php` (development)
     - `https://yourdomain.com/auth/oauth2/callback.php` (production)

#### 2. Moodle OAuth Configuration

1. **Access Moodle Admin**:

   - Login as admin
   - Go to Site Administration → Plugins → Authentication → Manage authentication

2. **Enable OAuth 2**:

   - Click the eye icon next to "OAuth 2" to enable it
   - Click the settings icon to configure

3. **Configure Google Provider**:
   - Provider name: `Google`
   - Client ID: Your Google OAuth client ID
   - Client secret: Your Google OAuth client secret
   - Scope: `openid email profile`
   - Authorization endpoint: `https://accounts.google.com/o/oauth2/auth`
   - Token endpoint: `https://oauth2.googleapis.com/token`
   - User info endpoint: `https://www.googleapis.com/oauth2/v2/userinfo`

### API Token Setup

1. **Create API User**:

   - Go to Site Administration → Users → Add a new user
   - Create user: `mediverse_api`
   - Assign role: "Web service user"

2. **Generate API Token**:

   - Go to Site Administration → Server → Web services → Manage tokens
   - Create token for `mediverse_api` user
   - Copy the generated token to your `.env` file

3. **Enable REST Protocol**:
   - Go to Site Administration → Server → Web services → Manage protocols
   - Enable "REST protocol"

### Course Categories Setup

Create anatomy-specific course categories:

1. **Go to Site Administration → Courses → Manage courses and categories**
2. **Create Categories**:
   - Cardiovascular System
   - Muscular System
   - Nervous System
   - Respiratory System
   - Skeletal System
   - General Anatomy

## Integration Features

### Course Management

- **Create Courses**: Teachers can create anatomy courses
- **Course Enrollment**: Students join via enrollment codes
- **Course Content**: Upload Unity 3D models and interactive content

### Assessment Integration

- **Quiz Creation**: Create anatomy quizzes linked to Unity topics
- **Question Banks**: Build question banks for different anatomy systems
- **Grade Passback**: Grades sync between MediVerse and Moodle

### Progress Tracking

- **Learning Analytics**: Track student progress in Unity interactions
- **Completion Tracking**: Monitor course completion rates
- **Performance Reports**: Generate detailed learning reports

## Troubleshooting

### Common Issues

1. **Moodle Won't Start**:

   ```bash
   # Check container logs
   docker logs mediverse-moodle-dev

   # Restart services
   docker-compose -f docker-compose.dev.yml restart moodle
   ```

2. **Database Connection Issues**:

   ```bash
   # Check database container
   docker logs mediverse-moodle-db-dev

   # Verify database is running
   docker exec -it mediverse-moodle-db-dev psql -U moodle -d moodle
   ```

3. **OAuth Authentication Fails**:

   - Verify Google Cloud Console redirect URIs
   - Check Moodle OAuth configuration
   - Ensure HTTPS in production

4. **API Token Issues**:
   - Verify user has "Web service user" role
   - Check token permissions
   - Ensure REST protocol is enabled

### Performance Optimization

1. **Enable Caching**:

   - Go to Site Administration → Development → Purge all caches
   - Configure Redis caching (already included in Docker setup)

2. **Database Optimization**:

   - Regular database maintenance
   - Monitor database size and performance

3. **File Storage**:
   - Configure external file storage for large Unity models
   - Use CDN for static assets

## Security Considerations

1. **Change Default Passwords**:

   - Update admin password from default
   - Use strong passwords for all accounts

2. **HTTPS Configuration**:

   - Enable SSL in production
   - Update OAuth redirect URIs for HTTPS

3. **API Security**:

   - Rotate API tokens regularly
   - Limit API token permissions
   - Monitor API usage

4. **Database Security**:
   - Use strong database passwords
   - Limit database access
   - Regular security updates

## Backup and Maintenance

### Database Backup

```bash
# Backup Moodle database
docker exec mediverse-moodle-db-dev pg_dump -U moodle moodle > moodle_backup.sql

# Restore database
docker exec -i mediverse-moodle-db-dev psql -U moodle moodle < moodle_backup.sql
```

### File Backup

```bash
# Backup Moodle data directory
docker run --rm -v mediverse_moodle_dev_data:/data -v $(pwd):/backup alpine tar czf /backup/moodle_data_backup.tar.gz -C /data .
```

### Regular Maintenance

1. **Update Moodle**:

   - Check for Moodle updates
   - Test updates in development first
   - Backup before updating

2. **Monitor Performance**:
   - Check container resource usage
   - Monitor database performance
   - Review error logs

## Development Workflow

### Local Development

1. **Start Development Environment**:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Access Services**:

   - Moodle: http://localhost:8080
   - pgAdmin: http://localhost:5050
   - MediVerse API: http://localhost:3000

3. **Make Changes**:
   - Modify Moodle configuration via web interface
   - Test API integrations
   - Develop custom plugins if needed

### Production Deployment

1. **Environment Setup**:

   - Configure production environment variables
   - Set up SSL certificates
   - Configure domain names

2. **Deploy**:

   ```bash
   docker-compose up -d
   ```

3. **Post-Deployment**:
   - Verify all services are running
   - Test OAuth authentication
   - Configure monitoring and alerts

## Next Steps

After Moodle is set up:

1. **Configure OAuth 2.0** authentication
2. **Set up API integration** with MediVerse
3. **Create course templates** for anatomy learning
4. **Configure assessment tools** for Unity integration
5. **Set up progress tracking** and analytics

## Support

For issues with Moodle setup:

1. Check the [Moodle Documentation](https://docs.moodle.org/)
2. Review Docker container logs
3. Verify environment configuration
4. Test database connectivity
5. Check OAuth configuration

## Cost Considerations

- **Self-hosted**: No licensing fees, requires server resources
- **Database**: PostgreSQL (included in setup)
- **Storage**: Docker volumes for data persistence
- **Bandwidth**: Consider CDN for large Unity models
- **Maintenance**: Regular updates and monitoring required
