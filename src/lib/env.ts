// Environment configuration for Vite
// This file handles environment variables in the browser

interface EnvConfig {
  // Google Classroom Integration (DEPRECATED - will be removed in v2.0)
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_GOOGLE_API_KEY?: string;
  VITE_VIDEO_STORAGE_TYPE?: string;
  VITE_S3_BUCKET_NAME?: string;
  VITE_S3_REGION?: string;
  VITE_S3_ACCESS_KEY_ID?: string;
  VITE_S3_SECRET_ACCESS_KEY?: string;
  VITE_CLOUDINARY_CLOUD_NAME?: string;
  VITE_CLOUDINARY_API_KEY?: string;
  VITE_CLOUDINARY_API_SECRET?: string;
  VITE_VIMEO_ACCESS_TOKEN?: string;
  // Moodle LMS Integration
  MOODLE_URL?: string;
  MOODLE_API_URL?: string;
  MOODLE_API_TOKEN?: string;
  MOODLE_ADMIN_USERNAME?: string;
  MOODLE_ADMIN_PASSWORD?: string;
  MOODLE_OAUTH_CLIENT_ID?: string;
  MOODLE_OAUTH_CLIENT_SECRET?: string;
  MOODLE_OAUTH_REDIRECT_URI?: string;
}

// Declare global window.env for runtime environment variables
declare global {
  interface Window {
    env?: EnvConfig;
  }
}

// Get environment variable with fallback
export const getEnvVar = (key: string, fallback: string = ""): string => {
  // Try import.meta.env (Vite)
  try {
    const value = (import.meta as any).env[key];
    if (value) return value;
  } catch (error) {
    // import.meta not available, continue to next option
  }

  // Try window.env (runtime)
  if (typeof window !== "undefined" && window.env) {
    const value = window.env[key as keyof EnvConfig];
    if (value) return value;
  }

  return fallback;
};

// Environment configuration
export const env = {
  // Google Classroom (DEPRECATED - will be removed in v2.0)
  GOOGLE_CLIENT_ID: getEnvVar("VITE_GOOGLE_CLIENT_ID"),
  GOOGLE_API_KEY: getEnvVar("VITE_GOOGLE_API_KEY"),

  // Moodle LMS Integration
  MOODLE_URL: getEnvVar("MOODLE_URL", "http://localhost:8081"),
  MOODLE_API_URL: getEnvVar(
    "MOODLE_API_URL",
    "http://localhost:8081/webservice/rest/server.php"
  ),
  MOODLE_API_TOKEN: getEnvVar("MOODLE_API_TOKEN"),
  MOODLE_ADMIN_USERNAME: getEnvVar("MOODLE_ADMIN_USERNAME", "admin"),
  MOODLE_ADMIN_PASSWORD: getEnvVar("MOODLE_ADMIN_PASSWORD"),
  MOODLE_OAUTH_CLIENT_ID: getEnvVar("VITE_MOODLE_OAUTH_CLIENT_ID"),
  MOODLE_OAUTH_CLIENT_SECRET: getEnvVar("VITE_MOODLE_OAUTH_CLIENT_SECRET"),
  MOODLE_OAUTH_REDIRECT_URI: getEnvVar(
    "MOODLE_OAUTH_REDIRECT_URI",
    "http://localhost:8081/auth/oauth2/callback.php"
  ),

  // Video Storage
  VIDEO_STORAGE_TYPE: getEnvVar("VITE_VIDEO_STORAGE_TYPE", "local"),

  // AWS S3
  S3_BUCKET_NAME: getEnvVar("VITE_S3_BUCKET_NAME", "mediverse-videos"),
  S3_REGION: getEnvVar("VITE_S3_REGION", "us-east-1"),
  S3_ACCESS_KEY_ID: getEnvVar("VITE_S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: getEnvVar("VITE_S3_SECRET_ACCESS_KEY"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvVar("VITE_CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnvVar("VITE_CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVar("VITE_CLOUDINARY_API_SECRET"),

  // Vimeo
  VIMEO_ACCESS_TOKEN: getEnvVar("VITE_VIMEO_ACCESS_TOKEN"),
};

// Helper functions
/**
 * @deprecated Google Classroom integration is deprecated and will be removed in v2.0
 * Use Moodle LMS integration instead
 */
export const isGoogleClassroomConfigured = (): boolean => {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_API_KEY);
};

export const isMoodleConfigured = (): boolean => {
  return !!(env.MOODLE_URL && env.MOODLE_API_URL && env.MOODLE_API_TOKEN);
};

export const isMoodleOAuthConfigured = (): boolean => {
  return !!(env.MOODLE_OAUTH_CLIENT_ID && env.MOODLE_OAUTH_CLIENT_SECRET);
};

export const isVideoStorageConfigured = (type: string): boolean => {
  switch (type) {
    case "s3":
      return !!(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);
    case "cloudinary":
      return !!(
        env.CLOUDINARY_CLOUD_NAME &&
        env.CLOUDINARY_API_KEY &&
        env.CLOUDINARY_API_SECRET
      );
    case "vimeo":
      return !!env.VIMEO_ACCESS_TOKEN;
    case "local":
      return true;
    default:
      return false;
  }
};
