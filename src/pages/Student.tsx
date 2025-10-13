import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { StudentNotepad } from "@/components/StudentNotepad";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { sessionSync } from "@/lib/websocket/session-sync";
import { LogIn, LogOut } from "lucide-react";
import { WSMessageType } from "@/types/anatomy";

export default function Student() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [session, setSession] = useState<{
    id: string;
    title: string;
    code: string;
    highlighted_part?: string;
    camera_position?: {
      x: number;
      y: number;
      z: number;
    };
    model_rotation?: {
      x: number;
      y: number;
      z: number;
    };
    visible_systems?: string[];
  } | null>(null);
  const [studentId] = useState(`student-${Date.now()}`);

  useEffect(() => {
    if (session?.id) {
      // Connect to WebSocket for real-time updates
      sessionSync.connect(session.id, studentId, "student");

      // Subscribe to viewer state changes
      const unsubscribe = sessionSync.on(
        WSMessageType.VIEWER_STATE_CHANGE,
        (viewerState) => {
          console.log("Viewer state updated:", viewerState);
          setSession((prev) => ({
            ...prev,
            highlighted_part: viewerState.highlightedPart,
            camera_position: viewerState.cameraPosition,
            model_rotation: viewerState.modelRotation,
            visible_systems: viewerState.visibleSystems,
          }));
        }
      );

      return () => {
        unsubscribe();
        sessionSync.disconnect();
      };
    }
  }, [session?.id, studentId]);

  const joinSession = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter a session code",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await anatomyAPI.joinSession(
        sessionCode.toUpperCase(),
        studentId
      );

      if (!result.success || !result.data) {
        toast({
          title: "Session not found",
          description: result.error || "Invalid or inactive session code",
          variant: "destructive",
        });
        return;
      }

      setSession(result.data);
      setIsJoined(true);

      toast({
        title: "Joined session",
        description: `Connected to: ${result.data.title}`,
      });
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    }
  };

  const leaveSession = () => {
    setIsJoined(false);
    setSession(null);
    setSessionCode("");
    toast({
      title: "Left session",
      description: "You have left the session",
    });
  };

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

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Live Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Session Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-character code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button onClick={joinSession} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Join Session
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
                      {session?.title}
                    </span>
                    <span className="text-xs sm:text-sm font-mono bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded">
                      {session?.code}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                    <UnityAnatomyViewer
                      highlightedPart={session?.highlighted_part}
                      onPartClick={(part) =>
                        console.log("Student clicked:", part)
                      }
                      onReady={() => console.log("Student Unity viewer ready")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 order-1 lg:order-2">
              <StudentNotepad sessionId={session?.id} studentId={studentId} />

              <Button
                onClick={leaveSession}
                variant="outline"
                className="w-full"
              >
                Leave Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
