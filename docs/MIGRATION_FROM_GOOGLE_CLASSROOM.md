# Migration from Google Classroom to Moodle LMS

This guide helps existing MediVerse users migrate from Google Classroom integration to the new Moodle LMS platform.

## Overview

MediVerse has transitioned from Google Classroom to Moodle LMS to provide:

- Better content management capabilities
- Enhanced assessment tools
- Improved student progress tracking
- More flexible course organization
- Self-hosted control over learning data

## Migration Steps

### 1. Export Data from Google Classroom

#### Export Course Information

1. Go to Google Classroom
2. For each course you want to migrate:
   - Note the course name, description, and settings
   - Export the class roster (student emails)
   - Download any uploaded materials (videos, documents, assignments)

#### Export Student Data

1. Access Google Classroom Admin Console
2. Export student enrollment data
3. Note any custom grading or progress tracking

### 2. Set Up Moodle LMS

#### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database access
- Google Cloud Console OAuth credentials

#### Installation

1. Clone the MediVerse repository
2. Copy `env.example` to `.env`
3. Configure Moodle environment variables:

   ```env
   MOODLE_URL=http://localhost:8081
   MOODLE_API_URL=http://localhost:8081/webservice/rest/server.php
   MOODLE_API_TOKEN=your_moodle_api_token_here
   MOODLE_ADMIN_USERNAME=admin
   MOODLE_ADMIN_PASSWORD=admin123!

   # OAuth Configuration
   MOODLE_OAUTH_CLIENT_ID=your_google_client_id
   MOODLE_OAUTH_CLIENT_SECRET=your_google_client_secret
   MOODLE_OAUTH_REDIRECT_URI=http://localhost:8081/auth/oauth2/callback.php
   ```

4. Start the services:

   ```bash
   docker-compose up -d
   ```

5. Initialize databases:
   ```bash
   ./scripts/init-databases.sh
   ```

### 3. Create Courses in Moodle

#### Using MediVerse Interface

1. Log into MediVerse
2. Navigate to Teacher Mode
3. Click "Create Course" in the Moodle LMS tab
4. Fill in course details:
   - Course name (match Google Classroom course name)
   - Description
   - Category (anatomy system)
   - Level (beginner/intermediate/advanced)
   - Duration
   - Price (if applicable)

#### Manual Course Creation

1. Access Moodle directly at `http://localhost:8081`
2. Log in as admin
3. Create courses matching your Google Classroom structure
4. Note the course IDs for later reference

### 4. Migrate Content

#### Video Content

1. Download videos from Google Classroom
2. In MediVerse, go to your course
3. Click "Add Video" button
4. Upload videos with proper metadata:
   - Title
   - Description
   - Category (anatomy system)
   - Tags

#### Assignments and Quizzes

1. Create new assignments in Moodle:

   - Use "Add Assignment" button in course management
   - Set due dates and grading criteria
   - Upload assignment instructions

2. Create quizzes:
   - Use "Add Quiz" button
   - Recreate questions from Google Classroom
   - Set time limits and attempt limits

#### Teaching Sessions

1. Create teaching sessions in MediVerse
2. Link sessions to Moodle courses using the sync service
3. Sessions will appear as activities in Moodle

### 5. Enroll Students

#### Bulk Enrollment

1. Export student emails from Google Classroom
2. In Moodle, go to course enrollment
3. Add students by email address
4. Send enrollment notifications

#### Self-Enrollment

1. Enable self-enrollment in Moodle course settings
2. Share course enrollment keys with students
3. Students can enroll using the enrollment key

### 6. Configure OAuth Authentication

#### Google Cloud Console Setup

1. Go to Google Cloud Console
2. Create or update OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:8081/auth/oauth2/callback.php`
   - `http://localhost:3000/auth/callback` (for MediVerse)

#### Moodle OAuth Configuration

1. In Moodle admin panel, go to Site Administration
2. Navigate to Plugins > Authentication > OAuth 2
3. Configure Google OAuth provider:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
   - Redirect URI: `http://localhost:8081/auth/oauth2/callback.php`

### 7. Test the Integration

#### Teacher Testing

1. Log in to MediVerse with Google account
2. Verify Moodle authentication works
3. Create a test course
4. Upload test content
5. Verify content appears in Moodle

#### Student Testing

1. Enroll test students in courses
2. Verify students can access content
3. Test quiz and assignment functionality
4. Verify progress tracking works

## Data Mapping

### Course Structure

| Google Classroom | Moodle LMS     |
| ---------------- | -------------- |
| Class            | Course         |
| Classwork        | Course Modules |
| Assignments      | Assignments    |
| Questions        | Quizzes        |
| Materials        | Resources      |
| Students         | Enrolled Users |

### Content Types

| Google Classroom | Moodle LMS          |
| ---------------- | ------------------- |
| Video            | Resource (File)     |
| Document         | Resource (File)     |
| Assignment       | Assignment          |
| Quiz             | Quiz                |
| Material         | Resource (URL/File) |

## Troubleshooting

### Common Issues

#### Authentication Problems

- **Issue**: OAuth redirect not working
- **Solution**: Verify redirect URIs in Google Cloud Console match exactly

#### Content Upload Failures

- **Issue**: Videos not uploading to Moodle
- **Solution**: Check file size limits and PHP upload settings

#### Database Connection Issues

- **Issue**: Moodle can't connect to database
- **Solution**: Verify PostgreSQL is running and credentials are correct

#### Student Enrollment Issues

- **Issue**: Students can't enroll in courses
- **Solution**: Check enrollment methods and course settings

### Getting Help

1. Check Moodle logs: `/var/www/html/moodledata/error.log`
2. Check MediVerse logs: Browser developer console
3. Verify Docker container logs: `docker-compose logs moodle`
4. Check database connectivity: `docker-compose logs postgres`

## Rollback Plan

If you need to revert to Google Classroom:

1. Stop Moodle services: `docker-compose down`
2. Restore Google Classroom integration code
3. Update environment variables
4. Restart services

**Note**: Data created in Moodle will not automatically sync back to Google Classroom.

## Benefits of Migration

### For Teachers

- **Better Content Management**: Organize content by anatomy systems
- **Enhanced Assessments**: More quiz and assignment options
- **Detailed Analytics**: Track student progress and engagement
- **Flexible Grading**: Custom grading scales and rubrics

### For Students

- **Unified Experience**: Single login for all learning activities
- **Better Progress Tracking**: Visual progress indicators
- **Mobile Access**: Responsive design for mobile devices
- **Offline Capabilities**: Download content for offline study

### For Administrators

- **Self-Hosted Control**: Complete control over data and privacy
- **Customization**: Modify platform to specific needs
- **Cost Control**: No per-student licensing fees
- **Integration**: Seamless integration with existing MediVerse features

## Next Steps

After successful migration:

1. **Train Users**: Provide training on new Moodle features
2. **Customize**: Configure Moodle themes and plugins
3. **Backup**: Set up regular database backups
4. **Monitor**: Track usage and performance metrics
5. **Enhance**: Add custom plugins and integrations as needed

## Support

For additional support during migration:

- Check the [Moodle Setup Guide](./MOODLE_SETUP.md)
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Contact the development team for technical assistance
