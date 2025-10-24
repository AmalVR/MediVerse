import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopicCard, defaultAnatomyTopics } from "@/components/TopicCard";
import { useAuth, useRole } from "@/contexts/UserContext";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { useToast } from "@/components/ui/use-toast";
import {
  getCuratedVideos,
  getFeaturedVideos,
} from "@/lib/youtube/curated-videos";
import type { YouTubeVideo } from "@/lib/youtube/youtube-api";
import {
  Brain,
  Users,
  Play,
  User,
  BookOpen,
  TrendingUp,
  Video,
  UserCheck,
  Zap,
  GraduationCap,
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
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            onClick={() => {
              // Handle mentor join logic
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Teacher Mode Component
function TeacherMode({ navigate }: { navigate: (path: string) => void }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultAnatomyTopics.slice(0, 6).map((topic) => (
          <Card
            key={topic.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/learn/${topic.system.toLowerCase()}`)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {topic.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {topic.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{topic.system}</Badge>
                <Button size="sm" variant="outline">
                  Teach
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isStudent, isMentor } = useAuth();
  const { canViewLiveSessions, canAccessGeneralContent } = useRole();
  const { toast } = useToast();

  // UI state
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Data state
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [liveMentors, setLiveMentors] = useState<LiveMentor[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<YouTubeVideo[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load live sessions (mock data for now)
        const sessions: LiveSession[] = [
          {
            id: "1",
            title: "Cardiovascular System Deep Dive",
            code: "CARDIO001",
            teacherId: "teacher1",
            studentCount: 5,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Nervous System Basics",
            code: "NEURO001",
            teacherId: "teacher2",
            studentCount: 3,
            createdAt: new Date().toISOString(),
          },
        ];
        setLiveSessions(sessions);

        // Load featured videos
        const videos = await getFeaturedVideos();
        setFeaturedVideos(videos);

        // Mock live mentors data
        setLiveMentors([
          {
            id: "1",
            name: "Dr. Sarah Johnson",
            avatar: "/avatars/sarah.jpg",
            specialty: "Cardiovascular System",
            status: "online",
            currentStudents: 3,
            maxStudents: 10,
            rating: 4.9,
            sessionTitle: "Heart Anatomy Deep Dive",
          },
          {
            id: "2",
            name: "Prof. Michael Chen",
            avatar: "/avatars/michael.jpg",
            specialty: "Nervous System",
            status: "online",
            currentStudents: 1,
            maxStudents: 8,
            rating: 4.8,
            sessionTitle: "Brain Structure Analysis",
          },
          {
            id: "3",
            name: "Dr. Emily Rodriguez",
            avatar: "/avatars/emily.jpg",
            specialty: "Muscular System",
            status: "busy",
            currentStudents: 8,
            maxStudents: 8,
            rating: 4.7,
          },
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleJoinSession = async (sessionCode: string) => {
    try {
      navigate(`/session/${sessionCode}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    }
  };

  const handleFeatureAccess = (featureName: string, action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: `Please sign in to access ${featureName}.`,
        variant: "default",
      });
      return;
    }

    // Check role-based access
    if (featureName === "Teach Mode" && !isMentor) {
      toast({
        title: "Access Restricted",
        description: "This feature is only available for mentors and teachers.",
        variant: "destructive",
      });
      return;
    }

    action();
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
      case "mentors":
        return <LiveMentors liveMentors={liveMentors} />;
      case "teach":
        return <TeacherMode navigate={navigate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {selectedCategory === "all" ? (
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
                text: "Explore Courses",
                onClick: () => setSelectedCategory("unified"),
                icon: BookOpen,
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            />

            {/* Learning Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="AI Interactive Learning"
                description="Personalized AI tutor with instant Q&A, adaptive learning paths, and intelligent explanations"
                icon={Brain}
                iconColor="text-purple-500"
                bgColor=""
                badge={{ text: "Most Popular", variant: "secondary" }}
                action={{
                  text: "Start Learning →",
                  onClick: () =>
                    handleFeatureAccess("AI Interactive Learning", () =>
                      setSelectedCategory("learn")
                    ),
                  variant: "outline",
                }}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
              />

              <FeatureCard
                title="Unified Learning"
                description="Comprehensive learning with 3D models, video tutorials, and structured courses"
                icon={BookOpen}
                iconColor="text-blue-500"
                bgColor=""
                badge={{ text: "Comprehensive", variant: "outline" }}
                action={{
                  text: "Explore →",
                  onClick: () =>
                    handleFeatureAccess("Unified Learning", () =>
                      setSelectedCategory("unified")
                    ),
                  variant: "outline",
                }}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
              />
            </div>

            {/* Live Sessions Section */}
            {canViewLiveSessions && (
              <div className="space-y-6">
                <SectionHeader
                  title="Live Sessions"
                  icon={Users}
                  iconColor="text-green-500"
                  badge={{
                    text: `${liveSessions.length} Active`,
                    variant: "secondary",
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveSessions.slice(0, 4).map((session) => (
                    <SessionCard
                      key={session.id}
                      id={session.id}
                      title={session.title}
                      code={session.code}
                      studentCount={session.studentCount}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Videos Section */}
            {canAccessGeneralContent && (
              <div className="space-y-6">
                <SectionHeader
                  title="Featured Educational Videos"
                  icon={Video}
                  iconColor="text-red-500"
                  badge={{
                    text: `${featuredVideos.length} Videos`,
                    variant: "secondary",
                  }}
                />
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
            )}

            {/* Live Mentors Section */}
            {canAccessGeneralContent && (
              <LiveMentors liveMentors={liveMentors} />
            )}

            {/* Teacher Mode Section */}
            {isMentor && <TeacherMode navigate={navigate} />}
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}
