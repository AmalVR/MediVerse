import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { SystemSelector } from "@/components/SystemSelector";
import { CacheManager } from "@/components/CacheManager";
import { VoiceInput } from "@/components/VoiceInput";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { sessionSync } from "@/lib/websocket/session-sync";
import { Copy, Users, LogOut } from "lucide-react";

export default function Teacher() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState<string>();
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 2, z: 18 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [visibleSystems, setVisibleSystems] = useState<string[]>(["skeleton"]); // Default to skeleton

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

  const toggleSystem = (system: string) => {
    setVisibleSystems(
      (prev) =>
        prev.includes(system)
          ? prev.filter((s) => s !== system) // Deselect
          : [...prev, system] // Add to selection (multiple allowed)
    );
  };

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("Voice command:", command);

    // Update local state
    if (command.action === "show") {
      setHighlightedPart(command.target);
    } else if (command.action === "rotate") {
      const delta = 0.5;
      if (command.target === "left")
        setRotation((r) => ({ ...r, y: r.y + delta }));
      if (command.target === "right")
        setRotation((r) => ({ ...r, y: r.y - delta }));
      if (command.target === "up")
        setRotation((r) => ({ ...r, x: r.x + delta }));
      if (command.target === "down")
        setRotation((r) => ({ ...r, x: r.x - delta }));
    } else if (command.action === "zoom") {
      const delta = command.target === "in" ? -1 : 1;
      setCameraPos((p) => ({
        ...p,
        z: Math.max(3, Math.min(20, p.z + delta)),
      }));
    }

    // Update session via WebSocket and API for students to see
    if (sessionId) {
      try {
        const viewerState = {
          cameraPosition: cameraPos,
          modelRotation: rotation,
          highlightedPart: command.target,
          visibleSystems: [],
        };

        // Broadcast via WebSocket for real-time updates
        sessionSync.updateViewerState(sessionId, viewerState);

        // Also persist to database
        await anatomyAPI.updateSessionState(sessionId, viewerState);
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-base sm:text-lg">
                      Session: {sessionTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded">
                        {sessionCode}
                      </span>
                      <Button size="sm" variant="outline" onClick={copyCode}>
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                    <UnityAnatomyViewer
                      highlightedPart={highlightedPart}
                      onPartClick={(part) => console.log("Clicked:", part)}
                      onReady={() => console.log("Unity viewer ready")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 order-1 lg:order-2">
              <SystemSelector
                selectedSystems={visibleSystems}
                onSystemToggle={toggleSystem}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Voice Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceInput onCommand={handleVoiceCommand} />

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">
                      Example Commands:
                    </h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• "Show the skeleton"</li>
                      <li>• "Highlight the heart"</li>
                      <li>• "Rotate left"</li>
                      <li>• "Zoom in"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <CacheManager />

              <Button
                onClick={endSession}
                variant="destructive"
                className="w-full"
              >
                End Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
