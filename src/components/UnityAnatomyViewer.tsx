import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
  detectUnityBuild,
  getUnityBuildPath,
  getDeviceInfo,
} from "@/lib/platform-detect";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface UnityAnatomyViewerProps {
  highlightedPart?: string;
  onPartClick?: (partName: string) => void;
  onReady?: () => void;
}

export function UnityAnatomyViewer({
  highlightedPart,
  onPartClick,
  onReady,
}: UnityAnatomyViewerProps) {
  const [buildType] = useState(() => detectUnityBuild());
  const [deviceInfo] = useState(() => getDeviceInfo());
  const buildPath = getUnityBuildPath(buildType);

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: `${buildPath}/Build/pc-build.loader.js`,
    dataUrl: `${buildPath}/Build/pc-build.data.unityweb`,
    frameworkUrl: `${buildPath}/Build/pc-build.framework.js.unityweb`,
    codeUrl: `${buildPath}/Build/pc-build.wasm.unityweb`,
  });

  // Send highlight command to Unity when highlightedPart changes
  useEffect(() => {
    if (isLoaded && highlightedPart) {
      sendMessage("GameManager", "HighlightPart", highlightedPart);
    }
  }, [isLoaded, highlightedPart, sendMessage]);

  // Listen for part click events from Unity
  useEffect(() => {
    const handlePartClicked = (partName: string) => {
      console.log("Unity: Part clicked:", partName);
      if (onPartClick) {
        onPartClick(partName);
      }
    };

    addEventListener("PartClicked", handlePartClicked);

    return () => {
      removeEventListener("PartClicked", handlePartClicked);
    };
  }, [addEventListener, removeEventListener, onPartClick]);

  // Notify parent when Unity is ready
  useEffect(() => {
    if (isLoaded && onReady) {
      onReady();
    }
  }, [isLoaded, onReady]);

  const loadingPercentage = Math.round(loadingProgression * 100);

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Card className="p-6 max-w-md">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <div className="font-semibold mb-1">
                  Loading Z-Anatomy Viewer
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {loadingPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Using {buildType === "pc" ? "Desktop" : "Mobile"} Build
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Device info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded z-20">
          <div>Platform: {deviceInfo.platform}</div>
          <div>Build: {deviceInfo.unityBuild}</div>
          <div>Touch: {deviceInfo.hasTouch ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Unity canvas */}
      <Unity
        unityProvider={unityProvider}
        style={{
          width: "100%",
          height: "100%",
          visibility: isLoaded ? "visible" : "hidden",
        }}
        devicePixelRatio={deviceInfo.pixelRatio}
      />
    </div>
  );
}

// Re-export Unity commands hook from lib
export { useUnityCommands } from "@/lib/unity-commands";
