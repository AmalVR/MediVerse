import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AIInteractivePanel } from "@/components/AIInteractivePanel";
import { useToast } from "@/components/ui/use-toast";
import type { IUnityViewerHandle } from "@/types/unity";
import {
  getCuratedVideos,
  getVideosBySystem,
} from "@/lib/youtube/curated-videos";
import { LogOut, BookOpen, Play, Users, GraduationCap } from "lucide-react";

export default function LearnMode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const unityRef = useRef<IUnityViewerHandle>(null);
  const [relatedVideos, setRelatedVideos] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      thumbnail: string;
      viewCount: string;
    }>
  >([]);

  const loadRelatedVideos = async () => {
    try {
      const videos = await getCuratedVideos();
      // Take first 8 videos for the sidebar
      setRelatedVideos(
        videos.slice(0, 8).map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          viewCount: video.viewCount,
        }))
      );
    } catch (error) {
      console.error("Failed to load related videos:", error);
      // Fallback to empty array
      setRelatedVideos([]);
    }
  };

  // Load videos when component mounts
  useEffect(() => {
    loadRelatedVideos();
  }, []);

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
    const handleViewerStateUpdate = (state: {
      command?: { action: string; target: string };
    }) => {
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

    // Note: Session sync functionality removed for simplified AI-focused learning
    // The AI Interactive Panel now handles all learning interactions

    return () => {
      // Cleanup if needed
    };
  }, []);

  const leaveSession = () => {
    setIsSessionActive(false);
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
          <div className="space-y-6">
            {/* Moodle Integration Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Join Your Moodle Course
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Your teacher has set up anatomy learning sessions through
                    Moodle. Join your course to access live sessions, group
                    studies, and interactive 3D anatomy content.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/learn")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsSessionActive(true)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Self-Learning Mode
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Self-Learning Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Self-Learning Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore anatomy models independently with AI assistance and
                  curated video content
                </p>
                <Button
                  onClick={() => setIsSessionActive(true)}
                  className="w-full"
                  variant="secondary"
                >
                  Start Independent Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Header */}
            {sessionTitle && (
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{sessionTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SettingsPanel />
                </div>
              </div>
            )}

            {/* Main Content Area - Fixed Height Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
              {/* Unity Viewer - Fixed Height */}
              <div className="lg:col-span-2">
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

              {/* Right Sidebar - Fixed Height with Scroll */}
              <div className="space-y-4 h-full overflow-hidden">
                {/* AI Interactive Panel - Fixed Height */}
                <Card className="h-[50%] flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Interactive AI</CardTitle>
                  </CardHeader>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <AIInteractivePanel onCommand={handleVoiceCommand} />
                  </div>
                </Card>

                {/* Related Videos - Scrollable */}
                <Card className="h-[50%] flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Related Videos</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 overflow-hidden p-2">
                    <div className="h-full overflow-y-auto space-y-2">
                      {relatedVideos.length > 0 ? (
                        relatedVideos.map((video) => (
                          <div
                            key={video.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => {
                              // Navigate to video or open in new tab
                              window.open(
                                `https://www.youtube.com/watch?v=${video.id}`,
                                "_blank"
                              );
                            }}
                            title={`Watch: ${video.title}`}
                          >
                            <div className="w-16 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                              {video.thumbnail ? (
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium line-clamp-2">
                                {video.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {video.description}
                              </p>
                              {video.viewCount !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {parseInt(video.viewCount).toLocaleString()}{" "}
                                  views
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Loading videos...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
