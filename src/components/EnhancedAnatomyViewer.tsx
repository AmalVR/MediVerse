// Enhanced Anatomy Viewer with Z-Anatomy GLTF models and advanced features

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import type { ViewerState, AnatomySystem } from "@/types/anatomy";

interface EnhancedAnatomyViewerProps {
  viewerState: ViewerState;
  onStateChange?: (state: Partial<ViewerState>) => void;
}

// Anatomical model component with highlighting and effects
function AnatomyModel({
  partId,
  modelPath,
  highlighted,
  isolated,
  opacity = 1,
}: {
  partId: string;
  modelPath: string;
  highlighted: boolean;
  isolated: boolean;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material.isMeshStandardMaterial) {
          material.transparent = true;
          material.opacity = highlighted ? 1 : opacity;
          material.emissive = highlighted
            ? new THREE.Color(0xffaa00)
            : new THREE.Color(0x000000);
          material.emissiveIntensity = highlighted ? 0.5 : 0;
        }
      }
    });
  }, [highlighted, opacity]);

  // Pulsing animation when highlighted
  useFrame((state) => {
    if (highlighted && groupRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      groupRef.current.scale.setScalar(pulse);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Cross-section clipping plane
function CrossSectionPlane({
  axis,
  position,
}: {
  axis: "x" | "y" | "z";
  position: number;
}) {
  const planeRef = useRef<THREE.Plane>(null);

  useEffect(() => {
    const normal = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0
    );

    if (planeRef.current) {
      planeRef.current.set(normal, position);
    }
  }, [axis, position]);

  return null; // Clipping planes are applied via material.clippingPlanes
}

// Camera controller for auto-positioning
function CameraController({
  target,
  position,
}: {
  target?: THREE.Vector3;
  position: THREE.Vector3;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (target && controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [target]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={30}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

export function EnhancedAnatomyViewer({
  viewerState,
  onStateChange,
}: EnhancedAnatomyViewerProps) {
  const [loading, setLoading] = useState(true);

  // Camera position from state
  const cameraPosition = new THREE.Vector3(
    viewerState.cameraPosition.x,
    viewerState.cameraPosition.y,
    viewerState.cameraPosition.z
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white">Loading anatomy models...</div>
        </div>
      )}

      <Canvas
        shadows
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: false,
        }}
        onCreated={() => setLoading(false)}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />

        <Suspense fallback={null}>
          {/* Lighting setup for medical visualization */}
          <ambientLight intensity={0.4} />

          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <directionalLight position={[-10, 5, -5]} intensity={0.5} />

          <spotLight
            position={[0, 10, 0]}
            intensity={0.3}
            angle={0.6}
            penumbra={0.5}
            castShadow
          />

          {/* HDRI Environment for realistic reflections */}
          <Environment preset="studio" />

          {/* Main anatomy models group */}
          <group
            rotation={[
              viewerState.modelRotation.x,
              viewerState.modelRotation.y,
              viewerState.modelRotation.z,
            ]}
          >
            {/* TODO: Load actual Z-Anatomy models here */}
            {/* This is a placeholder - in production, you'd load models from the anatomy database */}

            {/* Example: Skeleton system */}
            {viewerState.visibleSystems.includes(
              "SKELETAL" as AnatomySystem
            ) && (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.5, 2, 0.3]} />
                <meshStandardMaterial
                  color="#e8e8e8"
                  transparent
                  opacity={viewerState.highlightedPart === "skeleton" ? 1 : 0.8}
                  emissive={
                    viewerState.highlightedPart === "skeleton"
                      ? "#ffaa00"
                      : "#000000"
                  }
                  emissiveIntensity={
                    viewerState.highlightedPart === "skeleton" ? 0.5 : 0
                  }
                />
              </mesh>
            )}
          </group>

          {/* Cross-section clipping */}
          {viewerState.slicePosition && (
            <CrossSectionPlane
              axis={viewerState.slicePosition.axis}
              position={viewerState.slicePosition.position}
            />
          )}

          {/* Ground plane and shadows */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          <CameraController
            position={cameraPosition}
            target={
              viewerState.highlightedPart
                ? new THREE.Vector3(0, 0, 0)
                : undefined
            }
          />

          {/* Grid helper */}
          <gridHelper
            args={[20, 20, "#4A5568", "#2D3748"]}
            position={[0, -2, 0]}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
        <div>
          Camera: [{cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)},{" "}
          {cameraPosition.z.toFixed(1)}]
        </div>
        {viewerState.highlightedPart && (
          <div className="mt-1">Highlighted: {viewerState.highlightedPart}</div>
        )}
        <div className="mt-1">Systems: {viewerState.visibleSystems.length}</div>
      </div>

      {/* Controls info */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg text-xs">
        <div>🖱️ Rotate: Left click + drag</div>
        <div>🔍 Zoom: Scroll wheel</div>
        <div>✋ Pan: Right click + drag</div>
      </div>
    </div>
  );
}

// Preload common models
useGLTF.preload("/models/skeleton.glb");
useGLTF.preload("/models/heart.glb");
useGLTF.preload("/models/lungs.glb");
