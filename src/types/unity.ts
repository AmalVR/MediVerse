/**
 * Unity WebGL Integration Types
 * Following Interface Segregation Principle - separate interfaces for different concerns
 */

export type UnityAction =
  | "show"
  | "hide"
  | "enable"
  | "disable"
  | "highlight"
  | "isolate"
  | "reset"
  | "rotate"
  | "zoom"
  | "transparency";

export type RotateDirection = "left" | "right" | "up" | "down";
export type ZoomDirection = "in" | "out";

export interface UnityCommand {
  action: string; // Accept any string, will be validated at runtime
  target: string;
}

export interface UnityCommandResult {
  success: boolean;
  command: UnityCommand;
  error?: string;
}

/**
 * Interface for executing commands on Unity WebGL instance
 * Single Responsibility: Only handles command execution
 */
export interface IUnityCommandExecutor {
  executeCommand(command: UnityCommand): UnityCommandResult;
  isReady(): boolean;
}

/**
 * Handle exposed by Unity viewer component
 * Interface Segregation: Only exposes what consumers need
 */
export interface IUnityViewerHandle {
  executeCommand(command: UnityCommand): UnityCommandResult;
  isLoaded(): boolean;
  getLoadingProgress(): number;
}

/**
 * Unity GameObject and method mapping
 * Open/Closed Principle: Easy to extend with new methods
 */
export interface UnityMethodMapping {
  gameObject: string;
  method: string;
}

export const UNITY_METHOD_MAP: Record<string, UnityMethodMapping> = {
  show: { gameObject: "GameManager", method: "ShowSystem" },
  enable: { gameObject: "GameManager", method: "ShowSystem" },
  hide: { gameObject: "GameManager", method: "HideSystem" },
  disable: { gameObject: "GameManager", method: "HideSystem" },
  highlight: { gameObject: "GameManager", method: "HighlightPart" },
  isolate: { gameObject: "GameManager", method: "IsolateSystem" },
  reset: { gameObject: "GameManager", method: "ResetView" },
  rotate: { gameObject: "GameManager", method: "RotateView" },
  zoom: { gameObject: "GameManager", method: "ZoomView" },
  transparency: { gameObject: "GameManager", method: "SetTransparency" },
} as const;
