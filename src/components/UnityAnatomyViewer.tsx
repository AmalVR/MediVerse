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
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UnityCommandExecutor } from "@/lib/unity/UnityCommandExecutor";
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
  const buildPath = getUnityBuildPath(buildType);

  const { unityProvider, sendMessage, isLoaded, loadingProgression } =
    useUnityContext({
      loaderUrl: `${buildPath}/Build/${buildType}-build.loader.js`,
      dataUrl: `${buildPath}/Build/${buildType}-build.data.unityweb`,
      frameworkUrl: `${buildPath}/Build/${buildType}-build.framework.js.unityweb`,
      codeUrl: `${buildPath}/Build/${buildType}-build.wasm.unityweb`,
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

  const loadingPercentage = Math.round(loadingProgression * 100);

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
});

UnityAnatomyViewer.displayName = "UnityAnatomyViewer";
