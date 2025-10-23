import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@/contexts/UserContext";
import {
  LogIn,
  LogOut,
  User,
  GraduationCap,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { env } from "@/lib/env";

interface UnifiedLoginProps {
  className?: string;
  showUserInfo?: boolean;
  compact?: boolean;
}

export function UnifiedLogin({
  className = "",
  showUserInfo = true,
  compact = false,
}: UnifiedLoginProps) {
  const { user, isLoading, error, login, logout, refreshUser } = useUser();
  const { isAuthenticated, isTeacher, isStudent } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
      toast({
        title: "Login successful",
        description: "You are now logged in to MediVerse and Moodle.",
      });
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out from both MediVerse and Moodle.",
      });
    } catch (err) {
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshUser();
      toast({
        title: "User refreshed",
        description: "User information has been updated.",
      });
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = () => {
    if (isTeacher) return <GraduationCap className="h-4 w-4" />;
    if (isStudent) return <BookOpen className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getRoleColor = () => {
    if (isTeacher) return "bg-blue-100 text-blue-800 border-blue-200";
    if (isStudent) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="text-sm font-medium">{user?.name}</span>
              <Badge variant="outline" className={getRoleColor()}>
                {getRoleIcon()}
                <span className="ml-1">{user?.role}</span>
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut || isLoading}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || isLoading}
            size="sm"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span className="ml-2">Login</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isAuthenticated ? "User Profile" : "Login to MediVerse"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAuthenticated && user ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getRoleColor()}>
                {getRoleIcon()}
                <span className="ml-1 capitalize">{user.role}</span>
              </Badge>
              {user.moodleUserId && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Moodle Connected
                </Badge>
              )}
            </div>

            {/* Authentication Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">MediVerse:</span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Authenticated
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Moodle:</span>
                <Badge
                  variant="outline"
                  className={
                    user.moodleUserId
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {user.moodleUserId ? "Connected" : "Pending"}
                </Badge>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div className="text-sm text-muted-foreground">
                Last login: {user.lastLogin.toLocaleString()}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut || isLoading}
                className="flex-1"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Login Prompt */}
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Sign in with your Google account to access MediVerse and Moodle
                LMS
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Single Sign-On (SSO)</span>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              Sign in with Google
            </Button>

            {/* Features */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Access anatomy learning courses</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Interactive 3D anatomy models</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Unified Moodle LMS experience</span>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        {!env.MOODLE_OAUTH_CLIENT_ID && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Moodle OAuth is not configured. Please set up Google Cloud Console
              credentials.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
