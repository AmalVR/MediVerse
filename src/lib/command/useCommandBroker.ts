import { useEffect, useRef } from "react";
import { useUnityContext } from "react-unity-webgl";
import { CommandBroker } from "./CommandBroker";
import { OntologyService } from "./OntologyService";
import { AnatomyCommandProcessor } from "./processors/AnatomyCommandProcessor";
import { ViewCommandProcessor } from "./processors/ViewCommandProcessor";
import { UnityViewerAdapter } from "./viewers/UnityViewerAdapter";
import type { AnatomyCommand } from "./types";

export function useCommandBroker() {
  const brokerRef = useRef<CommandBroker>();
  const unityContext = useUnityContext({
    loaderUrl: "/unity/Build/pc-build.loader.js",
    dataUrl: "/unity/Build/pc-build.data.unityweb",
    frameworkUrl: "/unity/Build/pc-build.framework.js.unityweb",
    codeUrl: "/unity/Build/pc-build.wasm.unityweb",
  });

  // Initialize command broker
  useEffect(() => {
    if (!brokerRef.current) {
      // Create services and processors
      const ontologyService = new OntologyService();
      const anatomyProcessor = new AnatomyCommandProcessor(ontologyService);
      const viewProcessor = new ViewCommandProcessor();
      const unityViewer = new UnityViewerAdapter(unityContext);

      // Create and configure broker
      const broker = new CommandBroker();
      broker.registerProcessor(anatomyProcessor);
      broker.registerProcessor(viewProcessor);
      broker.registerViewer(unityViewer);

      brokerRef.current = broker;
    }
  }, [unityContext]);

  const executeCommand = async (command: AnatomyCommand) => {
    if (!brokerRef.current) {
      throw new Error("Command broker not initialized");
    }
    return brokerRef.current.execute(command);
  };

  const executeCommandAsync = (command: AnatomyCommand) => {
    if (!brokerRef.current) {
      throw new Error("Command broker not initialized");
    }
    brokerRef.current.executeAsync(command);
  };

  return {
    executeCommand,
    executeCommandAsync,
    isUnityReady: unityContext.isLoaded,
  };
}
