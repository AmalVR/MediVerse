/**
 * Unity Build Preloader
 * Handles smart preloading of Unity builds based on user interaction and network conditions
 */

import { getNetworkInfo, type NetworkSpeed } from "./network-detection";

interface PreloadConfig {
  pcBuildPath: string;
  mobileBuildPath: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface PreloadStats {
  startTime: number;
  endTime?: number;
  bytesLoaded: number;
  totalBytes: number;
  speed: NetworkSpeed;
}

const UNITY_FILES = [
  "Build.data.unityweb",
  "Build.framework.js.unityweb",
  "Build.wasm.unityweb",
];

class UnityPreloader {
  private preloadQueue: string[] = [];
  private isPreloading = false;
  private abortController: AbortController | null = null;
  private stats: PreloadStats | null = null;

  /**
   * Start preloading Unity build files
   */
  async preload(config: PreloadConfig): Promise<void> {
    if (this.isPreloading) {
      console.log("[Preloader] Already preloading");
      return;
    }

    const { speed } = getNetworkInfo();
    this.stats = {
      startTime: Date.now(),
      bytesLoaded: 0,
      totalBytes: 0,
      speed,
    };

    // Determine build path based on platform
    const buildPath = this.isMobileDevice()
      ? config.mobileBuildPath
      : config.pcBuildPath;

    // Create list of files to preload
    this.preloadQueue = UNITY_FILES.map((file) => `${buildPath}/${file}`);

    try {
      this.isPreloading = true;
      this.abortController = new AbortController();

      // Start preloading files in parallel with limits
      await this.preloadFiles(config);

      this.stats.endTime = Date.now();
      config.onComplete?.();
    } catch (error) {
      if (error instanceof Error) {
        config.onError?.(error);
      }
    } finally {
      this.isPreloading = false;
      this.abortController = null;
    }
  }

  /**
   * Cancel ongoing preload
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.isPreloading = false;
      this.preloadQueue = [];
      this.stats = null;
    }
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Preload files with progress tracking
   */
  private async preloadFiles(config: PreloadConfig): Promise<void> {
    const { speed } = getNetworkInfo();
    const maxConcurrent = this.getMaxConcurrentDownloads(speed);
    const chunks: string[][] = [];

    // Split queue into chunks based on concurrency limit
    for (let i = 0; i < this.preloadQueue.length; i += maxConcurrent) {
      chunks.push(this.preloadQueue.slice(i, i + maxConcurrent));
    }

    let totalLoaded = 0;

    // Process chunks sequentially, but files within chunk in parallel
    for (const chunk of chunks) {
      const chunkPromises = chunk.map((url) =>
        this.preloadFile(url, (loaded, total) => {
          if (this.stats) {
            this.stats.bytesLoaded = totalLoaded + loaded;
            this.stats.totalBytes = Math.max(this.stats.totalBytes, total);
          }

          const progress = (totalLoaded + loaded) / total;
          config.onProgress?.(progress * 100);
        })
      );

      const chunkResults = await Promise.all(chunkPromises);
      totalLoaded += chunkResults.reduce((sum, bytes) => sum + bytes, 0);
    }
  }

  /**
   * Preload single file with progress
   */
  private async preloadFile(
    url: string,
    onProgress: (loaded: number, total: number) => void
  ): Promise<number> {
    if (!this.abortController) return 0;

    const response = await fetch(url, {
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to preload ${url}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const contentLength = Number(response.headers.get("Content-Length")) || 0;
    let loaded = 0;

    if (!reader) return 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      loaded += value.length;
      onProgress(loaded, contentLength);

      // Store in browser cache
      await this.cacheResponse(url, response.clone());
    }

    return loaded;
  }

  /**
   * Cache response in browser cache
   */
  private async cacheResponse(url: string, response: Response): Promise<void> {
    const cache = await caches.open("unity-builds");
    await cache.put(url, response);
  }

  /**
   * Get maximum concurrent downloads based on network speed
   */
  private getMaxConcurrentDownloads(speed: NetworkSpeed): number {
    switch (speed) {
      case "fast":
        return 3;
      case "medium":
        return 2;
      case "slow":
      case "offline":
        return 1;
      default:
        return 2;
    }
  }

  /**
   * Get preload statistics
   */
  getStats(): PreloadStats | null {
    return this.stats;
  }

  /**
   * Check if file is already cached
   */
  async isCached(url: string): Promise<boolean> {
    const cache = await caches.open("unity-builds");
    const response = await cache.match(url);
    return !!response;
  }

  /**
   * Clear cached files
   */
  async clearCache(): Promise<void> {
    const cache = await caches.open("unity-builds");
    await cache.keys().then((keys) => keys.forEach((key) => cache.delete(key)));
  }
}

export const unityPreloader = new UnityPreloader();
