# Google Classroom Integration Setup Guide

## Overview

MediVerse now integrates seamlessly with Google Classroom, allowing teachers to:

- Access their Google Classroom courses
- Share MediVerse content (videos, announcements, assignments) directly to Google Classroom
- View course announcements and assignments
- Manage students and course content

## Prerequisites

1. **Google Cloud Console Account** - You need a Google account with access to Google Cloud Console
2. **Google Classroom API Access** - The Classroom API must be enabled for your project
3. **OAuth 2.0 Credentials** - Client ID and API key for authentication

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `MediVerse-Classroom-Integration`
4. Click "Create"

### 2. Enable Google Classroom API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Classroom API"
3. Click on "Google Classroom API"
4. Click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `MediVerse`
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/classroom.courses.readonly`
     - `https://www.googleapis.com/auth/classroom.courses`
     - `https://www.googleapis.com/auth/classroom.rosters.readonly`
     - `https://www.googleapis.com/auth/classroom.rosters`
     - `https://www.googleapis.com/auth/classroom.profile.emails`
     - `https://www.googleapis.com/auth/classroom.profile.photos`
     - `https://www.googleapis.com/auth/classroom.coursework.me`
     - `https://www.googleapis.com/auth/classroom.coursework.students`
     - `https://www.googleapis.com/auth/classroom.announcements`
4. Choose "Web application"
5. Add authorized origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 4. Create API Key

1. In "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the **API Key**
4. (Optional) Restrict the API key to Classroom API for security

### 5. Configure Environment Variables

Add the following to your `.env` file:

```env
# Google Classroom Integration
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```

**Important:** Never commit these credentials to version control!

### 6. Update .env.example

Add the Google Classroom variables to your `.env.example` file:

```env
# Google Classroom Integration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

## Usage

### For Teachers

1. **Access Google Classroom Integration**:

   - Go to Teach Mode → Google Classroom tab
   - Or Group Study Mode → Google Classroom tab

2. **Sign In**:

   - Click "Sign In with Google"
   - Grant necessary permissions

3. **View Courses**:

   - See all your Google Classroom courses
   - View course details and enrollment codes

4. **Share Content**:

   - Select a course
   - Choose content type (Announcement or Assignment)
   - Add title, description, and optional video URL
   - Click "Share to Google Classroom"

5. **View Course Content**:
   - Browse announcements and assignments
   - See recent activity in your courses

### For Students

Students can access shared content through their Google Classroom interface. MediVerse content will appear as:

- **Announcements**: With embedded video links and descriptions
- **Assignments**: With video tutorials and assignment details

## Features

### ✅ Implemented Features

- **Course Management**: View all Google Classroom courses
- **Content Sharing**: Share videos and content as announcements or assignments
- **Student Roster**: View enrolled students in courses
- **Announcements**: Create and view course announcements
- **Assignments**: Create and view course assignments
- **Authentication**: Secure OAuth 2.0 integration

### 🔄 Planned Features

- **Grade Integration**: Submit grades back to Google Classroom
- **Student Progress**: Track student engagement with MediVerse content
- **Bulk Operations**: Share content to multiple courses at once
- **Content Sync**: Automatic sync of MediVerse content with Classroom

## Security Considerations

1. **API Key Restrictions**: Restrict your API key to specific APIs and domains
2. **OAuth Scopes**: Only request necessary permissions
3. **Environment Variables**: Never expose credentials in client-side code
4. **HTTPS**: Always use HTTPS in production
5. **Token Management**: Tokens are automatically managed by the Google API client

## Troubleshooting

### Common Issues

1. **"Google Classroom not configured"**

   - Check that environment variables are set correctly
   - Verify the Google Cloud project has Classroom API enabled

2. **"Sign in failed"**

   - Check OAuth consent screen configuration
   - Verify authorized origins include your domain
   - Ensure all required scopes are added

3. **"Failed to load courses"**

   - Verify the user has Google Classroom access
   - Check that the Classroom API is enabled
   - Ensure proper permissions are granted

4. **"Share failed"**
   - Verify the user is a teacher in the selected course
   - Check that the course is active
   - Ensure proper permissions for creating content

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
REACT_APP_DEBUG_GOOGLE_CLASSROOM=true
```

This will log detailed information about API calls and responses.

## API Limits

Google Classroom API has the following limits:

- **Quota**: 1,000,000 requests per day
- **Rate Limit**: 100 requests per 100 seconds per user
- **Course Limit**: 20 courses per teacher (free), 1,000 courses (paid)

## Support

For issues with Google Classroom integration:

1. Check the [Google Classroom API documentation](https://developers.google.com/classroom)
2. Verify your Google Cloud Console configuration
3. Check browser console for error messages
4. Ensure all environment variables are correctly set

## Production Deployment

### Environment Variables for Production

```env
# Production Google Classroom Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
REACT_APP_GOOGLE_API_KEY=your_production_api_key
```

### Security Checklist

- [ ] API key is restricted to specific APIs
- [ ] OAuth client is configured with production domains
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] OAuth consent screen is properly configured

## Cost Considerations

- **Google Classroom API**: Free for educational use
- **Google Cloud Platform**: Free tier includes generous quotas
- **Additional Costs**: Only if you exceed free tier limits

The integration is designed to be cost-effective for educational institutions.
