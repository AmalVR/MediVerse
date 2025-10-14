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
import { sessionSync } from "@/lib/websocket/session-sync";
import { Copy, Users, LogOut, Maximize, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Teacher() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  // Unity handles part highlighting internally
  const unityRef = useRef<{
    executeCommand: (command: { action: string; target: string }) => void;
  }>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
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

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createSession = async () => {
    if (!sessionTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a session title",
        variant: "destructive",
      });
      return;
    }

    const teacherId = `teacher-${Date.now()}`; // In production, use real auth

    try {
      const result = await anatomyAPI.createSession(sessionTitle, teacherId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create session");
      }

      const data = result.data;
      setSessionCode(data.code);
      setSessionId(data.id);
      setIsSessionActive(true);

      // Connect to WebSocket for real-time sync
      sessionSync.connect(data.id, teacherId, "teacher");

      toast({
        title: "Session created",
        description: `Share code: ${data.code}`,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    toast({
      title: "Copied",
      description: "Session code copied to clipboard",
    });
  };

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("Voice command:", command);

    // Forward command to Unity
    unityRef.current?.executeCommand(command);

    // Update session via WebSocket and API for students to see
    if (sessionId) {
      try {
        // Broadcast via WebSocket for real-time updates
        const state: ViewerState = { command };
        sessionSync.updateViewerState(sessionId, state);

        // Also persist to database
        await anatomyAPI.updateSessionState(sessionId, state);
      } catch (error) {
        console.error("Error updating session:", error);
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
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Teacher Dashboard
          </h1>
          <Button variant="outline" onClick={() => navigate("/")} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
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
              <Button onClick={createSession} className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">
                  Session: {sessionTitle}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-primary text-primary-foreground px-3 py-1 rounded">
                    {sessionCode}
                  </span>
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowControls(!showControls)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Controls
                  </Button>
                  <SettingsPanel />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4 min-h-0">
              {/* Viewer */}
              <div
                ref={viewerContainerRef}
                className="relative bg-black/5 rounded-xl overflow-hidden"
              >
                <UnityAnatomyViewer
                  onReady={() => console.log("Unity viewer ready")}
                />
              </div>

              {/* Side Panel */}
              <div
                className={cn(
                  "flex flex-col min-h-0 transition-transform duration-300 lg:translate-x-0",
                  showControls ? "translate-x-0" : "translate-x-full"
                )}
              >
                {/* AI Interactive Panel */}
                <div className="flex-1 min-h-0">
                  <AIInteractivePanel onCommand={handleVoiceCommand} />
                </div>

                {/* End Session Button */}
                <div className="mt-4">
                  <Button
                    onClick={endSession}
                    variant="destructive"
                    className="w-full"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
