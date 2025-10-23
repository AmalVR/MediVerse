import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AIInteractivePanel } from "@/components/AIInteractivePanel";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import type { ViewerState } from "@/types/anatomy";
import type { IUnityViewerHandle } from "@/types/unity";
import { sessionSync } from "@/lib/websocket/session-sync";
import {
  Copy,
  Users,
  LogOut,
  Maximize,
  Settings,
  Plus,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  BookOpen,
  UserPlus,
  Share2,
} from "lucide-react";
import { ContentList } from "@/components/education/ContentList";
import type { EducationalContent, ContentFilters } from "@/lib/education/types";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: Date;
  content: EducationalContent[];
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // minutes
  participants: string[];
  status: "scheduled" | "active" | "completed";
}

export default function GroupStudyMode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const unityRef = useRef<IUnityViewerHandle>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Group management
  const [activeTab, setActiveTab] = useState<"classroom" | "live" | "library">(
    "classroom"
  );
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Group creation form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

  // Session creation form
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [newSessionDuration, setNewSessionDuration] = useState(60);
  const [selectedGroupId, setSelectedGroupId] = useState("");

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

  const createStudyGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGroup(true);
    try {
      const newGroup: StudyGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
        members: [`user-${Date.now()}`], // Current user
        createdAt: new Date(),
        content: [],
      };

      setStudyGroups((prev) => [newGroup, ...prev]);

      toast({
        title: "Group created",
        description: `${newGroupName} group created successfully`,
      });

      // Reset form
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupMembers([]);
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const createStudySession = async () => {
    if (!newSessionTitle.trim() || !selectedGroupId) {
      toast({
        title: "Details required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSession(true);
    try {
      const newSession: StudySession = {
        id: `session-${Date.now()}`,
        groupId: selectedGroupId,
        title: newSessionTitle,
        description: newSessionDescription,
        scheduledAt: new Date(),
        duration: newSessionDuration,
        participants: [],
        status: "scheduled",
      };

      setStudySessions((prev) => [newSession, ...prev]);

      toast({
        title: "Session scheduled",
        description: `${newSessionTitle} session created`,
      });

      // Reset form
      setNewSessionTitle("");
      setNewSessionDescription("");
      setNewSessionDuration(60);
      setSelectedGroupId("");
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

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
    console.log("[GroupStudyMode] Voice command received:", command);

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
      console.log("[GroupStudyMode] Received viewer state update:", state);

      // Execute command if present
      if (state.command && unityRef.current) {
        const result = unityRef.current.executeCommand(
          state.command as { action: string; target: string }
        );

        if (result.success) {
          console.log(
            "[GroupStudyMode] Command executed successfully:",
            state.command
          );
        } else {
          console.error(
            "[GroupStudyMode] Command execution failed:",
            result.error
          );
        }
      }
    };

    // Subscribe to viewer state updates
    sessionSync.onViewerStateUpdate(handleViewerStateUpdate);

    return () => {
      sessionSync.disconnect();
    };
  }, []);

  const handleContentSelect = (content: EducationalContent) => {
    toast({
      title: "Content selected",
      description: `Selected: ${content.title}`,
    });
    // TODO: Implement content playback/display
  };

  const handleContentFilter = (filters: ContentFilters) => {
    // TODO: Implement content filtering
    console.log("Filtering content:", filters);
  };

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
            Group Study Mode
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/learn")}
              size="sm"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Learn Mode
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teach")}
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Teach Mode
            </Button>
            <Button variant="outline" onClick={leaveSession} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "moodle" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("moodle")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Moodle LMS
          </Button>
          <Button
            variant={activeTab === "live" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("live")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Live Study
          </Button>
          <Button
            variant={activeTab === "library" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("library")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Shared Library
          </Button>
        </div>

        {/* Moodle LMS Tab */}
        {activeTab === "moodle" && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">
                Moodle LMS Integration
              </h3>
              <p className="text-muted-foreground mb-4">
                Manage group study sessions through Moodle LMS
              </p>
              <Button onClick={() => navigate("/group-study")}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Study Groups
              </Button>
            </div>
          </div>
        )}

        {/* Live Study Tab */}
        {activeTab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Join Session */}
            <Card className="max-w-md mx-auto lg:mx-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
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

            {/* Live Session View */}
            {isSessionActive && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{sessionTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-black/5 rounded-xl overflow-hidden">
                    <UnityAnatomyViewer
                      ref={unityRef}
                      onReady={() => {
                        console.log("[GroupStudyMode] Unity viewer ready");
                        toast({
                          title: "3D Viewer Ready",
                          description: "Connected to group study session",
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Shared Library Tab */}
        {activeTab === "library" && (
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Shared Content Library</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentList
                  contents={contents}
                  onSelect={handleContentSelect}
                  onFilter={handleContentFilter}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
