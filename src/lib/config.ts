/**
 * Application configuration
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "", // Empty string means use relative URL
  wsUrl: import.meta.env.VITE_WS_URL || "", // Empty string means use relative URL
  isDev: import.meta.env.DEV,
} as const;
