import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Bone,
  Brain,
  Wind,
  Activity,
  Play,
  Users,
  Clock,
} from "lucide-react";

export interface AnatomyTopic {
  id: string;
  name: string;
  system:
    | "CARDIOVASCULAR"
    | "SKELETAL"
    | "NERVOUS"
    | "RESPIRATORY"
    | "MUSCULAR";
  description: string;
  thumbnail: string;
  modelPath: string;
  youtubeVideos: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedTime: string;
  isLive?: boolean;
  liveSessionCount?: number;
}

interface TopicCardProps {
  topic: AnatomyTopic;
  variant?: "default" | "featured" | "live";
  onJoinLive?: (topicId: string) => void;
}

const systemIcons = {
  CARDIOVASCULAR: Heart,
  SKELETAL: Bone,
  NERVOUS: Brain,
  RESPIRATORY: Wind,
  MUSCULAR: Activity,
};

const systemColors = {
  CARDIOVASCULAR: "text-red-500 bg-red-50 border-red-200",
  SKELETAL: "text-gray-600 bg-gray-50 border-gray-200",
  NERVOUS: "text-purple-500 bg-purple-50 border-purple-200",
  RESPIRATORY: "text-blue-500 bg-blue-50 border-blue-200",
  MUSCULAR: "text-orange-500 bg-orange-50 border-orange-200",
};

const difficultyColors = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800",
  ADVANCED: "bg-red-100 text-red-800",
};

export function TopicCard({
  topic,
  variant = "default",
  onJoinLive,
}: TopicCardProps) {
  const navigate = useNavigate();
  const IconComponent = systemIcons[topic.system];
  const systemColorClass = systemColors[topic.system];

  const handleStartLearning = () => {
    navigate(`/learn/${topic.system.toLowerCase()}`);
  };

  const handleJoinLive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoinLive?.(topic.id);
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
        variant === "featured"
          ? "border-primary shadow-md"
          : variant === "live"
          ? "border-green-500 shadow-md"
          : "border-border hover:border-primary/50"
      } ${systemColorClass}`}
      onClick={handleStartLearning}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${systemColorClass}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {topic.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${difficultyColors[topic.difficulty]}`}
                >
                  {topic.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {topic.estimatedTime}
                </div>
              </div>
            </div>
          </div>

          {topic.isLive && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Live</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={topic.thumbnail}
            alt={topic.name}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" className="bg-white/90 text-black hover:bg-white">
              <Play className="h-4 w-4 mr-1" />
              Start Learning
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {topic.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Play className="h-3 w-3" />
            <span>{topic.youtubeVideos.length} videos</span>
            {topic.liveSessionCount && topic.liveSessionCount > 0 && (
              <>
                <span>•</span>
                <Users className="h-3 w-3" />
                <span>{topic.liveSessionCount} live sessions</span>
              </>
            )}
          </div>

          {topic.isLive && onJoinLive && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleJoinLive}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Users className="h-3 w-3 mr-1" />
              Join Live
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Default anatomy topics
export const defaultAnatomyTopics: AnatomyTopic[] = [
  {
    id: "cardiovascular",
    name: "Cardiovascular System",
    system: "CARDIOVASCULAR",
    description:
      "Explore the heart, blood vessels, and circulatory system with interactive 3D models and expert tutorials.",
    thumbnail: "/models/cardiovascular/cardiovascular-thumb.jpg",
    modelPath: "/models/cardiovascular/cardiovascular-full.glb",
    youtubeVideos: [],
    difficulty: "INTERMEDIATE",
    estimatedTime: "15 min",
  },
  {
    id: "skeletal",
    name: "Skeletal System",
    system: "SKELETAL",
    description:
      "Learn about bones, joints, and the skeletal framework that supports the human body.",
    thumbnail: "/models/skeleton/skeleton-thumb.jpg",
    modelPath: "/models/skeleton/skeleton-full.glb",
    youtubeVideos: [],
    difficulty: "BEGINNER",
    estimatedTime: "12 min",
  },
  {
    id: "nervous",
    name: "Nervous System",
    system: "NERVOUS",
    description:
      "Discover the brain, spinal cord, and neural networks that control body functions.",
    thumbnail: "/models/nervous/nervous-thumb.jpg",
    modelPath: "/models/nervous/nervous-full.glb",
    youtubeVideos: [],
    difficulty: "ADVANCED",
    estimatedTime: "20 min",
  },
  {
    id: "respiratory",
    name: "Respiratory System",
    system: "RESPIRATORY",
    description:
      "Understand breathing, lungs, and the respiratory pathway with detailed 3D visualization.",
    thumbnail: "/models/respiratory/respiratory-thumb.jpg",
    modelPath: "/models/respiratory/respiratory-full.glb",
    youtubeVideos: [],
    difficulty: "INTERMEDIATE",
    estimatedTime: "10 min",
  },
  {
    id: "muscular",
    name: "Muscular System",
    system: "MUSCULAR",
    description:
      "Study muscles, tendons, and how they work together to create movement.",
    thumbnail: "/models/muscular/muscular-thumb.jpg",
    modelPath: "/models/muscular/muscular-full.glb",
    youtubeVideos: [],
    difficulty: "INTERMEDIATE",
    estimatedTime: "18 min",
  },
];
