import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopicCard, defaultAnatomyTopics } from "@/components/TopicCard";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { AIInteractivePanel } from "@/components/AIInteractivePanel";
import { useAuth } from "@/contexts/AuthContext";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { useToast } from "@/components/ui/use-toast";
import type { IUnityViewerHandle } from "@/types/unity";
import {
  getCuratedVideos,
  getFeaturedVideos,
} from "@/lib/youtube/curated-videos";
import type { YouTubeVideo } from "@/lib/youtube/youtube-api";
import {
  Brain,
  Users,
  Play,
  LogIn,
  User,
  BookOpen,
  TrendingUp,
  Video,
  Menu,
  Home,
  Search,
  Settings,
  Bell,
  Grid3X3,
  UserCheck,
  Zap,
  LogOut,
  GraduationCap,
  Plus,
} from "lucide-react";

// Import reusable components
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SessionCard } from "@/components/ui/SessionCard";
import { VideoCard } from "@/components/ui/VideoCard";
import { MentorCard } from "@/components/ui/MentorCard";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Types
interface LiveSession {
  id: string;
  title: string;
  code: string;
  teacherId: string;
  studentCount: number;
  createdAt: string;
}

interface LiveMentor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  status: "online" | "busy" | "away";
  currentStudents: number;
  maxStudents: number;
  rating: number;
  sessionTitle?: string;
}

