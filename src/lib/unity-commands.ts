import { useUnityContext } from "react-unity-webgl";

/**
 * Hook for sending commands to Unity WebGL instance.
 * Provides type-safe methods for controlling the anatomy viewer.
 */
export function useUnityCommands(unityContext?: {
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
}) {
  const context = unityContext || {
    loaderUrl: "",
    dataUrl: "",
    frameworkUrl: "",
    codeUrl: "",
  };

  const { sendMessage, isLoaded } = useUnityContext(context);

  return {
    showSystem: (systemName: string) => {
      if (isLoaded) {
        sendMessage("GameManager", "ShowSystem", systemName);
      }
    },
    hideSystem: (systemName: string) => {
      if (isLoaded) {
        sendMessage("GameManager", "HideSystem", systemName);
      }
    },
    highlightPart: (partName: string) => {
      if (isLoaded) {
        sendMessage("GameManager", "HighlightPart", partName);
      }
    },
    setOpacity: (opacity: number) => {
      if (isLoaded) {
        sendMessage("GameManager", "SetOpacity", opacity.toString());
      }
    },
    rotateModel: (rotation: { x: number; y: number; z: number }) => {
      if (isLoaded) {
        sendMessage("GameManager", "RotateModel", JSON.stringify(rotation));
      }
    },
    resetView: () => {
      if (isLoaded) {
        sendMessage("GameManager", "ResetView", "");
      }
    },
    isReady: isLoaded,
  };
}
