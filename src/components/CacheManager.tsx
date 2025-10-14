/**
 * Cache Manager Component
 * Shows Unity build cache status and provides management controls
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { unityPreloader } from "@/lib/unity-preloader";
import { getNetworkInfo } from "@/lib/network-detection";
import { Database, Trash2, RefreshCw, WifiOff } from "lucide-react";

interface CacheStats {
  totalSize: number;
  fileCount: number;
  lastUpdated: Date | null;
}

export function CacheManager() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 0,
    fileCount: 0,
    lastUpdated: null,
  });
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(getNetworkInfo());

  // Update cache stats
  const updateStats = async () => {
    try {
      const cache = await caches.open("unity-builds");
      const keys = await cache.keys();
      let totalSize = 0;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      setCacheStats({
        totalSize,
        fileCount: keys.length,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error getting cache stats:", error);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(getNetworkInfo());
    const handleOffline = () => setNetworkStatus(getNetworkInfo());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const clearCache = async () => {
    setIsClearing(true);
    try {
      await unityPreloader.clearCache();
      await updateStats();
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const refreshCache = async () => {
    setIsRefreshing(true);
    try {
      // Re-download Unity builds
      await unityPreloader.preload({
        pcBuildPath: "/unity/pc-build",
        mobileBuildPath: "/unity/mobile-build",
        onProgress: (progress) => {
          console.log("Cache refresh progress:", progress);
        },
      });
      await updateStats();
    } catch (error) {
      console.error("Error refreshing cache:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getCacheStatus = (): {
    label: string;
    color: string;
    progress: number;
  } => {
    const expectedSize = 200 * 1024 * 1024; // 200MB expected size
    const progress = Math.min((cacheStats.totalSize / expectedSize) * 100, 100);

    if (cacheStats.totalSize === 0) {
      return {
        label: "No cached data",
        color: "bg-gray-500",
        progress: 0,
      };
    }

    if (progress < 50) {
      return {
        label: "Partially cached",
        color: "bg-yellow-500",
        progress,
      };
    }

    if (progress >= 100) {
      return {
        label: "Fully cached",
        color: "bg-green-500",
        progress: 100,
      };
    }

    return {
      label: "Caching in progress",
      color: "bg-blue-500",
      progress,
    };
  };

  const { label, color, progress } = getCacheStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Cache Status</span>
          </div>
          {networkStatus.speed === "offline" && (
            <div className="flex items-center gap-1 text-yellow-500">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>Manage Unity build cache</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span>{formatBytes(cacheStats.totalSize)}</span>
          </div>
          <Progress value={progress} className={color} />
        </div>

        {/* Cache Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Files Cached</span>
            <p className="font-medium">{cacheStats.fileCount} files</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Last Updated</span>
            <p className="font-medium">
              {cacheStats.lastUpdated
                ? cacheStats.lastUpdated.toLocaleTimeString()
                : "Never"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={clearCache}
            disabled={isClearing || cacheStats.totalSize === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isClearing ? "Clearing..." : "Clear Cache"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={refreshCache}
            disabled={
              isRefreshing || networkStatus.speed === "offline" || isClearing
            }
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
