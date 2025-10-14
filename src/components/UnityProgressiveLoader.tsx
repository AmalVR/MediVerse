/**
 * Progressive loading component for Unity WebGL
 * Shows detailed progress, time estimates, and educational tips
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Wifi, WifiOff, Download, Zap, Clock } from "lucide-react";
import {
  detectNetworkSpeed,
  getNetworkInfo,
  estimateDownloadTime,
  getNetworkDescription,
  type NetworkSpeed,
} from "@/lib/network-detection";

export type LoadingStage = "download" | "decompress" | "initialize" | "ready";

interface UnityProgressiveLoaderProps {
  loadingProgress: number; // 0-1
  isLoaded: boolean;
  onSkip?: () => void;
  canSkip?: boolean;
}

const TIPS = [
  "💡 The 3D models will be cached for instant loading next time",
  "🎓 MediVerse uses real Z-Anatomy medical models",
  "🔍 You can zoom and rotate to explore every detail",
  "📱 This app works offline after the first load",
  "⚡ Subsequent visits load instantly from cache",
  "🎯 Click any body part to learn more about it",
  "🗣️ Use voice commands to navigate anatomy",
  "💾 ~200MB will be stored in your browser for offline use",
];

const STAGE_NAMES: Record<LoadingStage, string> = {
  download: "Downloading anatomy models",
  decompress: "Decompressing data",
  initialize: "Initializing viewer",
  ready: "Ready!",
};

export function UnityProgressiveLoader({
  loadingProgress,
  isLoaded,
  onSkip,
  canSkip = false,
}: UnityProgressiveLoaderProps) {
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>("medium");
  const [currentTip, setCurrentTip] = useState(0);
  const [stage, setStage] = useState<LoadingStage>("download");
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Detect network speed on mount
  useEffect(() => {
    const info = getNetworkInfo();
    setNetworkSpeed(info.speed);

    // Estimate download time for 182MB Unity build
    const estimate = estimateDownloadTime(182, info.speed);
    setEstimatedTime(estimate);
  }, []);

  // Determine loading stage based on progress
  useEffect(() => {
    if (isLoaded) {
      setStage("ready");
    } else if (loadingProgress < 0.7) {
      setStage("download");
    } else if (loadingProgress < 0.95) {
      setStage("decompress");
    } else {
      setStage("initialize");
    }
  }, [loadingProgress, isLoaded]);

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    if (isLoaded) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  const percentage = Math.round(loadingProgress * 100);
  const remainingTime =
    estimatedTime && estimatedTime > 0
      ? Math.max(0, estimatedTime - elapsedTime)
      : null;

  const NetworkIcon =
    networkSpeed === "fast" ? Zap : networkSpeed === "offline" ? WifiOff : Wifi;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-sm z-50">
      <Card className="w-full max-w-lg mx-4 p-6 bg-gray-900/90 border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {STAGE_NAMES[stage]}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <NetworkIcon className="h-4 w-4" />
              <span>{getNetworkDescription({ speed: networkSpeed })}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={percentage} className="h-3" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{percentage}% complete</span>
              {remainingTime !== null && remainingTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>~{formatTime(remainingTime)} remaining</span>
                </div>
              )}
            </div>
          </div>

          {/* Stage Details */}
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <Download className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="text-gray-300">
                {stage === "download" &&
                  "Loading 3D anatomy models and assets..."}
                {stage === "decompress" &&
                  "Decompressing high-quality anatomical data..."}
                {stage === "initialize" &&
                  "Setting up the interactive 3D viewer..."}
                {stage === "ready" && "Anatomy viewer is ready to use!"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                First-time setup: ~200MB • Instant loading next time
              </p>
            </div>
          </div>

          {/* Educational Tip */}
          <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <p className="text-sm text-gray-300 text-center">
              {TIPS[currentTip]}
            </p>
          </div>

          {/* Network Warning for Slow Connections */}
          {networkSpeed === "slow" && (
            <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <p className="text-sm text-yellow-300 text-center">
                ⚠️ Slow connection detected. Consider using WiFi for faster
                loading.
              </p>
            </div>
          )}

          {/* Skip Button (for cached/returning users) */}
          {canSkip && onSkip && (
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Skip to Viewer
            </Button>
          )}

          {/* Elapsed Time */}
          <div className="text-center text-xs text-gray-500">
            Elapsed time: {formatTime(elapsedTime)}
          </div>
        </div>
      </Card>
    </div>
  );
}

