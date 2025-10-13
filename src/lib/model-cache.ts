/**
 * Browser-side model caching using IndexedDB
 * Decompresses DRACO models once and caches them for instant loading
 */

import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";

const DB_NAME = "mediverse-models";
const DB_VERSION = 1;
const STORE_NAME = "decompressed-models";

interface CachedModel {
  url: string;
  timestamp: number;
  geometry: ArrayBuffer; // Serialized THREE.BufferGeometry
  version: string;
}

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

// Get cached model from IndexedDB
async function getCachedModel(url: string): Promise<THREE.Group | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(url);

      request.onsuccess = () => {
        const cached = request.result as CachedModel | undefined;
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if cache is older than 7 days
        const age = Date.now() - cached.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (age > maxAge) {
          console.log(`🗑️ Cache expired for ${url}`);
          resolve(null);
          return;
        }

        console.log(
          `✅ Cache hit for ${url} (${(age / 1000 / 60).toFixed(
            0
          )} minutes old)`
        );

        // Deserialize the cached geometry back to THREE.Group
        try {
          const loader = new THREE.ObjectLoader();
          const parsed = loader.parse(
            JSON.parse(new TextDecoder().decode(cached.geometry))
          );
          resolve(parsed as THREE.Group);
        } catch (error) {
          console.error("Failed to parse cached model:", error);
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB error:", error);
    return null;
  }
}

// Cache model to IndexedDB
async function cacheModel(url: string, model: THREE.Group): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Serialize the THREE.Group to JSON
    const serialized = model.toJSON();
    const geometry = new TextEncoder().encode(JSON.stringify(serialized));

    const cached: CachedModel = {
      url,
      timestamp: Date.now(),
      geometry: geometry.buffer,
      version: "1.0",
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cached);
      request.onsuccess = () => {
        console.log(
          `💾 Cached model: ${url} (${(
            geometry.byteLength /
            1024 /
            1024
          ).toFixed(2)} MB)`
        );
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to cache model:", error);
  }
}

// Load model with caching
export async function loadModelWithCache(
  url: string,
  onProgress?: (progress: number) => void
): Promise<THREE.Group> {
  // 1. Try to get from cache first
  const cached = await getCachedModel(url);
  if (cached) {
    if (onProgress) onProgress(100);
    return cached;
  }

  // 2. Cache miss - load from network
  console.log(`📥 Loading model from network: ${url}`);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // Try with DRACO first
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    let retryWithoutDraco = false;

    loader.load(
      url,
      async (gltf) => {
        const model = gltf.scene;

        // Cache the decompressed model for next time
        await cacheModel(url, model);

        if (onProgress) onProgress(100);
        resolve(model);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        if (onProgress) onProgress(percent);
      },
      async (error) => {
        const errorMsg = error.message || String(error);
        const isWasmError =
          errorMsg.includes("WebAssembly") ||
          errorMsg.includes("Out of memory") ||
          errorMsg.includes("DRACO");

        if (isWasmError && !retryWithoutDraco) {
          console.warn(
            `⚠️ DRACO failed for ${url}, trying without compression...`
          );
          retryWithoutDraco = true;

          // Try loading without DRACO (will fail if model requires DRACO)
          const basicLoader = new GLTFLoader();
          basicLoader.load(
            url,
            async (gltf) => {
              const model = gltf.scene;
              await cacheModel(url, model);
              if (onProgress) onProgress(100);
              resolve(model);
            },
            (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              if (onProgress) onProgress(percent);
            },
            (retryError) => {
              console.error(`❌ Both DRACO and non-DRACO failed for ${url}`);
              reject(
                new Error(
                  `Model requires DRACO but WASM failed. Please re-export without DRACO compression. See WASM_MEMORY_FIX.md`
                )
              );
            }
          );
        } else {
          console.error(`Failed to load ${url}:`, error);
          reject(error);
        }
      }
    );
  });
}

// Clear all cached models (for debugging/maintenance)
export async function clearModelCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log("🗑️ Model cache cleared");
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

// Get cache stats
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
  models: string[];
}> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const all = request.result as CachedModel[];
        const totalSize = all.reduce(
          (sum, item) => sum + item.geometry.byteLength,
          0
        );
        const models = all.map((item) => item.url);

        resolve({
          count: all.length,
          totalSize,
          models,
        });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return { count: 0, totalSize: 0, models: [] };
  }
}
