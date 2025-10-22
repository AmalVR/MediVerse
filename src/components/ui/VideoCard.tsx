import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import type { YouTubeVideo } from "@/lib/youtube/youtube-api";

interface VideoCardProps {
  video: YouTubeVideo;
  onClick?: () => void;
  className?: string;
}

export function VideoCard({ video, onClick, className = "" }: VideoCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-32 object-cover rounded-t-lg"
        />
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {video.channelTitle}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Video className="h-3 w-3" />
          <span>{video.viewCount} views</span>
        </div>
      </CardContent>
    </Card>
  );
}
