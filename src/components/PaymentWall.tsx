import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/contexts/UserContext";
import { CreditCard, CheckCircle, Gift, Percent } from "lucide-react";

interface PaymentWallProps {
  onPaymentComplete?: () => void;
  onSkip?: () => void;
}

export function PaymentWall({ onPaymentComplete, onSkip }: PaymentWallProps) {
  const { user, isMentor } = useAuth();
  const { completePayment } = useUser();
  const [paymentCode, setPaymentCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      await completePayment();
      onPaymentComplete?.();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (
      paymentCode.toLowerCase() === "free" ||
      paymentCode.toLowerCase() === "mvp"
    ) {
      setIsProcessing(true);
      try {
        await completePayment();
        onPaymentComplete?.();
      } catch (error) {
        console.error("Payment failed:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isMentor) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Mentor Platform Access
            </CardTitle>
            <CardDescription>
              Complete your mentor setup to access all teaching features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Mentor Benefits:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Access to Moodle LMS features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Create and manage courses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Upload educational content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Student enrollment management
                  </li>
                </ul>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Limited Time Offer
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Fee:</span>
                    <Badge variant="secondary">FREE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commission Rate:</span>
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        10%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Platform fee is currently free. You'll earn 10% commission
                    from each student enrollment.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentCode">Have a promo code?</Label>
                <div className="flex gap-2">
                  <Input
                    id="paymentCode"
                    placeholder="Enter code (try 'free' or 'mvp')"
                    value={paymentCode}
                    onChange={(e) => setPaymentCode(e.target.value)}
                  />
                  <Button
                    onClick={handleCodeSubmit}
                    disabled={!paymentCode || isProcessing}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? "Processing..." : "Continue Free (MVP)"}
                </Button>

                {onSkip && (
                  <Button onClick={onSkip} variant="ghost" className="w-full">
                    Skip for now
                  </Button>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="text-center text-sm text-gray-600">
              <p>
                By continuing, you agree to our Terms of Service and understand
                that commission rates may change with notice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