// Header Component
function Header({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  user,
  isAuthenticated,
  signInAsGuest,
  signInWithGoogle,
  signOut,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: { id: string; name: string; email: string; isGuest: boolean } | null;
  isAuthenticated: boolean;
  signInAsGuest: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              MediVerse
            </h1>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anatomy topics, videos, sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right: Auth and Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name}</span>
                {user?.isGuest && (
                  <Badge variant="secondary" className="text-xs">
                    Guest
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={signInAsGuest}>
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Guest</span>
              </Button>
              <Button size="sm" onClick={signInWithGoogle}>
                <LogIn className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Sidebar Component
function Sidebar({
  sidebarOpen,
  selectedCategory,
  setSelectedCategory,
  liveSessions,
  handleJoinSession,
  setSessionCode,
  navigate,
  isAuthenticated,
  signOut,
}: {
  sidebarOpen: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  liveSessions: LiveSession[];
  handleJoinSession: () => void;
  setSessionCode: (code: string) => void;
  navigate: (path: string) => void;
  isAuthenticated: boolean;
  signOut: () => void;
}) {
  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-background border-r min-h-screen sticky top-16">
      <div className="p-4 space-y-6">
        {/* Navigation */}
        <div className="space-y-2">
          <Button
            variant={selectedCategory === "all" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedCategory("all")}
          >
            <Home className="h-4 w-4 mr-3" />
            Home
          </Button>
          <Button
            variant={selectedCategory === "live" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedCategory("live")}
          >
            <Users className="h-4 w-4 mr-3" />
            Live Sessions
          </Button>
          <Button
            variant={selectedCategory === "videos" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedCategory("videos")}
          >
            <Play className="h-4 w-4 mr-3" />
            Videos
          </Button>
          <Button
            variant={selectedCategory === "mentors" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedCategory("mentors")}
          >
            <UserCheck className="h-4 w-4 mr-3" />
            Live Mentors
          </Button>
          <Button
            variant={selectedCategory === "teach" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedCategory("teach")}
          >
            <GraduationCap className="h-4 w-4 mr-3" />
            Teach Mode
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Quick Actions
          </h3>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/learn")}
          >
            <BookOpen className="h-4 w-4 mr-3" />
            3D Learning
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/unified")}
          >
            <Grid3X3 className="h-4 w-4 mr-3" />
            Unified Learning
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          )}
        </div>

        {/* Live Sessions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Live Sessions
          </h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {liveSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSessionCode(session.code);
                    handleJoinSession();
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-xs line-clamp-2">
                      {session.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {session.code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{session.studentCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
}

// Live Mentors Component
function LiveMentors({ liveMentors }: { liveMentors: LiveMentor[] }) {
  return (
    <div className="mb-8">
      <SectionHeader
        title="Live Mentors Online"
        icon={Zap}
        iconColor="text-green-500"
        badge={{
          text: `${
            liveMentors.filter((m) => m.status === "online").length
          } Available`,
          variant: "secondary",
        }}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {liveMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            id={mentor.id}
            name={mentor.name}
            avatar={mentor.avatar}
            specialty={mentor.specialty}
            status={mentor.status}
            currentStudents={mentor.currentStudents}
            maxStudents={mentor.maxStudents}
            sessionTitle={mentor.sessionTitle}
          />
        ))}
      </div>
    </div>
  );
}

// 3D Viewer Component
function Viewer3D({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          3D Anatomy Viewer
        </h2>
      </div>

      <Card className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 border-dashed">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Brain className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Interactive 3D Anatomy</h3>
              <p className="text-muted-foreground">
                Explore human anatomy with immersive 3D models
              </p>
            </div>
            <Button onClick={() => navigate("/learn")}>
              <Play className="h-4 w-4 mr-2" />
              Launch 3D Viewer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Teacher Mode Component
function TeacherMode({ navigate }: { navigate: (path: string) => void }) {
  const [recentTopics, setRecentTopics] = useState([
    {
      id: "1",
      title: "Cardiovascular System Deep Dive",
      mentor: "Dr. Sarah Chen",
      completedAt: "Yesterday",
      duration: "45 min",
      studentsAttended: 12,
      topic: "cardiovascular",
    },
    {
      id: "2",
      title: "Nervous System Structure Analysis",
      mentor: "Prof. Michael Rodriguez",
      completedAt: "2 days ago",
      duration: "60 min",
      studentsAttended: 8,
      topic: "nervous",
    },
    {
      id: "3",
      title: "Muscular System Overview",
      mentor: "Dr. Emily Watson",
      completedAt: "3 days ago",
      duration: "40 min",
      studentsAttended: 15,
      topic: "muscular",
    },
  ]);

  const handleCreateSession = (topic: {
    id: string;
    title: string;
    mentor: string;
    completedAt: string;
    duration: string;
    studentsAttended: number;
    topic: string;
  }) => {
    // Navigate to Google Classroom with pre-filled topic
    navigate(
      `/teach/google-classroom?topic=${topic.topic}&title=${encodeURIComponent(
        topic.title
      )}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-500" />
          Teacher Mode
        </h2>
        <Badge variant="secondary">Create Sessions</Badge>
      </div>

      {/* Recent Topics from Mentors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Recent Mentor Topics</h3>
          <Badge variant="outline">Last 3 Days</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {topic.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {topic.completedAt}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{topic.mentor}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{topic.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span>{topic.studentsAttended}</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-3"
                  onClick={() => handleCreateSession(topic)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/teach/google-classroom")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              Google Classroom Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Connect your Google Classroom and create custom anatomy sessions
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Create custom sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Manage student groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Share 3D anatomy content</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/teach/google-classroom")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Group Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Organize collaborative anatomy study sessions through Google
              Classroom
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Create study groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Assign anatomy topics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Track student progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">
              Build on Recent Learning
            </h4>
            <p className="text-sm text-blue-700">
              Create sessions based on topics your mentors have recently
              covered. This helps reinforce learning and provides continuity for
              your students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function Index() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { toast } = useToast();

  // Auth state
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const signInAsGuest = authContext?.signInAsGuest || (() => {});
  const signInWithGoogle =
    authContext?.signInWithGoogle || (() => Promise.resolve());
  const signOut = authContext?.signOut || (() => {});

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const unityRef = useRef<IUnityViewerHandle>(null);

  // Data state
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [liveMentors, setLiveMentors] = useState<LiveMentor[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<YouTubeVideo[]>([]);
  const [sessionCode, setSessionCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Initialize data
  useEffect(() => {
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeApp = async () => {
    try {
      await getCuratedVideos();
      const videos = getFeaturedVideos();
      setFeaturedVideos(videos);
      loadLiveSessions();
      loadLiveMentors();
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  };

  const handleVoiceCommand = async (command: {
    action: string;
    target: string;
  }) => {
    console.log("[Index] Voice command received:", command);

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

  const loadLiveSessions = async () => {
    try {
      const response = await fetch("/api/sessions/active");
      if (response.ok) {
        const sessions = await response.json();
        setLiveSessions(
          sessions.map(
            (session: {
              id: string;
              title: string;
              code: string;
              teacherId: string;
              createdAt: string;
            }) => ({
              id: session.id,
              title: session.title,
              code: session.code,
              teacherId: session.teacherId,
              studentCount: Math.floor(Math.random() * 20) + 1,
              createdAt: session.createdAt,
            })
          )
        );
      } else {
        // Fallback mock data
        setLiveSessions([
          {
            id: "session-1",
            title: "Cardiovascular System Review",
            code: "4CSX41",
            teacherId: "teacher-1",
            studentCount: 12,
            createdAt: new Date().toISOString(),
          },
          {
            id: "session-2",
            title: "Skeletal Anatomy Basics",
            code: "5AI4KG",
            teacherId: "teacher-2",
            studentCount: 8,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load live sessions:", error);
    }
  };

  const loadLiveMentors = async () => {
    // Mock data for live mentors
    const mockMentors: LiveMentor[] = [
      {
        id: "mentor-1",
        name: "Dr. Sarah Chen",
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        specialty: "Cardiovascular System",
        status: "online",
        currentStudents: 8,
        maxStudents: 15,
        rating: 4.9,
        sessionTitle: "Heart Anatomy Deep Dive",
      },
      {
        id: "mentor-2",
        name: "Prof. Michael Rodriguez",
        avatar:
          "https://images.unsplash.com/photo-1612349317153-e413531c2a55?w=100&h=100&fit=crop&crop=face",
        specialty: "Nervous System",
        status: "busy",
        currentStudents: 12,
        maxStudents: 12,
        rating: 4.8,
        sessionTitle: "Brain Structure Analysis",
      },
    ];
    setLiveMentors(mockMentors);
  };

  const handleJoinSession = async () => {
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
      const studentId = user?.id || `guest-${Date.now()}`;
      const result = await anatomyAPI.joinSession(sessionCode, studentId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to join session");
      }

      navigate(`/learn?session=${result.data.id}`);
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

  const handleStartLearning = (topicId: string) => {
    const topic = defaultAnatomyTopics.find((t) => t.id === topicId);
    if (topic) {
      navigate(`/learn/${topic.system.toLowerCase()}`);
    }
  };

  // Render content based on selected category
  const renderContent = () => {
    switch (selectedCategory) {
      case "live":
        return (
          <div className="space-y-6">
            <SectionHeader title="Live Sessions" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title}
                  code={session.code}
                  studentCount={session.studentCount}
                  isLive={true}
                />
              ))}
            </div>
          </div>
        );
      case "videos":
        return (
          <div className="space-y-6">
            <SectionHeader title="Featured Videos" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredVideos.slice(0, 8).map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/watch?v=${video.id}`,
                      "_blank"
                    )
                  }
                />
              ))}
            </div>
          </div>
        );
      case "teach":
        return <TeacherMode navigate={navigate} />;
      case "mentors":
        return <LiveMentors liveMentors={liveMentors} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        isAuthenticated={isAuthenticated}
        signInAsGuest={signInAsGuest}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
      />

      <div className="flex">
        <Sidebar
          sidebarOpen={sidebarOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          liveSessions={liveSessions}
          handleJoinSession={handleJoinSession}
          setSessionCode={setSessionCode}
          navigate={navigate}
          isAuthenticated={isAuthenticated}
          signOut={signOut}
        />

        <main className="flex-1 p-6">
          {selectedCategory === "home" ? (
            <div className="space-y-8">
              {/* Hero Section - AI Interactive Learning */}
              <HeroSection
                title="AI-Powered Medical Learning"
                subtitle="Your intelligent anatomy tutor"
                description="Experience the future of medical education with our AI-powered interactive learning platform. Get personalized explanations, instant Q&A, and adaptive learning paths tailored for medical students."
                primaryAction={{
                  text: "Start AI Learning",
                  onClick: () => setSelectedCategory("learn"),
                  icon: Brain,
                }}
                secondaryAction={{
                  text: "Explore Content",
                  onClick: () => setSelectedCategory("unified"),
                  icon: BookOpen,
                }}
              />

              {/* AI Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                  title="Intelligent Q&A"
                  description="Ask complex medical questions and get detailed, accurate answers powered by medical knowledge base"
                  icon={Brain}
                  iconColor="text-blue-700"
                  borderColor="border-blue-200"
                  bgColor="bg-blue-50/50"
                  features={[
                    "Anatomy & Physiology",
                    "Pathology & Disease",
                    "Clinical Cases",
                  ]}
                />

                <FeatureCard
                  title="Adaptive Learning"
                  description="Personalized learning paths that adapt to your knowledge level and learning style"
                  icon={BookOpen}
                  iconColor="text-green-700"
                  borderColor="border-green-200"
                  bgColor="bg-green-50/50"
                  features={[
                    "Knowledge Assessment",
                    "Progress Tracking",
                    "Weakness Identification",
                  ]}
                />

                <FeatureCard
                  title="Interactive Sessions"
                  description="Join live AI-guided study sessions with other medical students worldwide"
                  icon={Users}
                  iconColor="text-purple-700"
                  borderColor="border-purple-200"
                  bgColor="bg-purple-50/50"
                  features={[
                    "Real-time Collaboration",
                    "AI Moderation",
                    "Peer Learning",
                  ]}
                />
              </div>

              {/* Quick Access to Learning Modes */}
              <div className="space-y-4">
                <SectionHeader title="Learning Modes" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureCard
                    title="AI Interactive Learning"
                    description="Engage with AI-powered anatomy exploration, instant Q&A, and personalized learning paths"
                    icon={Brain}
                    iconColor="text-blue-600"
                    borderColor="border-2 hover:border-blue-300"
                    bgColor=""
                    badge={{ text: "Most Popular", variant: "secondary" }}
                    action={{
                      text: "Start Learning →",
                      onClick: () => setSelectedCategory("learn"),
                      variant: "outline",
                    }}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  />

                  <FeatureCard
                    title="Unified Learning"
                    description="Comprehensive learning with 3D models, video tutorials, and structured courses"
                    icon={BookOpen}
                    iconColor="text-green-600"
                    borderColor="border-2 hover:border-green-300"
                    bgColor=""
                    badge={{ text: "Comprehensive", variant: "outline" }}
                    action={{
                      text: "Explore →",
                      onClick: () => setSelectedCategory("unified"),
                      variant: "outline",
                    }}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  />
                </div>
              </div>

              {/* Live Sessions Section */}
              <div className="space-y-4">
                <SectionHeader
                  title="Live Sessions"
                  badge={{
                    text: `${liveSessions.length} Active`,
                    variant: "secondary",
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveSessions.slice(0, 3).map((session) => (
                    <SessionCard
                      key={session.id}
                      id={session.id}
                      title={session.title}
                      code={session.code}
                      studentCount={session.studentCount}
                      isLive={true}
                      onJoin={() => navigate(`/learn?session=${session.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            renderContent()
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">
                MediVerse - AI-Powered Medical Learning Platform
              </p>
              <p className="text-xs mt-1">
                Empowering medical students with intelligent anatomy education
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
