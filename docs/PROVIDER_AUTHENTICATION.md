# Provider-Based Authentication

MediVerse now supports provider-based authentication with Google OAuth as the primary method and email/password as a fallback option.

## 🔐 Authentication Methods

### 1. Google OAuth (Primary)

- **One-click login** with Google account
- **Seamless integration** with existing Moodle OAuth setup
- **Automatic user profile** creation from Google data
- **Secure token management** through Moodle's OAuth system

### 2. Email/Password (Fallback)

- **Traditional authentication** for users who prefer not to use Google
- **Manual account creation** with role selection
- **Local session management** for MVP purposes

## 🎨 User Interface

### Login Form

```
┌─────────────────────────────────┐
│  🔐 Sign In                     │
├─────────────────────────────────┤
│  [🔵 Continue with Google]     │ ← Primary option
│  ──── Or continue with email ────│
│  Email: [________________]     │
│  Password: [________________]   │
│  [Sign In with Email]          │ ← Secondary option
└─────────────────────────────────┘
```

### Signup Form

```
┌─────────────────────────────────┐
│  👤 Create Account              │
├─────────────────────────────────┤
│  [🔵 Sign up with Google]      │ ← Primary option
│  ──── Or sign up with email ────│
│  Email: [________________]     │
│  Name: [________________]      │
│  Role: [Student ▼]             │
│  [Create Account with Email]   │ ← Secondary option
└─────────────────────────────────┘
```

## 🔧 Technical Implementation

### AuthPanel Component

- **Dual authentication methods** in single component
- **Visual hierarchy** with Google OAuth as primary
- **Clean separation** with dividers
- **Consistent styling** across login/signup tabs

### UserContext Integration

- **Unified login function** handles both methods
- **Google OAuth flow** via `moodleAuth.authenticateWithGoogle()`
- **Email/password fallback** for MVP authentication
- **Seamless user profile creation** for both methods

### OAuth Configuration

- **Existing Moodle OAuth** setup reused
- **Google Cloud Console** integration maintained
- **Proper redirect URIs** configured
- **Token management** handled by Moodle

## 🚀 Benefits

### User Experience

- **Faster login** with one-click Google authentication
- **Familiar interface** following modern auth patterns
- **Flexibility** to choose preferred authentication method
- **Reduced friction** for new user onboarding

### Technical Benefits

- **Leverages existing OAuth** infrastructure
- **Maintains security** through Google's OAuth system
- **Scalable architecture** for adding more providers (Apple, etc.)
- **Consistent user management** across authentication methods

## 🔮 Future Enhancements

### Additional Providers

- **Apple Sign-In** for iOS users
- **Microsoft OAuth** for enterprise users
- **GitHub OAuth** for developer users
- **Custom SSO** for institutional users

### Enhanced Features

- **Account linking** (link Google account to existing email account)
- **Social profile sync** (avatar, name updates)
- **Multi-provider accounts** (sign in with any linked provider)
- **Advanced role detection** based on email domains

## 📋 Testing

Use the test script to verify functionality:

```bash
./scripts/test-google-oauth-login.sh
```

This tests:

- ✅ Google OAuth button visibility
- ✅ Proper UI hierarchy
- ✅ OAuth flow functionality
- ✅ Fallback email/password option
- ✅ Integration with existing Moodle setup
