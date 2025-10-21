// Environment configuration for Vite
// This file handles environment variables in the browser

interface EnvConfig {
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
  // Google Classroom
  GOOGLE_CLIENT_ID: getEnvVar("VITE_GOOGLE_CLIENT_ID"),
  GOOGLE_API_KEY: getEnvVar("VITE_GOOGLE_API_KEY"),

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
export const isGoogleClassroomConfigured = (): boolean => {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_API_KEY);
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
