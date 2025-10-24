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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Building2, CheckCircle, ArrowRight } from "lucide-react";

interface OnboardingPanelProps {
  onComplete?: () => void;
}

export function OnboardingPanel({ onComplete }: OnboardingPanelProps) {
  const { user, completeOnboarding, isLoading } = useUser();
  const [organizationData, setOrganizationData] = useState({
    organizationName: "",
    organizationType: "individual" as
      | "university"
      | "institution"
      | "individual",
  });

  const handleCompleteOnboarding = async () => {
    try {
      if (user?.role === "mentor") {
        await completeOnboarding(organizationData);
      } else {
        await completeOnboarding();
      }
      onComplete?.();
    } catch (err) {
      console.error("Onboarding failed:", err);
    }
  };

  if (!user || user.status !== "onboarding") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              {user.role === "student"
                ? "Welcome to MediVerse! Let's get you started."
                : "Set up your mentor profile to start teaching."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.role === "student" && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    What you get as a student:
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1 text-left">
                    <li>• 5 free interactive learning sessions</li>
                    <li>• Access to live mentor sessions</li>
                    <li>• General anatomy materials</li>
                    <li>• Progress tracking</li>
                    <li>• AI-powered learning assistance</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Setting up..." : "Start Learning"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {user.role === "mentor" && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Mentor Benefits:
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Access to Moodle LMS features</li>
                    <li>• Create and manage courses</li>
                    <li>• Upload educational content</li>
                    <li>• Earn commission from enrollments</li>
                    <li>• Free platform access (limited time)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Your university or institution name"
                      value={organizationData.organizationName}
                      onChange={(e) =>
                        setOrganizationData((prev) => ({
                          ...prev,
                          organizationName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgType">Organization Type</Label>
                    <Select
                      value={organizationData.organizationType}
                      onValueChange={(value) =>
                        setOrganizationData((prev) => ({
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

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Free Platform Fee</Badge>
                      <Badge variant="outline">10% Commission</Badge>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Platform fee is currently free. You'll earn 10% commission
                      from each student enrollment.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading || !organizationData.organizationName}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              <p>You can update these settings later in your profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
