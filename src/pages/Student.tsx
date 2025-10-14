import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import type { IUnityViewerHandle } from "@/types/unity";
import type { ViewerState } from "@/types/anatomy";
import { sessionSync } from "@/lib/websocket/session-sync";
import { LogOut } from "lucide-react";

export default function Student() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [studentId] = useState(() => `student-${Date.now()}`); // Generate unique student ID
  const [isJoining, setIsJoining] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const unityRef = useRef<IUnityViewerHandle>(null);

  const joinSession = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter a session code",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      // Pass both code and studentId
      const result = await anatomyAPI.joinSession(sessionCode, studentId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to join session");
      }

      const data = result.data;
      setIsSessionActive(true);

      // Connect to WebSocket for real-time sync
      sessionSync.connect(data.id, studentId, "student");

      toast({
        title: "Session joined",
        description: `Connected to ${data.title}`,
      });
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Listen for teacher's commands via WebSocket
  useEffect(() => {
    const handleViewerStateUpdate = (state: ViewerState) => {
      console.log("[Student] Received viewer state update:", state);

      // Execute command if present
      if (state.command && unityRef.current) {
        const result = unityRef.current.executeCommand(
          state.command as { action: string; target: string }
        );

        if (result.success) {
          console.log(
            "[Student] Command executed successfully:",
            state.command
          );
        } else {
          console.error("[Student] Command execution failed:", result.error);
        }
      }
    };

    // Subscribe to viewer state updates
    sessionSync.onViewerStateUpdate(handleViewerStateUpdate);

    return () => {
      sessionSync.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Student View
          </h1>
          <Button variant="outline" onClick={() => navigate("/")} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>

        {!isSessionActive ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Teaching Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Session Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={joinSession}
                className="w-full"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Session"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-[calc(100vh-8rem)]">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                <UnityAnatomyViewer
                  ref={unityRef}
                  onReady={() => {
                    console.log("[Student] Unity viewer ready");
                    toast({
                      title: "3D Viewer Ready",
                      description:
                        "Connected and ready to follow teacher's actions",
                    });
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
