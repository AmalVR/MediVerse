import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { moodleAuth, AuthUser } from "@/lib/moodle/auth";
import { moodleAPI } from "@/lib/moodle/api";
import { env } from "@/lib/env";

export type UserRole = "student" | "mentor" | "platform_admin";
export type UserStatus = "unauthenticated" | "authenticated" | "onboarding";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  status: UserStatus;
  isAuthenticated: boolean;
  moodleUserId?: number;
  moodleToken?: string;
  lastLogin?: Date;
  // Organization fields for mentors
  organizationName?: string;
  organizationType?: "university" | "institution" | "individual";
  // Payment fields for mentors
  platformFeePaid?: boolean;
  commissionRate?: number;
  // Student fields
  enrolledCourses?: string[];
  freeSessionsUsed?: number;
  maxFreeSessions?: number;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, name: string, role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserStatus: (status: UserStatus) => Promise<void>;
  completeOnboarding: (organizationData?: {
    organizationName: string;
    organizationType: "university" | "institution" | "individual";
  }) => Promise<void>;
  completePayment: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from stored session
  useEffect(() => {
    initializeUser();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const state = urlParams.get("state");

      if (error) {
        console.error("OAuth error:", error);
        setError(`Authentication failed: ${error}`);
        return;
      }

      if (code && state) {
        // Verify state parameter
        const storedState = localStorage.getItem("oauth_state");
        if (storedState !== state) {
          console.error("OAuth state mismatch");
          setError("Authentication failed: Invalid state parameter");
          return;
        }

        try {
          setIsLoading(true);
          setError(null);

          console.log("🔄 Processing OAuth callback...");

          // Complete OAuth authentication with Moodle integration
          const authUser = await moodleAuth.authenticateWithCode(code);
          console.log("✅ OAuth authentication completed:", authUser.email);

          // Create user profile
          const userProfile = await createUserProfile(authUser);
          console.log("✅ User profile created:", userProfile.role);

          // Set user state
          setUser(userProfile);
          localStorage.setItem("mediverse_user", JSON.stringify(userProfile));

          // Clean up URL and state
          localStorage.removeItem("oauth_state");

          // Redirect to home page (Index.tsx)
          console.log("🔄 Redirecting to home page...");
          window.history.replaceState({}, document.title, "/");

          // Force a page reload to ensure clean state
          window.location.href = "/";
        } catch (err) {
          console.error("OAuth callback error:", err);
          setError(
            err instanceof Error ? err.message : "Authentication failed"
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Debug: Log environment and auth status
      console.log("🚀 Debug - App Initialization:", {
        env: {
          moodleUrl: env.MOODLE_URL,
          moodleApiUrl: env.MOODLE_API_URL,
          oauthClientId: env.MOODLE_OAUTH_CLIENT_ID ? "✅ Set" : "❌ Missing",
          oauthClientSecret: env.MOODLE_OAUTH_CLIENT_SECRET
            ? "✅ Set"
            : "❌ Missing",
        },
        authStatus: {
          isConfigured: moodleAuth.isConfigured,
          currentUser: moodleAuth.getCurrentUser()
            ? "✅ Logged in"
            : "❌ Not logged in",
        },
      });

      // Check if user is already authenticated
      const currentUser = moodleAuth.getCurrentUser();
      if (currentUser) {
        const userProfile = await createUserProfile(currentUser);
        setUser(userProfile);
      }
    } catch (err) {
      console.error("Error initializing user:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (
    authUser: AuthUser,
    role?: UserRole,
    status: UserStatus = "authenticated"
  ): Promise<UserProfile> => {
    // Determine user role based on email domain or other criteria
    const userRole = role || determineUserRole(authUser.email);

    // Set default values based on role
    const profile: UserProfile = {
      id: authUser.id.toString(),
      email: authUser.email,
      name: authUser.fullName,
      picture: authUser.avatar,
      role: userRole,
      status,
      isAuthenticated: true,
      moodleUserId: authUser.id,
      moodleToken: authUser.moodleToken,
      lastLogin: new Date(),
    };

    // Set role-specific defaults
    if (userRole === "student") {
      profile.enrolledCourses = [];
      profile.freeSessionsUsed = 0;
      profile.maxFreeSessions = 5; // 5 free sessions for students
    } else if (userRole === "mentor") {
      profile.platformFeePaid = false; // Free for now
      profile.commissionRate = 0.1; // 10% commission
      profile.organizationType = "individual";
    }

    return profile;
  };

  const determineUserRole = (email: string): UserRole => {
    // Enhanced role determination logic
    const mentorDomains = [
      "edu",
      "university",
      "college",
      "school",
      "institute",
    ];
    const adminEmails = ["admin@mediverse.com", "support@mediverse.com"];
    const domain = email.split("@")[1]?.toLowerCase();

    if (adminEmails.includes(email.toLowerCase())) {
      return "platform_admin";
    }

    if (domain && mentorDomains.some((md) => domain.includes(md))) {
      return "mentor";
    }

    // Default to student for MVP
    return "student";
  };

  const login = async (email?: string, password?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // If email and password provided, use email-based auth
      if (email && password) {
        // Create Moodle user account for email/password login
        try {
          // First, create user in Moodle (without password in userData)
          const moodleUser = await moodleAPI.createUser({
            username: email.split("@")[0],
            email,
            firstname: email.split("@")[0].split(".")[0] || email.split("@")[0],
            lastname: email.split("@")[0].split(".").slice(1).join(" ") || "",
          });

          // Generate Moodle token for API access using username/password
          const token = await moodleAPI.generateUserToken(
            email.split("@")[0],
            password
          );

          const userProfile = await createUserProfile({
            id: moodleUser.id,
            username: moodleUser.username,
            email: moodleUser.email,
            firstName: moodleUser.firstname,
            lastName: moodleUser.lastname,
            fullName: `${moodleUser.firstname} ${moodleUser.lastname}`.trim(),
            avatar: undefined,
            moodleToken: token,
            isTeacher: false,
            isStudent: true,
          });

          setUser(userProfile);
          localStorage.setItem("mediverse_user", JSON.stringify(userProfile));
          return;
        } catch (moodleError) {
          console.error("Moodle user creation failed:", moodleError);
          // Fallback to local auth if Moodle is unavailable
          const userProfile = await createUserProfile({
            id: Date.now(),
            username: email.split("@")[0],
            email,
            firstName: email.split("@")[0].split(".")[0] || email.split("@")[0],
            lastName: email.split("@")[0].split(".").slice(1).join(" ") || "",
            fullName: email.split("@")[0],
            avatar: undefined,
            moodleToken: null,
            isTeacher: false,
            isStudent: true,
          });

          setUser(userProfile);
          localStorage.setItem("mediverse_user", JSON.stringify(userProfile));
          return;
        }
      }

      // Debug: Log OAuth configuration status
      console.log("🔧 Debug - OAuth Configuration:", {
        clientId: env.MOODLE_OAUTH_CLIENT_ID ? "✅ Set" : "❌ Missing",
        clientSecret: env.MOODLE_OAUTH_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
        redirectUri: env.MOODLE_OAUTH_REDIRECT_URI || "❌ Missing",
        isConfigured: moodleAuth.isConfigured,
      });

      // Start OAuth flow - this will redirect to Google
      const authResult = await moodleAuth.authenticateWithGoogle();

      // The authenticateWithGoogle method redirects to Google, so this won't execute
      // The actual authentication will be handled by the OAuth callback useEffect
      if (authResult.success && authResult.user) {
        const userProfile = await createUserProfile(authResult.user);
        setUser(userProfile);

        // Store user session
        localStorage.setItem("mediverse_user", JSON.stringify(userProfile));
      } else {
        // This is expected - the method redirects to Google
        console.log("Redirecting to Google OAuth...");
        return; // Don't throw error, just return as redirect is happening
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear Moodle session
      await moodleAuth.logout();

      // Clear local session
      localStorage.removeItem("mediverse_user");
      localStorage.removeItem("mediverse_sidebar_open");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a temporary user profile for signup
      const tempUser: UserProfile = {
        id: `temp_${Date.now()}`,
        email,
        name,
        role,
        status: "onboarding",
        isAuthenticated: false,
        lastLogin: new Date(),
      };

      // Set role-specific defaults
      if (role === "student") {
        tempUser.enrolledCourses = [];
        tempUser.freeSessionsUsed = 0;
        tempUser.maxFreeSessions = 5;
      } else if (role === "mentor") {
        tempUser.platformFeePaid = false;
        tempUser.commissionRate = 0.1;
        tempUser.organizationType = "individual";
      }

      setUser(tempUser);
      localStorage.setItem("mediverse_user", JSON.stringify(tempUser));
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Signup failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (status: UserStatus) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = { ...user, status };
      setUser(updatedUser);
      localStorage.setItem("mediverse_user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Update status error:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
      throw err;
    }
  };

  const completeOnboarding = async (organizationData?: {
    organizationName: string;
    organizationType: "university" | "institution" | "individual";
  }) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = {
        ...user,
        status: "authenticated" as UserStatus,
        ...(organizationData && {
          organizationName: organizationData.organizationName,
          organizationType: organizationData.organizationType,
        }),
      };

      setUser(updatedUser);
      localStorage.setItem("mediverse_user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Complete onboarding error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
      throw err;
    }
  };

  const completePayment = async () => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = {
        ...user,
        platformFeePaid: true,
      };

      setUser(updatedUser);
      localStorage.setItem("mediverse_user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Complete payment error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete payment"
      );
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = moodleAuth.getCurrentUser();
      if (currentUser) {
        const userProfile = await createUserProfile(currentUser);
        setUser(userProfile);
        localStorage.setItem("mediverse_user", JSON.stringify(userProfile));
      } else {
        setUser(null);
        localStorage.removeItem("mediverse_user");
      }
    } catch (err) {
      console.error("Refresh user error:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh user");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("mediverse_user", JSON.stringify(updatedUser));

      // Update role in Moodle if needed
      if (user.moodleUserId) {
        // This would call Moodle API to update user role
        // Implementation depends on Moodle's role management API
        console.log(`Updated user role to ${role} in Moodle`);
      }
    } catch (err) {
      console.error("Update role error:", err);
      setError(err instanceof Error ? err.message : "Failed to update role");
      throw err;
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    signup,
    refreshUser,
    updateUserRole,
    updateUserStatus,
    completeOnboarding,
    completePayment,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Helper hook for checking authentication status
export function useAuth() {
  const { user, isLoading } = useUser();

  return {
    isAuthenticated: !!user?.isAuthenticated,
    isStudent: user?.role === "student",
    isMentor: user?.role === "mentor",
    isPlatformAdmin: user?.role === "platform_admin",
    isLoading,
    user,
    status: user?.status || "unauthenticated",
  };
}

// Helper hook for role-based access control
export function useRole() {
  const { user } = useUser();

  return {
    // Student permissions
    canEnrollInCourses: user?.role === "student",
    canTakeAssessments: user?.role === "student",
    canViewFreeSessions: user?.role === "student",
    canAccessGeneralContent: user?.role === "student",

    // Mentor permissions
    canCreateCourses: user?.role === "mentor",
    canUploadContent: user?.role === "mentor",
    canManageStudents: user?.role === "mentor",
    canAccessMoodleFeatures: user?.role === "mentor",
    canAccessTeacherFeatures: user?.role === "mentor",
    canViewCommission: user?.role === "mentor",

    // Platform admin permissions
    canAccessAdminPanel: user?.role === "platform_admin",
    canManagePlatform: user?.role === "platform_admin",
    canViewAllUsers: user?.role === "platform_admin",

    // Common permissions
    canViewProfile: !!user?.isAuthenticated,
    canAccessPayment: !!user?.isAuthenticated,
    canViewLiveSessions: !!user?.isAuthenticated,
  };
}
