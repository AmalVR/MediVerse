/**
 * Moodle OAuth 2.0 Authentication Service
 *
 * This service handles OAuth 2.0 authentication between MediVerse and Moodle,
 * including Google Sign-In integration and user session management.
 */

import { env } from "../env";
import { moodleAPI, MoodleUser } from "./api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  moodleToken?: string;
  isTeacher: boolean;
  isStudent: boolean;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export class MoodleAuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "MoodleAuthError";
  }
}

export class MoodleAuthService {
  private oauthConfig: OAuthConfig;
  private currentUser: AuthUser | null = null;

  constructor() {
    this.oauthConfig = {
      clientId: env.MOODLE_OAUTH_CLIENT_ID || "placeholder_client_id",
      clientSecret:
        env.MOODLE_OAUTH_CLIENT_SECRET || "placeholder_client_secret",
      redirectUri:
        env.MOODLE_OAUTH_REDIRECT_URI ||
        "http://localhost:8081/auth/oauth2/callback.php",
      scope: ["openid", "profile", "email"],
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    };

    if (!env.MOODLE_OAUTH_CLIENT_ID || !env.MOODLE_OAUTH_CLIENT_SECRET) {
      console.warn(
        "⚠️ OAuth configuration is missing. Using placeholder values. Please check your environment variables."
      );
    }
  }

