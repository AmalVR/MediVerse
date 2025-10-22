import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isGuest: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInAsGuest = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: "Guest User",
      email: "",
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.setItem("mediverse_user", JSON.stringify(guestUser));
  };

  const signInWithGoogle = async () => {
    // For now, just sign in as guest
    console.log("Google sign-in not implemented yet, signing in as guest");
    signInAsGuest();
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("mediverse_user");
    localStorage.removeItem("google_access_token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signInWithGoogle,
    signOut,
    signInAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
