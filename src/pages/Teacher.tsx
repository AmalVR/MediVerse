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
import { Copy, Users, LogOut, Maximize, Settings } from "lucide-react";

export default function Teacher() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const unityRef = useRef<IUnityViewerHandle>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const createSession = async () => {
    if (isCreating) return;
    if (!sessionTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a session title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const teacherId = `teacher-${Date.now()}`;

    try {
      const result = await anatomyAPI.createSession(sessionTitle, teacherId);

      console.log("[Teacher] Session creation result:", result);

      if (!result.success || !result.data) {
        console.error("Session creation failed:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to create session",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      const data = result.data;
      console.log("[Teacher] Session data:", data);

      if (!data.code || !data.id) {
        console.error("[Teacher] Invalid session data:", data);
        toast({
          title: "Error",
          description: "Session created but missing code or ID",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      // Set session data
      setSessionCode(data.code);
      setSessionId(data.id);
      setIsSessionActive(true);

      // Connect to WebSocket
      sessionSync.connect(data.id, teacherId, "teacher");

      toast({
        title: "Session created",
        description: `Share code: ${data.code}`,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast({
        title: "Copied",
        description: "Session code copied to clipboard",
      });
    }
  };

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("[Teacher] Voice command received:", command);

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

    // Sync with students
    if (sessionId) {
      try {
        const state: ViewerState = { command };
        sessionSync.updateViewerState(sessionId, state);
        await anatomyAPI.updateSessionState(sessionId, state);
      } catch (error) {
        console.error("[Teacher] Error updating session:", error);
      }
    }
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        await anatomyAPI.endSession(sessionId);
        sessionSync.disconnect();

        toast({
          title: "Session ended",
          description: "The session has been closed",
        });

        navigate("/");
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Teacher Dashboard
          </h1>
          <Button variant="outline" onClick={() => navigate("/")} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>

        {!isSessionActive ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create Teaching Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Skeletal System"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>
              <Button
                onClick={createSession}
                className="w-full"
                disabled={isCreating}
              >
                <Users className="mr-2 h-4 w-4" />
                {isCreating ? "Creating..." : "Start Session"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col h-[calc(100vh-10rem)]">
            {/* Session Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">
                  Session: {sessionTitle}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-primary text-primary-foreground px-3 py-1 rounded">
                    {sessionCode || "Loading..."}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyCode}
                    disabled={!sessionCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SettingsPanel />
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4 mr-2" />
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
              {/* Unity Viewer */}
              <div className="flex-1 lg:flex-[2] min-h-[400px]">
                <div
                  ref={viewerContainerRef}
                  className="w-full h-full bg-black/5 rounded-xl overflow-hidden"
                >
                  <UnityAnatomyViewer
                    ref={unityRef}
                    onReady={() => {
                      console.log("[Teacher] Unity viewer ready");
                      toast({
                        title: "3D Viewer Ready",
                        description:
                          "You can now use voice commands and controls",
                      });
                    }}
                  />
                </div>
              </div>

              {/* AI Interactive Panel */}
              <div className="lg:flex-1 lg:max-w-[450px] min-h-[400px] lg:min-h-0">
                <Card className="h-full flex flex-col">
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <AIInteractivePanel onCommand={handleVoiceCommand} />
                  </div>
                  <div className="p-4 border-t flex-shrink-0">
                    <Button
                      onClick={endSession}
                      variant="destructive"
                      className="w-full"
                    >
                      End Session
                    </Button>
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
