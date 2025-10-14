/**
 * Network speed detection utility
 * Detects connection speed and provides loading strategy recommendations
 */

export type NetworkSpeed = "fast" | "medium" | "slow" | "offline";
export type ConnectionType =
  | "4g"
  | "3g"
  | "2g"
  | "slow-2g"
  | "wifi"
  | "unknown";

interface NetworkInfo {
  speed: NetworkSpeed;
  connectionType: ConnectionType;
  downlink?: number; // Mbps
  effectiveType?: string;
  saveData?: boolean;
}

/**
 * Detect network speed using Navigator Connection API
 */
export function detectNetworkSpeed(): NetworkSpeed {
  // Check if online
  if (!navigator.onLine) {
    return "offline";
  }

  // Use Network Information API if available
  const connection =
    (navigator as Navigator & { connection?: NetworkConnection }).connection ||
    (navigator as Navigator & { mozConnection?: NetworkConnection })
      .mozConnection ||
    (navigator as Navigator & { webkitConnection?: NetworkConnection })
      .webkitConnection;

  if (connection) {
    const effectiveType = connection.effectiveType;

    if (effectiveType === "4g") {
      return "fast";
    } else if (effectiveType === "3g") {
      return "medium";
    } else if (effectiveType === "2g" || effectiveType === "slow-2g") {
      return "slow";
    }
  }

  // Fallback: assume medium speed if we can't detect
  return "medium";
}

/**
 * Get detailed network information
 */
export function getNetworkInfo(): NetworkInfo {
  const connection =
    (navigator as Navigator & { connection?: NetworkConnection }).connection ||
    (navigator as Navigator & { mozConnection?: NetworkConnection })
      .mozConnection ||
    (navigator as Navigator & { webkitConnection?: NetworkConnection })
      .webkitConnection;

  const speed = detectNetworkSpeed();

  if (connection) {
    return {
      speed,
      connectionType: (connection.effectiveType || "unknown") as ConnectionType,
      downlink: connection.downlink,
      effectiveType: connection.effectiveType,
      saveData: connection.saveData,
    };
  }

  return {
    speed,
    connectionType: "unknown",
  };
}

/**
 * Estimate download time in seconds
 */
export function estimateDownloadTime(
  fileSizeMB: number,
  speed: NetworkSpeed
): number {
  // Conservative estimates in Mbps
  const speedMap: Record<NetworkSpeed, number> = {
    fast: 20, // 20 Mbps (4G)
    medium: 5, // 5 Mbps (3G)
    slow: 1, // 1 Mbps (2G)
    offline: 0,
  };

  const mbps = speedMap[speed];
  if (mbps === 0) return Infinity;

  // Convert: (MB * 8 bits/byte) / Mbps = seconds
  return (fileSizeMB * 8) / mbps;
}

/**
 * Check if user is on cellular/metered connection
 */
export function isMeteredConnection(): boolean {
  const connection =
    (navigator as Navigator & { connection?: NetworkConnection }).connection ||
    (navigator as Navigator & { mozConnection?: NetworkConnection })
      .mozConnection ||
    (navigator as Navigator & { webkitConnection?: NetworkConnection })
      .webkitConnection;

  if (connection) {
    // Check if saveData is enabled (user preference)
    if (connection.saveData) return true;

    // Check if connection type is cellular
    const type = connection.type;
    if (type === "cellular") return true;
  }

  return false;
}

/**
 * Listen for network changes
 */
export function onNetworkChange(
  callback: (info: NetworkInfo) => void
): () => void {
  const handleChange = () => {
    callback(getNetworkInfo());
  };

  // Listen to online/offline events
  window.addEventListener("online", handleChange);
  window.addEventListener("offline", handleChange);

  // Listen to connection changes if available
  const connection =
    (navigator as Navigator & { connection?: NetworkConnection }).connection ||
    (navigator as Navigator & { mozConnection?: NetworkConnection })
      .mozConnection ||
    (navigator as Navigator & { webkitConnection?: NetworkConnection })
      .webkitConnection;

  if (connection) {
    connection.addEventListener("change", handleChange);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleChange);
    window.removeEventListener("offline", handleChange);
    if (connection) {
      connection.removeEventListener("change", handleChange);
    }
  };
}

/**
 * Network Connection API types
 */
interface NetworkConnection extends EventTarget {
  type?: string;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Get user-friendly network description
 */
export function getNetworkDescription(info: NetworkInfo): string {
  if (info.speed === "offline") {
    return "You're offline";
  }

  if (info.saveData) {
    return "Data Saver mode enabled";
  }

  const descriptions: Record<NetworkSpeed, string> = {
    fast: "Fast connection detected",
    medium: "Moderate connection detected",
    slow: "Slow connection detected",
    offline: "Offline",
  };

  return descriptions[info.speed];
}

