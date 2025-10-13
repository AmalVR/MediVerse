// Enhanced Anatomy Viewer with Z-Anatomy GLTF models
// Simplified and robust implementation

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { loadModelWithCache } from "@/lib/model-cache";

interface AnatomyViewerProps {
  highlightedPart?: string;
  cameraPosition?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  visibleParts?: string[];
  onPartClick?: (partName: string) => void;
}

// System color configuration
const SYSTEM_COLORS: Record<string, string> = {
  skeleton: "#E0E0E0",
  cardiovascular: "#FF4444",
  respiratory: "#FF69B4",
  nervous: "#9370DB",
  muscular: "#D2691E",
};

// GLTF Model Component with proper coloring
function AnatomyModel({
  modelPath,
  highlightedPart,
  selectedPart,
  onPartClick,
  systemType,
  onModelLoad,
  wireframe = false,
  opacity = 0.95,
}: {
  modelPath: string;
  highlightedPart?: string;
  selectedPart?: { name: string; system: string } | null;
  onPartClick?: (
    partName: string,
    position: THREE.Vector3,
    system: string,
    mesh?: THREE.Mesh
  ) => void;
  systemType: string;
  onModelLoad?: (failed?: boolean) => void;
  wireframe?: boolean;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const { camera, gl } = useThree();

  const baseColor = SYSTEM_COLORS[systemType] || "#FFFFFF";

  // Load GLTF model with browser caching (IndexedDB)
  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        // Load model from cache or network
        const loadedModel = await loadModelWithCache(modelPath, (progress) => {
          console.log(`Loading ${systemType}: ${Math.round(progress)}%`);
        });

        if (!mounted) return;

        // Proper scaling for Z-Anatomy models - larger for better visibility
        loadedModel.scale.set(3, 3, 3);

        // Calculate bounding box to find actual center
        const bbox = new THREE.Box3().setFromObject(loadedModel);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Offset model so its center aligns with world origin
        loadedModel.position.set(-center.x, -center.y, -center.z);

        console.log(`📏 ${systemType} model:`, {
          boundingBox: {
            min: bbox.min,
            max: bbox.max,
            size: bbox.getSize(new THREE.Vector3()),
          },
          center: center,
          offset: loadedModel.position,
        });

        // Apply materials with proper colors
        let partIndex = 0;
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Store metadata
            mesh.userData.partName = child.name;
            mesh.userData.systemType = systemType;
            mesh.userData.partIndex = partIndex;

            // Create color variation for each part (lighter/darker shades)
            const color = new THREE.Color(baseColor);
            const variation = (partIndex % 10) * 0.05 - 0.25; // -0.25 to +0.25
            color.offsetHSL(0, 0, variation);

            partIndex++;

            // Apply material
            const material = new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.8,
              metalness: 0.2,
              transparent: true,
              opacity: opacity,
              wireframe: wireframe,
            });

            mesh.material = material;
            mesh.userData.originalColor = color.clone();
          }
        });

        setModel(loadedModel);
        if (onModelLoad) onModelLoad();
        console.log(`✅ ${systemType} model loaded from cache:`, {
          parts: partIndex,
          position: loadedModel.position,
          scale: loadedModel.scale,
          path: modelPath,
        });
      } catch (error) {
        console.error(`❌ Error loading ${systemType} model:`, error);
        if (onModelLoad) onModelLoad(true);
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, [modelPath, systemType, onModelLoad, baseColor, wireframe, opacity]);

  // Handle highlighting and selection
  useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const partName = mesh.userData.partName || child.name;

        // Check if highlighted (voice command)
        const isHighlighted =
          highlightedPart &&
          (partName.toLowerCase().includes(highlightedPart.toLowerCase()) ||
            highlightedPart.toLowerCase().includes(partName.toLowerCase()));

        // Check if selected (clicked)
        const isSelected =
          selectedPart &&
          selectedPart.system === systemType &&
          partName === selectedPart.name;

        if (isSelected) {
          // Selected: bright cyan glow with strong pulsing effect for learning
          material.color.setHex(0x00ffff);
          material.emissive = new THREE.Color(0x00aaff);
          material.emissiveIntensity = 1.2; // Stronger glow
          material.opacity = 1.0;
          mesh.scale.setScalar(1.08); // Slightly larger for visibility

          // Add outline effect by adjusting material properties
          material.roughness = 0.3;
          material.metalness = 0.5;
        } else if (isHighlighted) {
          // Highlighted via voice: bright yellow for attention
          material.color.setHex(0xffff00);
          material.emissive = new THREE.Color(0xff8800);
          material.emissiveIntensity = 0.8;
          material.opacity = 1.0;
          mesh.scale.setScalar(1.03);
          material.roughness = 0.4;
          material.metalness = 0.3;
        } else {
          // Normal: restore original appearance
          material.color.copy(mesh.userData.originalColor);
          material.emissive = new THREE.Color(0x000000);
          material.emissiveIntensity = 0;
          material.opacity = opacity;
          mesh.scale.setScalar(1.0);
          material.roughness = 0.8;
          material.metalness = 0.2;
        }
      }
    });
  }, [model, highlightedPart, selectedPart, systemType, opacity]);

  // Update wireframe and opacity
  useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material.isMeshStandardMaterial) {
          material.wireframe = wireframe;
          material.opacity = opacity;
          material.needsUpdate = true;
        }
      }
    });
  }, [model, wireframe, opacity]);

  // Click and hover handlers
  useEffect(() => {
    if (!model) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(model.children, true);

      if (intersects.length > 0 && onPartClick) {
        const object = intersects[0].object as THREE.Mesh;
        const partName = object.userData.partName || object.name || "Unknown";
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);
        onPartClick(partName, worldPosition, systemType, object);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(model.children, true);

      if (intersects.length > 0) {
        gl.domElement.style.cursor = "pointer";
        setHoveredPart(intersects[0].object.name);
      } else {
        gl.domElement.style.cursor = "default";
        setHoveredPart(null);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    gl.domElement.addEventListener("mousemove", handleMouseMove);

    return () => {
      gl.domElement.removeEventListener("click", handleClick);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
    };
  }, [model, camera, gl, onPartClick, systemType]);

  return model ? <primitive object={model} ref={groupRef} /> : null;
}

