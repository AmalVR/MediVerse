import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Users,
  BookOpen,
  Zap,
} from "lucide-react";

interface PaymentWallProps {
  onPaymentSuccess?: () => void;
  onTrialStart?: () => void;
  onCodeRedeem?: (code: string) => void;
  className?: string;
}

export function PaymentWall({
  onPaymentSuccess,
  onTrialStart,
  onCodeRedeem,
  className = "",
}: PaymentWallProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [trialCode, setTrialCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleFreeTrial = async () => {
    try {
      setIsProcessing(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Free Trial Started!",
        description: "You now have 7 days of full access to all features.",
      });

      onTrialStart?.();
    } catch (error) {
      toast({
        title: "Trial Start Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeRedeem = async () => {
    if (!trialCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a valid trial code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation - accept common codes
      const validCodes = [
        "ANATOMY2024",
        "MEDIVERSE",
        "TRIAL",
        "FREE",
        "STUDENT",
      ];
      const isValidCode = validCodes.includes(trialCode.toUpperCase());

      if (isValidCode) {
        toast({
          title: "Code Redeemed!",
          description: "You now have 30 days of full access to all features.",
        });

        onCodeRedeem?.(trialCode);
      } else {
        toast({
          title: "Invalid Code",
          description: "The code you entered is not valid. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Code Redemption Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDummyPayment = async () => {
    try {
      setIsProcessing(true);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Payment Successful!",
        description:
          "Welcome to MediVerse Premium! You now have full access to all features.",
      });

      onPaymentSuccess?.();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Unlock Full MediVerse Access
        </h1>
        <p className="text-lg text-muted-foreground">
          Get unlimited access to all anatomy learning features, courses, and
          assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Free Trial Option */}
        <Card className="border-2 border-green-200 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-green-500 text-white">Most Popular</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Free Trial
            </CardTitle>
            <div className="text-3xl font-bold text-green-600">$0</div>
            <p className="text-sm text-muted-foreground">7 days free</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Full course access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Interactive 3D models</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI-powered Q&A</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Progress tracking</span>
              </div>
            </div>
            <Button
              onClick={handleFreeTrial}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Gift className="h-4 w-4 mr-2" />
              )}
              Start Free Trial
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Premium
            </CardTitle>
            <div className="text-3xl font-bold text-blue-600">$29</div>
            <p className="text-sm text-muted-foreground">per month</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Everything in Free Trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited courses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced assessments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Priority support</span>
              </div>
            </div>
            <Button
              onClick={handleDummyPayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Subscribe Now
            </Button>
          </CardContent>
        </Card>

        {/* Student Plan */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Student
            </CardTitle>
            <div className="text-3xl font-bold text-purple-600">$19</div>
            <p className="text-sm text-muted-foreground">per month</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Everything in Premium</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Student discounts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Study groups</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Academic support</span>
              </div>
            </div>
            <Button
              onClick={handleDummyPayment}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              Student Access
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trial Code Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Have a Trial Code?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have a special trial code, enter it below to get extended
              access.
            </p>

            {!showCodeInput ? (
              <Button
                variant="outline"
                onClick={() => setShowCodeInput(true)}
                className="w-full"
              >
                <Gift className="h-4 w-4 mr-2" />
                Enter Trial Code
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="trial-code">Trial Code</Label>
                  <Input
                    id="trial-code"
                    value={trialCode}
                    onChange={(e) => setTrialCode(e.target.value)}
                    placeholder="Enter your trial code"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCodeRedeem}
                    disabled={isProcessing || !trialCode.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Redeem Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCodeInput(false);
                      setTrialCode("");
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>What You Get</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Learning Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Interactive 3D anatomy models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI-powered explanations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Voice-guided learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Course Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comprehensive anatomy courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Interactive quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Assignment submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Teacher-student collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="mt-6">
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This is a demo payment wall. No actual payments
          are processed. Use trial codes like "ANATOMY2024", "MEDIVERSE", or
          "TRIAL" to test the functionality.
        </AlertDescription>
      </Alert>
    </div>
  );
}