  /**
   * Check if OAuth is properly configured
   */
  isConfigured(): boolean {
    const clientId = env.MOODLE_OAUTH_CLIENT_ID;
    const clientSecret = env.MOODLE_OAUTH_CLIENT_SECRET;

    // Check if values exist and are not placeholder values
    const placeholderValues = [
      "your_google_client_id",
      "demo_client_id",
      "placeholder_client_id",
      "your_google_client_secret",
      "demo_client_secret",
      "placeholder_client_secret",
    ];

    // Basic validation - just check if values exist and are not placeholders
    return !!(
      clientId &&
      clientSecret &&
      !placeholderValues.includes(clientId) &&
      !placeholderValues.includes(clientSecret)
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      response_type: "code",
      scope: this.oauthConfig.scope.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    if (state) {
      params.append("state", state);
    }

    return `${this.oauthConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    try {
      const response = await fetch(this.oauthConfig.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.oauthConfig.clientId,
          client_secret: this.oauthConfig.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: this.oauthConfig.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new MoodleAuthError(
          `Token exchange failed: ${response.statusText}`,
          "TOKEN_EXCHANGE_ERROR",
          response.status
        );
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      if (error instanceof MoodleAuthError) {
        throw error;
      }
      throw new MoodleAuthError(
        `Token exchange error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "TOKEN_EXCHANGE_ERROR"
      );
    }
  }

  /**
   * Get user information from Google OAuth
   */
  async getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    verified_email: boolean;
  }> {
    try {
      const response = await fetch(this.oauthConfig.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new MoodleAuthError(
          `User info fetch failed: ${response.statusText}`,
          "USER_INFO_ERROR",
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof MoodleAuthError) {
        throw error;
      }
      throw new MoodleAuthError(
        `User info error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "USER_INFO_ERROR"
      );
    }
  }

  /**
   * Create or update Moodle user from OAuth data
   */
  async createOrUpdateMoodleUser(
    googleUser: any,
    accessToken: string
  ): Promise<MoodleUser> {
    try {
      // First, try to find existing user by email
      let moodleUser: MoodleUser;
      try {
        moodleUser = await moodleAPI.getUserByField("email", googleUser.email);
      } catch (error) {
        // User doesn't exist, create new one
        moodleUser = await moodleAPI.createUser({
          username: googleUser.email.split("@")[0], // Use email prefix as username
          firstname: googleUser.given_name,
          lastname: googleUser.family_name,
          email: googleUser.email,
          confirmed: 1,
          suspended: 0,
        });
      }

      // Generate Moodle API token for the user
      const moodleToken = await moodleAPI.generateUserToken(moodleUser.id);

      return {
        ...moodleUser,
        moodleToken,
      };
    } catch (error) {
      throw new MoodleAuthError(
        `Failed to create/update Moodle user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "MOODLE_USER_ERROR"
      );
    }
  }

  /**
   * Authenticate with Google OAuth (simplified flow for demo)
   */
  async authenticateWithGoogle(): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      if (!this.isConfigured()) {
        throw new MoodleAuthError(
          "OAuth configuration is missing. Please check your environment variables.",
          "CONFIG_ERROR"
        );
      }

      // For demo purposes, create a mock user
      // In a real implementation, this would redirect to Google OAuth
      const mockUser: AuthUser = {
        id: "demo-user-1",
        username: "demo.user",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        fullName: "Demo User",
        avatar: "https://via.placeholder.com/150",
        moodleToken: "demo-token",
        isTeacher: true,
        isStudent: false,
      };

      this.currentUser = mockUser;
      this.saveUserSession(mockUser);

      return {
        success: true,
        user: mockUser,
      };
    } catch (error) {
      console.error("Google authentication error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  /**
   * Complete OAuth authentication flow
   */
  async authenticateWithCode(code: string): Promise<AuthUser> {
    try {
      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code);

      // Get user info from Google
      const googleUser = await this.getUserInfo(tokenData.accessToken);

      // Create or update Moodle user
      const moodleUser = await this.createOrUpdateMoodleUser(
        googleUser,
        tokenData.accessToken
      );

      // Determine user roles (simplified - in real app, you'd check Moodle roles)
      const isTeacher =
        googleUser.email.includes("@teacher.") ||
        googleUser.email.includes("@instructor.");
      const isStudent = !isTeacher;

      const authUser: AuthUser = {
        id: moodleUser.id,
        username: moodleUser.username,
        email: moodleUser.email,
        firstName: moodleUser.firstname,
        lastName: moodleUser.lastname,
        fullName: `${moodleUser.firstname} ${moodleUser.lastname}`,
        avatar: googleUser.picture,
        moodleToken: moodleUser.moodleToken,
        isTeacher,
        isStudent,
      };

      this.currentUser = authUser;
      this.saveUserSession(authUser);

      return authUser;
    } catch (error) {
      throw new MoodleAuthError(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "AUTH_ERROR"
      );
    }
  }

  /**
   * Save user session to localStorage
   */
  private saveUserSession(user: AuthUser): void {
    try {
      localStorage.setItem("moodle_user", JSON.stringify(user));
    } catch (error) {
      console.warn("Failed to save user session:", error);
    }
  }

  /**
   * Load user session from localStorage
   */
  private loadUserSession(): AuthUser | null {
    try {
      const userData = localStorage.getItem("moodle_user");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.warn("Failed to load user session:", error);
    }
    return null;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.currentUser = this.loadUserSession();
    }
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem("moodle_user");
    } catch (error) {
      console.warn("Failed to clear user session:", error);
    }
  }

  /**
   * Refresh user token if needed
   */
  async refreshToken(): Promise<boolean> {
    // Implementation would depend on your token refresh strategy
    // For now, return true if user exists
    return this.isAuthenticated();
  }

  /**
   * Get Moodle API token for current user
   */
  getMoodleToken(): string | null {
    const user = this.getCurrentUser();
    return user?.moodleToken || null;
  }

  /**
   * Check if current user is a teacher
   */
  isTeacher(): boolean {
    const user = this.getCurrentUser();
    return user?.isTeacher || false;
  }

  /**
   * Check if current user is a student
   */
  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.isStudent || false;
  }

  /**
   * Save user session to localStorage
   */
  private saveUserSession(user: AuthUser): void {
    try {
      localStorage.setItem("moodle_user", JSON.stringify(user));
    } catch (error) {
      console.warn("Failed to save user session:", error);
    }
  }
}

// Create singleton instance with lazy initialization
let _moodleAuth: MoodleAuthService | null = null;

export const moodleAuth = {
  get instance() {
    if (!_moodleAuth) {
      _moodleAuth = new MoodleAuthService();
    }
    return _moodleAuth;
  },

  // Proxy all methods to the instance
  get isConfigured() {
    return this.instance.isConfigured();
  },

  generateAuthUrl(state?: string) {
    return this.instance.generateAuthUrl(state);
  },

  async authenticateWithCode(code: string, state?: string) {
    return this.instance.authenticateWithCode(code, state);
  },

  async authenticateWithGoogle() {
    return this.instance.authenticateWithGoogle();
  },

  async logout() {
    return this.instance.logout();
  },

  getCurrentUser() {
    return this.instance.getCurrentUser();
  },

  setCurrentUser(user: AuthUser | null) {
    return this.instance.setCurrentUser(user);
  },

  async createOrUpdateMoodleUser(authUser: AuthUser) {
    return this.instance.createOrUpdateMoodleUser(authUser);
  },

  isAuthenticated() {
    return this.instance.isAuthenticated();
  },

  isTeacher() {
    return this.instance.isTeacher();
  },

  isStudent() {
    return this.instance.isStudent();
  },
};
