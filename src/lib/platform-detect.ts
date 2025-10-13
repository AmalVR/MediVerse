/**
 * Platform detection utility for Z-Anatomy Unity builds
 * Detects device type and selects appropriate Unity build (PC vs Mobile)
 */

export type PlatformType = "desktop" | "mobile" | "tablet";
export type UnityBuildType = "pc" | "mobile";

export function detectPlatform(): PlatformType {
  // Check if running on mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Check if tablet
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(
    navigator.userAgent
  );

  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
}

export function detectUnityBuild(): UnityBuildType {
  const platform = detectPlatform();

  // Use mobile build for mobile and tablet devices
  // Use PC build for desktop
  return platform === "desktop" ? "pc" : "mobile";
}

export function isTouchDevice(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - legacy property
    navigator.msMaxTouchPoints > 0
  );
}

export function getDeviceInfo() {
  const platform = detectPlatform();
  const unityBuild = detectUnityBuild();
  const hasTouch = isTouchDevice();

  return {
    platform,
    unityBuild,
    hasTouch,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

export function getUnityBuildPath(buildType?: UnityBuildType): string {
  const build = buildType || detectUnityBuild();

  return build === "pc" ? "/unity/pc-build" : "/unity/mobile-build";
}
