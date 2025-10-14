import { AnatomyCommand, IAnatomyViewer } from "../types";
import { useUnityContext } from "react-unity-webgl";

export class UnityViewerAdapter implements IAnatomyViewer {
  constructor(private unityContext: ReturnType<typeof useUnityContext>) {}

  async executeCommand(command: AnatomyCommand): Promise<void> {
    const { sendMessage } = this.unityContext;

    if (!this.isReady()) {
      throw new Error("Unity viewer not ready");
    }

    switch (command.action) {
      case "show":
        sendMessage("GameManager", "ShowSystem", command.target);
        break;

      case "hide":
        sendMessage("GameManager", "HideSystem", command.target);
        break;

      case "highlight":
        sendMessage("GameManager", "HighlightPart", command.target);
        break;

      case "isolate":
        sendMessage("GameManager", "IsolateSystem", command.target);
        break;

      case "rotate":
        sendMessage("GameManager", "RotateView", command.target);
        break;

      case "zoom":
        sendMessage("GameManager", "ZoomView", command.target);
        break;

      case "transparency":
        sendMessage("GameManager", "SetTransparency", command.target);
        break;

      case "reset":
        sendMessage("GameManager", "ResetView", "");
        break;

      default:
        throw new Error(`Unsupported command action: ${command.action}`);
    }
  }

  isReady(): boolean {
    return this.unityContext.isLoaded;
  }

  getState(): Record<string, unknown> {
    // TODO: Implement state retrieval from Unity
    return {};
  }
}
