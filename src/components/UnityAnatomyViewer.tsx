import {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
  detectUnityBuild,
  getUnityBuildPath,
  getDeviceInfo,
} from "@/lib/platform-detect";
import { config } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UnityCommandExecutor } from "@/lib/unity/UnityCommandExecutor";
import { UnityPlaceholder } from "@/components/UnityPlaceholder";
import type {
  IUnityViewerHandle,
  UnityCommand,
  UnityCommandResult,
} from "@/types/unity";

interface UnityAnatomyViewerProps {
  onReady?: () => void;
}

/**
 * Unity Anatomy Viewer Component
 *
 * Following SOLID principles:
 * - Single Responsibility: Only responsible for rendering Unity and exposing command interface
 * - Dependency Inversion: Uses IUnityViewerHandle interface
 * - Interface Segregation: Exposes minimal API via ref
 */
export const UnityAnatomyViewer = forwardRef<
  IUnityViewerHandle,
  UnityAnatomyViewerProps
>(({ onReady }, ref) => {
  const [buildType] = useState(() => detectUnityBuild());
  const [deviceInfo] = useState(() => getDeviceInfo());
  const [unityError, setUnityError] = useState<string | null>(null);
  const [skipUnity, setSkipUnity] = useState(!config.unityEnabled);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const buildPath = getUnityBuildPath(buildType);

  // Always initialize Unity context, but only use it if enabled
  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: config.unityEnabled
        ? `${buildPath}/Build/pc-build.loader.js`
        : "",
      dataUrl: config.unityEnabled
        ? `${buildPath}/Build/pc-build.data.unityweb`
        : "",
      // Try to load framework and code URLs - will fallback gracefully if missing
      frameworkUrl: config.unityEnabled
        ? `${buildPath}/Build/pc-build.framework.js.unityweb`
        : "",
      codeUrl: config.unityEnabled
        ? `${buildPath}/Build/pc-build.wasm.unityweb`
        : "",
      webglContextAttributes: {
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        antialias: true,
      },
    });

  // Create command executor (Dependency Injection)
  const executorRef = useRef<UnityCommandExecutor>(
    new UnityCommandExecutor(sendMessage, isLoaded)
  );

  // Update executor when Unity loads
  useEffect(() => {
    executorRef.current.updateLoadedState(isLoaded);
  }, [isLoaded]);

  // Expose command execution interface to parent component
  useImperativeHandle(
    ref,
    (): IUnityViewerHandle => ({
      executeCommand: (command: UnityCommand): UnityCommandResult => {
        return executorRef.current.executeCommand(command);
      },
      isLoaded: (): boolean => {
        return isLoaded;
      },
      getLoadingProgress: (): number => {
        return loadingProgression;
      },
    }),
    [isLoaded, loadingProgression]
  );

  // Notify parent when Unity is ready
  useEffect(() => {
    if (isLoaded && onReady) {
      onReady();
    }
  }, [isLoaded, onReady]);

  // Check if Unity build files exist (optional check)
  useEffect(() => {
    if (!config.unityEnabled) return;

    const checkUnityFiles = async () => {
      try {
        // Check if required Unity files exist
        const requiredFiles = [
          `${buildPath}/Build/pc-build.framework.js.unityweb`,
          `${buildPath}/Build/pc-build.wasm.unityweb`,
        ];

        const missingFiles = [];
        for (const file of requiredFiles) {
          try {
            const response = await fetch(file, { method: "HEAD" });
            // Check if response is OK and has correct content type
            if (
              !response.ok ||
              response.headers.get("content-type")?.includes("text/html")
            ) {
              missingFiles.push(file);
            }
          } catch {
            missingFiles.push(file);
          }
        }

        if (missingFiles.length > 0) {
          console.info(
            "Unity WebGL build files not available - using fallback mode"
          );
          setSkipUnity(true);
          setUnityError(
            `3D Anatomy Viewer is currently unavailable. You can still explore anatomy content through videos and interactive learning.`
          );
        }
      } catch (error) {
        console.warn("Could not check Unity files:", error);
        // Don't fail the entire app if we can't check Unity files
      }
    };

    checkUnityFiles();
  }, [buildPath]);

  // Handle Unity loading errors gracefully
  useEffect(() => {
    if (!config.unityEnabled) return;

    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes("createUnityInstance") ||
        event.message.includes("Unity") ||
        event.message.includes("WebGL") ||
        event.message.includes("unityFramework") ||
        event.message.includes("corrupt") ||
        event.message.includes("compression")
      ) {
        console.info("Unity WebGL error detected - switching to fallback mode");
        setUnityError(
          "3D Anatomy Viewer is currently unavailable. You can still explore anatomy content through videos and interactive learning."
        );
        setSkipUnity(true);
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const loadingPercentage = Math.round(loadingProgression * 100);

  // Retry function that doesn't reload the page
  const handleRetry = () => {
    if (retryCount >= 2) {
      // After 2 retries, show a message that Unity is optional
      setUnityError(
        "3D Anatomy Viewer is currently unavailable. This is optional - you can continue using videos and interactive learning features."
      );
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);
    setUnityError(null);
    setSkipUnity(false);

    // Reset retrying state after a short delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);

    // Force Unity context to reinitialize by updating the key
    // This will trigger a re-render and re-check of Unity files
  };

  // If Unity is disabled via config, show placeholder immediately
  if (!config.unityEnabled) {
    return (
      <UnityPlaceholder
        errorMessage="3D Anatomy Viewer is disabled. You can still explore anatomy content through videos and interactive learning."
        retryCount={0}
        maxRetries={0}
        isRetrying={false}
      />
    );
  }

  // Skip Unity loading if files are missing
  if (skipUnity) {
    return (
      <UnityPlaceholder
        errorMessage={unityError}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={3}
        isRetrying={isRetrying}
      />
    );
  }

  // Show error state if Unity fails to load
  if (unityError) {
    return (
      <UnityPlaceholder
        errorMessage={unityError}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={3}
        isRetrying={isRetrying}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Card className="p-6 max-w-md mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="absolute -top-1 -right-1 h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
              </div>
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
                {deviceInfo.platform === "mobile" && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Optimized for mobile devices
                  </div>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 relative"
                  style={{ width: `${loadingPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Device info & command status (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded z-20 max-w-[200px]">
          <div>Platform: {deviceInfo.platform}</div>
          <div>Build: {deviceInfo.unityBuild}</div>
          <div>Touch: {deviceInfo.hasTouch ? "Yes" : "No"}</div>
          <div className="mt-2 text-yellow-400 text-[10px]">
            ⚠️ Unity GameManager not configured. Commands are sent but not
            processed.
          </div>
        </div>
      )}

      {/* Unity canvas */}
      <Unity
        key={`unity-${retryCount}`} // Force re-render on retry
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
});

UnityAnatomyViewer.displayName = "UnityAnatomyViewer";
