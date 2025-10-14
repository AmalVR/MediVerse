/**
 * Unity Commands Utility
 * Handles communication with Unity WebGL build
 */

import { useCallback } from "react";
import { useUnityContext } from "react-unity-webgl";

export function useUnityCommands() {
  const { sendMessage, isLoaded } = useUnityContext();

  const executeCommand = useCallback(
    (command: { action: string; target: string }) => {
      if (!isLoaded) return;

      switch (command.action.toLowerCase()) {
        case "show":
        case "enable":
          sendMessage("GameManager", "ShowSystem", command.target);
          break;

        case "hide":
        case "disable":
          sendMessage("GameManager", "HideSystem", command.target);
          break;

        case "highlight":
          sendMessage("GameManager", "HighlightPart", command.target);
          break;

        case "isolate":
          sendMessage("GameManager", "IsolateSystem", command.target);
          break;

        case "reset":
          sendMessage("GameManager", "ResetView", "");
          break;

        case "rotate":
          sendMessage("GameManager", "RotateView", command.target); // left, right, up, down
          break;

        case "zoom":
          sendMessage("GameManager", "ZoomView", command.target); // in, out
          break;

        case "transparency":
          sendMessage("GameManager", "SetTransparency", command.target); // 0-100
          break;

        default:
          console.warn("Unknown Unity command:", command);
      }
    },
    [isLoaded, sendMessage]
  );

  return {
    executeCommand,
    isReady: isLoaded,
  };
}
