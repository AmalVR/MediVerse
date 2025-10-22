import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { AIInteractivePanel } from "@/components/AIInteractivePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { getVideosBySystem } from "@/lib/youtube/curated-videos";
import { defaultAnatomyTopics } from "@/components/TopicCard";
import type { ViewerState } from "@/types/anatomy";
import type { IUnityViewerHandle } from "@/types/unity";
import { sessionSync } from "@/lib/websocket/session-sync";
import { useToast } from "@/components/ui/use-toast";
import {
  Play,
  Pause,
  Users,
  LogOut,
  BookOpen,
  Video,
  Brain,
  Settings,
  Maximize,
  ArrowLeft,
  User,
  LogIn,
} from "lucide-react";

export default function UnifiedLearning() {
  const { system } = useParams<{ system: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, signInAsGuest, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"video" | "3d">("video");
  const [selectedVideo, setSelectedVideo] = useState<{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
  } | null>(null);
  const [videos, setVideos] = useState<
    {
      id: string;
      title: string;
      description: string;
      thumbnail: string;
    }[]
  >([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const unityRef = useRef<IUnityViewerHandle>(null);

  // Get current topic
  const currentTopic = defaultAnatomyTopics.find(
    (topic) => topic.system.toLowerCase() === system
  );

  const loadVideosForSystem = useCallback(async () => {
    try {
      const systemVideos = getVideosBySystem(system!.toUpperCase());
      setVideos(systemVideos);

      // Select first video by default
      if (systemVideos.length > 0) {
        setSelectedVideo(systemVideos[0]);
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
    }
  }, [system]);

  const joinSession = useCallback(
    async (sessionIdParam: string) => {
      setIsJoining(true);
      try {
        const studentId = user?.id || `guest-${Date.now()}`;
        const result = await anatomyAPI.joinSession(sessionIdParam, studentId);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to join session");
        }

        setSessionId(result.data.id);
        setSessionTitle(result.data.title);
        setIsSessionActive(true);

        // Connect to WebSocket for real-time sync
        sessionSync.connect(result.data.id, studentId, "student");

        toast({
          title: "Session joined",
          description: `Connected to ${result.data.title}`,
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
    },
    [user?.id, toast]
  );

  useEffect(() => {
    if (!system) {
      navigate("/");
      return;
    }

    // Load videos for this system
    loadVideosForSystem();

    // Check if joining a session
    const sessionParam = searchParams.get("session");
    if (sessionParam) {
      joinSession(sessionParam);
    }
  }, [system, searchParams, joinSession, loadVideosForSystem, navigate]);

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("[UnifiedLearning] Voice command received:", command);

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
      console.log("[UnifiedLearning] Received viewer state update:", state);

      // Execute command if present
      if (state.command && unityRef.current) {
        const result = unityRef.current.executeCommand(
          state.command as { action: string; target: string }
        );

        if (result.success) {
          console.log(
            "[UnifiedLearning] Command executed successfully:",
            state.command
          );
        } else {
          console.error(
            "[UnifiedLearning] Command execution failed:",
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

  const leaveSession = () => {
    sessionSync.disconnect();
    setIsSessionActive(false);
    setSessionId(null);
    setSessionTitle("");
    navigate("/");
  };

  const handleSignInPrompt = () => {
    toast({
      title: "Sign in required",
      description:
        "Please sign in to access live sessions and save your progress",
      action: (
        <div className="flex gap-2">
          <Button size="sm" onClick={signInAsGuest}>
            Continue as Guest
          </Button>
          <Button size="sm" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </div>
      ),
    });
  };

  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Topic Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested anatomy topic could not be found.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{currentTopic.name}</h1>
                {isSessionActive && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Live Session
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {sessionTitle}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSignInPrompt}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              )}
              {isAuthenticated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                  {user?.isGuest && (
                    <Badge variant="secondary" className="text-xs">
                      Guest
                    </Badge>
                  )}
                </div>
              )}
              <SettingsPanel />
              <Button variant="outline" onClick={leaveSession} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Video/Info */}
          <div className="lg:col-span-4 space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "video" | "3d")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="3d" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                {selectedVideo ? (
                  <YouTubePlayer
                    video={{
                      ...selectedVideo,
                      thumbnail: selectedVideo.thumbnail,
                      channelTitle: "",
                      publishedAt: "",
                      duration: "",
                      viewCount: "0",
                    }}
                    className="w-full"
                    onVideoEnd={() => {
                      // Auto-play next video or show completion message
                      const currentIndex = videos.findIndex(
                        (v) => v.id === selectedVideo.id
                      );
                      if (currentIndex < videos.length - 1) {
                        setSelectedVideo(videos[currentIndex + 1]);
                      }
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No videos available for this topic
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Video List */}
                {videos.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Related Videos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedVideo?.id === video.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="flex gap-3">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {video.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {video.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="3d" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {currentTopic.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {currentTopic.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Difficulty</span>
                        <Badge variant="secondary">
                          {currentTopic.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Estimated Time
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {currentTopic.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Videos Available
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {videos.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center Panel - 3D Viewer */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                <UnityAnatomyViewer
                  ref={unityRef}
                  onReady={() => {
                    console.log("[UnifiedLearning] Unity viewer ready");
                    toast({
                      title: "3D Viewer Ready",
                      description: "You can now explore anatomy models",
                    });
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <AIInteractivePanel onCommand={handleVoiceCommand} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
