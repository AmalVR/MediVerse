import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AIInteractivePanel } from "@/components/AIInteractivePanel";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import type { ViewerState } from "@/types/anatomy";
import type { IUnityViewerHandle } from "@/types/unity";
import { sessionSync } from "@/lib/websocket/session-sync";
import { LogOut, BookOpen, Play, Users } from "lucide-react";

export default function LearnMode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const unityRef = useRef<IUnityViewerHandle>(null);
  const [isJoining, setIsJoining] = useState(false);

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
    const studentId = `student-${Date.now()}`;

    try {
      const result = await anatomyAPI.joinSession(sessionCode, studentId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to join session");
      }

      const data = result.data;
      setSessionId(data.id);
      setSessionTitle(data.title);
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

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("[LearnMode] Voice command received:", command);

    if (!unityRef.current) {
      toast({
        title: "Unity not ready",
        description: "The 3D viewer is still loading. Please wait.",
        variant: "destructive",
      });
      return;
    }

    const result = unityRef.current.executeCommand(
      command as { action: string; target: string }
    );

    if (!result.success) {
      toast({
        title: "Command failed",
        description: result.error || "Failed to execute command",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Command executed",
      description: `${command.action} ${command.target}`,
    });
  };

  // Listen for teacher's commands via WebSocket
  useEffect(() => {
    const handleViewerStateUpdate = (state: ViewerState) => {
      console.log("[LearnMode] Received viewer state update:", state);

      // Execute command if present
      if (state.command && unityRef.current) {
        const result = unityRef.current.executeCommand(
          state.command as { action: string; target: string }
        );

        if (result.success) {
          console.log(
            "[LearnMode] Command executed successfully:",
            state.command
          );
        } else {
          console.error("[LearnMode] Command execution failed:", result.error);
        }
      }
    };

    // Subscribe to viewer state updates
    sessionSync.onViewerStateUpdate(handleViewerStateUpdate);

    return () => {
      sessionSync.disconnect();
    };
  }, []);

  const leaveSession = () => {
    sessionSync.disconnect();
    setIsSessionActive(false);
    setSessionId("");
    setSessionTitle("");
    setSessionCode("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Learn Mode
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/teach")}
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Teach Mode
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/group-study")}
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Group Study
            </Button>
            <Button variant="outline" onClick={leaveSession} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>

        {!isSessionActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Join Session */}
            <Card className="max-w-md mx-auto lg:mx-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Join Live Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Session Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={sessionCode}
                    onChange={(e) =>
                      setSessionCode(e.target.value.toUpperCase())
                    }
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

            {/* Self-Learning */}
            <Card className="max-w-md mx-auto lg:mx-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Self-Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Explore anatomy models independently with AI assistance
                </p>
                <Button
                  onClick={() => setIsSessionActive(true)}
                  className="w-full"
                  variant="secondary"
                >
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-10rem)]">
            {/* Session Header */}
            {sessionTitle && (
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{sessionTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SettingsPanel />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
              {/* Unity Viewer */}
              <div className="flex-1 lg:flex-[2] min-h-[400px]">
                <Card className="h-full">
                  <CardContent className="h-full p-0">
                    <UnityAnatomyViewer
                      ref={unityRef}
                      onReady={() => {
                        console.log("[LearnMode] Unity viewer ready");
                        toast({
                          title: "3D Viewer Ready",
                          description: "You can now explore anatomy models",
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* AI Interactive Panel */}
              <div className="lg:flex-1 lg:max-w-[450px] min-h-[400px] lg:min-h-0">
                <Card className="h-full flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <AIInteractivePanel onCommand={handleVoiceCommand} />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
