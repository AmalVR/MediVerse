import { useState } from "react";
import { AnatomyViewer } from "./AnatomyViewer";
import { UnityAnatomyViewer } from "./UnityAnatomyViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Smartphone, ToggleLeft, ToggleRight } from "lucide-react";

type ViewerType = "threejs" | "unity";

interface HybridAnatomyViewerProps {
  highlightedPart?: string;
  cameraPosition?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  visibleParts?: string[];
  onPartClick?: (partName: string) => void;
}

export function HybridAnatomyViewer({
  highlightedPart,
  cameraPosition,
  rotation,
  visibleParts,
  onPartClick,
}: HybridAnatomyViewerProps) {
  const [viewerType, setViewerType] = useState<ViewerType>("threejs");
  const [unityReady, setUnityReady] = useState(false);

  const toggleViewer = () => {
    setViewerType((prev) => (prev === "threejs" ? "unity" : "threejs"));
  };

  return (
    <div className="relative w-full h-full">
      {/* Viewer Toggle Controls */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="bg-black/80 border-white/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="text-white text-xs font-medium">Viewer:</div>
              <Button
                size="sm"
                variant={viewerType === "threejs" ? "default" : "outline"}
                onClick={() => setViewerType("threejs")}
                className="text-xs"
              >
                <Monitor className="h-3 w-3 mr-1" />
                Three.js
              </Button>
              <Button
                size="sm"
                variant={viewerType === "unity" ? "default" : "outline"}
                onClick={() => setViewerType("unity")}
                className="text-xs"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                Unity
              </Button>
            </div>

            {/* Status indicators */}
            <div className="mt-2 text-xs text-gray-300 space-y-1">
              {viewerType === "threejs" && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Lightweight (5MB)</span>
                </div>
              )}
              {viewerType === "unity" && (
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      unityReady ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span>{unityReady ? "Ready" : "Loading..."} (30MB)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render appropriate viewer */}
      {viewerType === "threejs" ? (
        <AnatomyViewer
          highlightedPart={highlightedPart}
          cameraPosition={cameraPosition}
          rotation={rotation}
          visibleParts={visibleParts}
          onPartClick={onPartClick}
        />
      ) : (
        <UnityAnatomyViewer
          highlightedPart={highlightedPart}
          onPartClick={onPartClick}
          onReady={() => setUnityReady(true)}
        />
      )}

      {/* Viewer comparison info */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-black/80 border-white/20 max-w-xs">
          <CardContent className="p-3">
            <div className="text-white text-xs space-y-2">
              <div className="font-semibold">
                Current: {viewerType === "threejs" ? "Three.js" : "Unity"}
              </div>
              {viewerType === "threejs" ? (
                <div className="space-y-1 text-gray-300">
                  <div>✅ Fast loading</div>
                  <div>✅ Browser cache support</div>
                  <div>⚠️ Load one system at a time</div>
                </div>
              ) : (
                <div className="space-y-1 text-gray-300">
                  <div>✅ Professional features</div>
                  <div>✅ No WASM issues</div>
                  <div>✅ Multi-system support</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
