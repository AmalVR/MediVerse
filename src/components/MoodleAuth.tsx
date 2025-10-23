/**
 * Moodle Authentication Component
 *
 * This component handles OAuth 2.0 authentication with Moodle
 * using Google Sign-In integration.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, User, GraduationCap } from "lucide-react";
import { moodleAuth, AuthUser } from "@/lib/moodle";

interface MoodleAuthProps {
  onAuthSuccess?: (user: AuthUser) => void;
  onAuthError?: (error: Error) => void;
  className?: string;
}

export const MoodleAuth: React.FC<MoodleAuthProps> = ({
  onAuthSuccess,
  onAuthError,
  className = "",
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = moodleAuth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      onAuthSuccess?.(currentUser);
    }

    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");

      if (error) {
        setError(`Authentication failed: ${error}`);
        onAuthError?.(new Error(error));
        return;
      }

      if (code) {
        setLoading(true);
        try {
          const authUser = await moodleAuth.authenticateWithCode(code);
          setUser(authUser);
          setError(null);
          onAuthSuccess?.(authUser);

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Authentication failed";
          setError(errorMessage);
          onAuthError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [onAuthSuccess, onAuthError]);

  const handleLogin = () => {
    try {
      const authUrl = moodleAuth.generateAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate login";
      setError(errorMessage);
      onAuthError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleLogout = () => {
    moodleAuth.logout();
    setUser(null);
    setError(null);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">
              Authenticating with Moodle...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Welcome, {user.firstName}!</span>
          </CardTitle>
          <CardDescription>
            You are logged in to MediVerse Anatomy Learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user.isTeacher && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Teacher
                  </span>
                )}
                {user.isStudent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Student
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Logout
            </Button>
            <Button
              onClick={() => window.open("http://localhost:8081", "_blank")}
              variant="default"
              size="sm"
              className="flex-1"
            >
              Open Moodle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LogIn className="h-5 w-5" />
          <span>Sign in to MediVerse</span>
        </CardTitle>
        <CardDescription>
          Access your anatomy learning courses and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in with Google
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our terms of service and privacy
              policy.
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              New to MediVerse? Sign in to get started with:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Interactive 3D anatomy models</li>
              <li>• Personalized learning paths</li>
              <li>• Progress tracking and assessments</li>
              <li>• Expert-led courses</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodleAuth;