// Zoom to Mesh Component - handles auto-zooming to fit selected parts in view
function ZoomToMesh({
  mesh,
  controlsRef,
}: {
  mesh: THREE.Mesh | null;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size: viewportSize, gl } = useThree();

  useEffect(() => {
    if (!mesh || !controlsRef.current) return;

    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    // Calculate the maximum dimension of the part
    const maxDim = Math.max(size.x, size.y, size.z);

    // Get viewport aspect ratio
    const aspect = viewportSize.width / viewportSize.height;

    // Camera FOV
    const fov = 50;
    const fovRad = (fov * Math.PI) / 180;

    // Calculate distance to fit the object perfectly in view
    const halfFov = fovRad / 2;
    const distance = maxDim / (2 * Math.tan(halfFov));

    // Add generous padding based on part size
    const paddingFactor = maxDim > 10 ? 1.8 : maxDim > 5 ? 2.0 : 2.5;
    const paddedDistance = distance * paddingFactor;

    // Ensure minimum distance for very small parts
    const finalDistance = Math.max(paddedDistance, 4);

    // Get current view direction to maintain orientation
    const currentDirection = camera.position
      .clone()
      .sub(controlsRef.current.target)
      .normalize();

    // If direction is zero (unlikely), use default front view
    if (currentDirection.length() === 0) {
      currentDirection.set(0, 0, 1);
    }

    // Calculate new camera position maintaining current view angle
    const newPosition = center
      .clone()
      .add(currentDirection.multiplyScalar(finalDistance));

    // Animate the transition for smooth zoom
    const startPosition = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const duration = 600; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      // Interpolate camera position and target
      camera.position.lerpVectors(startPosition, newPosition, eased);
      controlsRef.current!.target.lerpVectors(startTarget, center, eased);
      controlsRef.current!.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    console.log(`🎯 Zooming to part:`, {
      partName: mesh.userData.partName || mesh.name,
      partSize: size,
      maxDim: maxDim.toFixed(2),
      distance: finalDistance.toFixed(2),
      center,
      paddingFactor,
    });
  }, [mesh, camera, controlsRef, viewportSize, gl]);

  return null;
}

