// Z-Anatomy GLTF/GLB Model Loader with LOD support

import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import type { GLTF } from "three-stdlib";
import type { LODLevels, BoundingBox } from "@/types/anatomy";

interface LoadedModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  boundingBox: BoundingBox;
}

interface ModelCache {
  [key: string]: {
    high?: LoadedModel;
    medium?: LoadedModel;
    low?: LoadedModel;
  };
}

export class AnatomyModelLoader {
  private loader: GLTFLoader;
  private cache: ModelCache = {};
  private loadingManager: THREE.LoadingManager;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loader = new GLTFLoader(this.loadingManager);

    this.setupLoadingManager();
  }

  private setupLoadingManager() {
    this.loadingManager.onStart = (url, loaded, total) => {
      console.log(`Loading model: ${url} (${loaded}/${total})`);
    };

    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`Progress: ${url} - ${((loaded / total) * 100).toFixed(2)}%`);
    };

    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };
  }

  /**
   * Load Z-Anatomy model with LOD support
   */
  async loadModel(
    partId: string,
    modelPath: string,
    lodLevels?: LODLevels
  ): Promise<THREE.Group> {
    // Check cache first
    if (this.cache[partId]?.high) {
      return this.cache[partId].high!.scene.clone();
    }

    const gltf = await this.loadGLTF(modelPath);
    const model = this.processModel(gltf);

    // Cache the model
    if (!this.cache[partId]) {
      this.cache[partId] = {};
    }
    this.cache[partId].high = model;

    // Load LOD levels if provided
    if (lodLevels) {
      this.loadLODLevels(partId, lodLevels);
    }

    return model.scene;
  }

  /**
   * Load model with automatic LOD selection based on camera distance
   */
  async loadModelWithLOD(
    partId: string,
    lodLevels: LODLevels,
    distance: number
  ): Promise<THREE.Group> {
    const lodLevel = this.selectLODLevel(distance);
    const modelPath = lodLevels[lodLevel];

    // Check cache
    const cached = this.cache[partId]?.[lodLevel];
    if (cached) {
      return cached.scene.clone();
    }

    const gltf = await this.loadGLTF(modelPath);
    const model = this.processModel(gltf);

    // Cache LOD level
    if (!this.cache[partId]) {
      this.cache[partId] = {};
    }
    this.cache[partId][lodLevel] = model;

    return model.scene;
  }

  /**
   * Create THREE.LOD object with all detail levels
   */
  async createLODObject(
    partId: string,
    lodLevels: LODLevels
  ): Promise<THREE.LOD> {
    const lod = new THREE.LOD();

    // Load all LOD levels
    const [high, medium, low] = await Promise.all([
      this.loadGLTF(lodLevels.high),
      this.loadGLTF(lodLevels.medium),
      this.loadGLTF(lodLevels.low),
    ]);

    // Process and add to LOD
    const highModel = this.processModel(high);
    const mediumModel = this.processModel(medium);
    const lowModel = this.processModel(low);

    lod.addLevel(highModel.scene, 0); // 0-5 units
    lod.addLevel(mediumModel.scene, 5); // 5-15 units
    lod.addLevel(lowModel.scene, 15); // 15+ units

    // Cache all levels
    this.cache[partId] = {
      high: highModel,
      medium: mediumModel,
      low: lowModel,
    };

    return lod;
  }

  /**
   * Load GLTF file
   */
  private async loadGLTF(path: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Process loaded model - calculate bounding box, optimize materials
   */
  private processModel(gltf: GLTF): LoadedModel {
    const scene = gltf.scene;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) / 2;

    const boundingBox: BoundingBox = {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
      center: { x: center.x, y: center.y, z: center.z },
      radius,
    };

    // Optimize materials for better performance
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Optimize material
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material.isMeshStandardMaterial) {
            // Adjust for anatomy visualization
            material.transparent = true;
            material.opacity = 0.95;
            material.side = THREE.DoubleSide;
          }
        }
      }
    });

    return {
      scene,
      animations: gltf.animations,
      boundingBox,
    };
  }

  /**
   * Select LOD level based on camera distance
   */
  private selectLODLevel(distance: number): "high" | "medium" | "low" {
    if (distance < 5) return "high";
    if (distance < 15) return "medium";
    return "low";
  }

  /**
   * Preload LOD levels in background
   */
  private async loadLODLevels(partId: string, lodLevels: LODLevels) {
    // Load medium and low in background
    Promise.all([
      this.loadGLTF(lodLevels.medium),
      this.loadGLTF(lodLevels.low),
    ]).then(([medium, low]) => {
      if (!this.cache[partId]) this.cache[partId] = {};
      this.cache[partId].medium = this.processModel(medium);
      this.cache[partId].low = this.processModel(low);
    });
  }

  /**
   * Clear cache to free memory
   */
  clearCache(partId?: string) {
    if (partId) {
      delete this.cache[partId];
    } else {
      this.cache = {};
    }
  }

  /**
   * Get bounding box from cache
   */
  getBoundingBox(
    partId: string,
    level: "high" | "medium" | "low" = "high"
  ): BoundingBox | null {
    return this.cache[partId]?.[level]?.boundingBox || null;
  }
}

export const anatomyModelLoader = new AnatomyModelLoader();
