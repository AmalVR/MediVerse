/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { YouTubeVideo } from "@/lib/youtube/youtube-api";

interface YouTubePlayerProps {
  video: YouTubeVideo;
  className?: string;
  autoplay?: boolean;
  controls?: boolean;
  onVideoEnd?: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (elementId: string, config: any) => any;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export function YouTubePlayer({
  video,
  className = "",
  autoplay = false,
  controls = true,
  onVideoEnd,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load the YouTube IFrame API script
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [video.id]);

  const initializePlayer = () => {
    if (!playerRef.current || youtubePlayerRef.current) return;

    youtubePlayerRef.current = new window.YT.Player(playerRef.current.id, {
      videoId: video.id,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0, // Hide default controls
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1, // Allow fullscreen
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 0,
      },
      events: {
        onReady: () => {
          setPlayerReady(true);
          setDuration(youtubePlayerRef.current?.getDuration() || 0);
        },
        onStateChange: (event: { data: number }) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            onVideoEnd?.();
          }
        },
        onError: (event: any) => {
          console.error("YouTube player error:", event.data);
        },
      },
    });
  };

  // Update current time periodically
  useEffect(() => {
    if (!playerReady || !youtubePlayerRef.current) return;

    const interval = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        setCurrentTime(youtubePlayerRef.current.getCurrentTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerReady]);

  const togglePlayPause = () => {
    if (!youtubePlayerRef.current) return;

    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo();
    } else {
      youtubePlayerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!youtubePlayerRef.current) return;

    if (isMuted) {
      youtubePlayerRef.current.unMute();
      youtubePlayerRef.current.setVolume(volume);
    } else {
      youtubePlayerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (youtubePlayerRef.current && !isMuted) {
      youtubePlayerRef.current.setVolume(newVolume);
    }
  };

  const seekTo = (time: number) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true);
    }
  };

  const toggleFullscreen = () => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative bg-black group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* YouTube Player Container */}
          <div
            ref={playerRef}
            className="w-full aspect-video"
            style={{ minHeight: "300px" }}
          />

          {/* Custom Controls Overlay */}
          {controls && playerReady && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Top Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20 w-16 h-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 bg-white/30 rounded-full h-1 cursor-pointer">
                    <div
                      className="bg-white h-1 rounded-full transition-all cursor-pointer"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                      onClick={(e) => {
                        const rect =
                          e.currentTarget.parentElement!.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = clickX / rect.width;
                        seekTo(percentage * duration);
                      }}
                    />
                  </div>
                  <span className="text-white text-sm font-mono min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="w-20">
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">
                      {video.channelTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {!playerReady && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading video...</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{video.channelTitle}</span>
            <span>{video.viewCount} views</span>
          </div>
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
