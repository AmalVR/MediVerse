import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { moodleAuth, AuthUser } from "@/lib/moodle/auth";
import { env } from "@/lib/env";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: "teacher" | "student";
  isAuthenticated: boolean;
  moodleUserId?: number;
  moodleToken?: string;
  lastLogin?: Date;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: "teacher" | "student") => Promise<void>;
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
    authUser: AuthUser
  ): Promise<UserProfile> => {
    // Determine user role based on email domain or other criteria
    const role = determineUserRole(authUser.email);

    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      picture: authUser.picture,
      role,
      isAuthenticated: true,
      moodleUserId: authUser.moodleUserId,
      moodleToken: authUser.moodleToken,
      lastLogin: new Date(),
    };
  };

  const determineUserRole = (email: string): "teacher" | "student" => {
    // Simple role determination logic - can be enhanced
    // For now, assume teachers have specific email patterns or domains
    const teacherDomains = ["edu", "university", "college", "school"];
    const domain = email.split("@")[1]?.toLowerCase();

    if (domain && teacherDomains.some((td) => domain.includes(td))) {
      return "teacher";
    }

    // Default to student for MVP
    return "student";
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Debug: Log OAuth configuration status
      console.log("🔧 Debug - OAuth Configuration:", {
        clientId: env.MOODLE_OAUTH_CLIENT_ID ? "✅ Set" : "❌ Missing",
        clientSecret: env.MOODLE_OAUTH_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
        redirectUri: env.MOODLE_OAUTH_REDIRECT_URI || "❌ Missing",
        isConfigured: moodleAuth.isConfigured,
      });

      // Start OAuth flow
      const authResult = await moodleAuth.authenticateWithGoogle();

      if (authResult.success && authResult.user) {
        const userProfile = await createUserProfile(authResult.user);
        setUser(userProfile);

        // Store user session
        localStorage.setItem("mediverse_user", JSON.stringify(userProfile));
      } else {
        throw new Error(authResult.error || "Authentication failed");
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
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
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

  const updateUserRole = async (role: "teacher" | "student") => {
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
    refreshUser,
    updateUserRole,
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
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    isLoading,
    user,
  };
}

// Helper hook for role-based access control
export function useRole() {
  const { user } = useUser();

  return {
    canCreateCourses: user?.role === "teacher",
    canUploadContent: user?.role === "teacher",
    canManageStudents: user?.role === "teacher",
    canAccessTeacherFeatures: user?.role === "teacher",
    canEnrollInCourses: user?.role === "student",
    canTakeAssessments: user?.role === "student",
  };
}
