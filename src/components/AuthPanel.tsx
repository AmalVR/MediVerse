import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth, useUser } from "@/contexts/UserContext";
import { UserRole } from "@/contexts/UserContext";
import {
  Mail,
  User,
  GraduationCap,
  Building2,
  UserCheck,
  Chrome,
} from "lucide-react";

interface AuthPanelProps {
  onClose?: () => void;
}

export function AuthPanel({ onClose }: AuthPanelProps) {
  const { login, signup, isLoading, error } = useUser();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    name: "",
    role: "student" as UserRole,
    organizationName: "",
    organizationType: "individual" as
      | "university"
      | "institution"
      | "individual",
  });

  const handleLogin = async () => {
    try {
      if (!loginData.email || !loginData.password) {
        throw new Error("Please enter both email and password");
      }
      await login(loginData.email, loginData.password);
      onClose?.();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login(); // Call login without parameters to trigger Google OAuth
      onClose?.();
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleSignup = async () => {
    try {
      await signup(signupData.email, signupData.name, signupData.role);
      // Don't close immediately - user needs to complete onboarding
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // For Google signup, we'll use the login flow and then determine role
      await login(); // This will trigger Google OAuth
      onClose?.();
    } catch (err) {
      console.error("Google signup failed:", err);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSignupData((prev) => ({ ...prev, role }));
  };

  if (isAuthenticated) {
    return null; // Don't show auth panel if user is authenticated
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to MediVerse
          </h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Sign In
                </CardTitle>
                <CardDescription>Access your MediVerse account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {/* Google OAuth Login */}
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Chrome className="h-5 w-5 mr-2" />
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={
                    isLoading || !loginData.email || !loginData.password
                  }
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Signing in..." : "Sign In with Email"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Sign in to access:</p>
                  <ul className="mt-2 space-y-1 text-left">
                    <li>• Interactive AI learning</li>
                    <li>• Live sessions with mentors</li>
                    <li>• Course materials</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join MediVerse as a student or mentor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google OAuth Signup */}
                <Button
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Chrome className="h-5 w-5 mr-2" />
                  {isLoading ? "Creating account..." : "Sign up with Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or sign up with email
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select
                    value={signupData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="mentor">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Mentor/Organization
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {signupData.role === "mentor" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        type="text"
                        placeholder="University/Institution name"
                        value={signupData.organizationName}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            organizationName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgType">Organization Type</Label>
                      <Select
                        value={signupData.organizationType}
                        onValueChange={(value) =>
                          setSignupData((prev) => ({
                            ...prev,
                            organizationType: value as any,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="institution">
                            Educational Institution
                          </SelectItem>
                          <SelectItem value="individual">
                            Individual Mentor
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Free Platform Fee</Badge>
                        <Badge variant="outline">10% Commission</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Platform fee is currently free. You'll earn 10%
                        commission from each student enrollment.
                      </p>
                    </div>
                  </div>
                )}

                {signupData.role === "student" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">5 Free Sessions</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Get started with 5 free interactive learning sessions!
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSignup}
                  disabled={isLoading || !signupData.email || !signupData.name}
                  className="w-full"
                  size="lg"
                >
                  {isLoading
                    ? "Creating account..."
                    : "Create Account with Email"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>
                    By signing up, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