// Camera Controller Component
function CameraController({
  viewOrientation,
  controlsRef,
}: {
  viewOrientation: string;
  controlsRef?: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const localControlsRef = useRef<OrbitControlsImpl>(null);
  const activeRef = controlsRef || localControlsRef;

  useEffect(() => {
    if (!activeRef.current) return;

    // Calculate current distance from target to preserve zoom level
    const target = activeRef.current.target;
    const currentDistance = camera.position.distanceTo(target);

    // Direction vectors for each view
    const viewDirections: Record<string, THREE.Vector3> = {
      front: new THREE.Vector3(0, 0, 1),
      back: new THREE.Vector3(0, 0, -1),
      left: new THREE.Vector3(-1, 0, 0),
      right: new THREE.Vector3(1, 0, 0),
      top: new THREE.Vector3(0, 1, 0),
      bottom: new THREE.Vector3(0, -1, 0),
    };

    const direction = viewDirections[viewOrientation];
    if (direction) {
      // Set camera position at current distance in the new direction
      const newPosition = direction.clone().multiplyScalar(currentDistance);
      camera.position.copy(newPosition);
      activeRef.current.target.set(0, 0, 0);
      activeRef.current.update();
    }
  }, [viewOrientation, camera, activeRef]);

  return (
    <OrbitControls
      ref={activeRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={false}
      minDistance={0.1}
      maxDistance={100}
    />
  );
}

// Main Viewer Component
export function AnatomyViewer({
  highlightedPart,
  cameraPosition = { x: 0, y: 2, z: 18 }, // Centered on body with slight upward view
  rotation = { x: 0, y: 0, z: 0 },
  visibleParts = ["skeleton"],
  onPartClick,
}: AnatomyViewerProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<{
    name: string;
    system: string;
  } | null>(null);
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [failedModels, setFailedModels] = useState<Set<string>>(new Set());
  const [wireframe, setWireframe] = useState(false);
  const [opacity, setOpacity] = useState(0.95);
  const [currentView, setCurrentView] = useState<string>("front");
  const cameraControlsRef = useRef<OrbitControlsImpl | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);

  const handlePartClick = (
    partName: string,
    position: THREE.Vector3,
    system: string,
    mesh?: THREE.Mesh
  ) => {
    setSelectedPart({ name: partName, system });
    if (mesh) {
      setSelectedMesh(mesh);
    }

    if (onPartClick) {
      onPartClick(partName);
    }
  };

  const handleModelLoad = (system: string, failed = false) => {
    if (failed) {
      setFailedModels((prev) => new Set(prev).add(system));
    } else {
      setLoadedModels((prev) => new Set(prev).add(system));
    }

    // Stop loading when all models are either loaded or failed
    if (loadedModels.size + failedModels.size + 1 >= visibleParts.length) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visibleParts.length === 0) {
      setLoading(false);
      return;
    }

    // Check if all visible parts are loaded or failed
    const allAccountedFor = visibleParts.every(
      (part) => loadedModels.has(part) || failedModels.has(part)
    );

    if (allAccountedFor) {
      setLoading(false);
    }
  }, [visibleParts, loadedModels, failedModels]);

  // View orientation presets
  const setViewOrientation = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center max-w-md px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
            <div>Loading Z-Anatomy models...</div>
            <div className="text-xs text-gray-400 mt-2">
              {loadedModels.size} of {visibleParts.length} loaded
            </div>
            <div className="text-xs text-cyan-300 mt-1">
              💾 Checking browser cache...
            </div>
            <div className="text-xs text-gray-400 mt-1 italic">
              Models are cached after first load
            </div>
            {failedModels.size > 0 && (
              <div className="text-xs text-red-400 mt-2 bg-red-900/30 p-2 rounded">
                ⚠️ Failed: {Array.from(failedModels).join(", ")}
                <div className="mt-1">Try: Close other tabs & reload</div>
              </div>
            )}
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{
          position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
          fov: 50,
        }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <spotLight position={[-5, 5, 0]} intensity={0.5} />
          <hemisphereLight intensity={0.3} />

          {/* Models */}
          <group rotation={[rotation.x, rotation.y, rotation.z]}>
            {visibleParts.includes("skeleton") && (
              <AnatomyModel
                modelPath="/models/skeleton/skeleton-full.glb"
                highlightedPart={highlightedPart}
                selectedPart={selectedPart}
                onPartClick={handlePartClick}
                systemType="skeleton"
                onModelLoad={(failed) => handleModelLoad("skeleton", failed)}
                wireframe={wireframe}
                opacity={opacity}
              />
            )}

            {visibleParts.includes("cardiovascular") && (
              <AnatomyModel
                modelPath="/models/cardiovascular/cardiovascular-full.glb"
                highlightedPart={highlightedPart}
                selectedPart={selectedPart}
                onPartClick={handlePartClick}
                systemType="cardiovascular"
                onModelLoad={(failed) =>
                  handleModelLoad("cardiovascular", failed)
                }
                wireframe={wireframe}
                opacity={opacity}
              />
            )}

            {visibleParts.includes("respiratory") && (
              <AnatomyModel
                modelPath="/models/respiratory/visceral-full.glb"
                highlightedPart={highlightedPart}
                selectedPart={selectedPart}
                onPartClick={handlePartClick}
                systemType="respiratory"
                onModelLoad={(failed) => handleModelLoad("respiratory", failed)}
                wireframe={wireframe}
                opacity={opacity}
              />
            )}

            {visibleParts.includes("nervous") && (
              <AnatomyModel
                modelPath="/models/nervous/nervous-full.glb"
                highlightedPart={highlightedPart}
                selectedPart={selectedPart}
                onPartClick={handlePartClick}
                systemType="nervous"
                onModelLoad={(failed) => handleModelLoad("nervous", failed)}
                wireframe={wireframe}
                opacity={opacity}
              />
            )}

            {visibleParts.includes("muscular") && (
              <AnatomyModel
                modelPath="/models/muscular/muscles-full.glb"
                highlightedPart={highlightedPart}
                selectedPart={selectedPart}
                onPartClick={handlePartClick}
                systemType="muscular"
                onModelLoad={(failed) => handleModelLoad("muscular", failed)}
                wireframe={wireframe}
                opacity={opacity}
              />
            )}
          </group>

          {/* Ground - positioned below the model */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -8, 0]}
            receiveShadow
          >
            <planeGeometry args={[40, 40]} />
            <shadowMaterial opacity={0.3} />
          </mesh>

          <CameraController
            viewOrientation={currentView}
            controlsRef={cameraControlsRef}
          />

          <ZoomToMesh mesh={selectedMesh} controlsRef={cameraControlsRef} />

          <gridHelper
            args={[40, 40, "#4A5568", "#2D3748"]}
            position={[0, -8, 0]}
          />
        </Suspense>
      </Canvas>

      {/* View Controls Panel */}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs space-y-3">
        <div className="font-bold border-b border-white/20 pb-1">
          View Controls
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-gray-300 mb-1">Transparency</label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
            />
            <div className="text-gray-400 text-xs mt-0.5">
              {Math.round(opacity * 100)}%
            </div>
          </div>

          <button
            onClick={() => setWireframe(!wireframe)}
            className="w-full px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            {wireframe ? "🔲 Solid View" : "🔳 Wireframe"}
          </button>
        </div>
      </div>

      {/* Instructions & Selected Part */}
      <div className="absolute bottom-4 left-4 bg-black/90 text-white px-3 py-2 rounded-lg text-xs space-y-2 max-w-xs border border-cyan-500/30">
        <div className="font-bold text-cyan-400 mb-2">📚 Learning Mode</div>
        <div className="space-y-1 text-gray-300">
          <div>
            🖱️ <span className="text-white">Click</span> any part to study
          </div>
          <div>
            🎯 <span className="text-white">Auto-zoom</span> to selected part
          </div>
          <div>
            🔄 <span className="text-white">Use orientation</span> controls →
          </div>
          <div>
            🔍 <span className="text-white">Scroll</span> for closer inspection
          </div>
        </div>

        {selectedPart && (
          <div className="pt-2 border-t border-cyan-400">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
              ✨ Learning Focus
            </div>
            <div className="text-white font-medium truncate">
              {selectedPart.name}
            </div>
            <div className="text-gray-400 text-xs capitalize mt-0.5">
              {selectedPart.system} system
            </div>
            <div className="text-xs text-gray-300 mt-1 italic">
              Auto-zoomed for detailed study
            </div>
            <button
              onClick={() => setSelectedPart(null)}
              className="mt-2 w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Orientation Control Gizmo */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg">
        <div className="font-bold text-xs mb-2 text-center">
          View Orientation
        </div>
        <div className="relative w-24 h-24">
          {/* Center cube visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/40 transform rotate-45" />
          </div>

          {/* Top (Y) */}
          <button
            onClick={() => setViewOrientation("top")}
            className={`absolute top-0 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded transition-colors ${
              currentView === "top"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Y
          </button>

          {/* Bottom (-Y) */}
          <button
            onClick={() => setViewOrientation("bottom")}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded transition-colors ${
              currentView === "bottom"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            -Y
          </button>

          {/* Left (-X) */}
          <button
            onClick={() => setViewOrientation("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded transition-colors ${
              currentView === "left"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            -X
          </button>

          {/* Right (X) */}
          <button
            onClick={() => setViewOrientation("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded transition-colors ${
              currentView === "right"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            X
          </button>

          {/* Front (Z) - Center */}
          <button
            onClick={() => setViewOrientation("front")}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded transition-colors z-10 ${
              currentView === "front"
                ? "bg-cyan-500 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Z
          </button>
        </div>
      </div>

      {/* System Legend */}
      {visibleParts.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs space-y-2">
          <div className="font-bold mb-2">Active Systems:</div>
          {visibleParts.map((system) => {
            const color = SYSTEM_COLORS[system] || "#FFFFFF";
            return (
              <div key={system} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-white/50"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{system}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
