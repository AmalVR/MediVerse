/**
 * Unity Command Executor
 *
 * Implements Single Responsibility Principle:
 * - Only responsible for executing Unity commands
 *
 * Implements Dependency Inversion Principle:
 * - Depends on abstractions (sendMessage function type)
 */

import type {
  UnityCommand,
  UnityCommandResult,
  IUnityCommandExecutor,
} from "@/types/unity";
import { UNITY_METHOD_MAP } from "@/types/unity";

type SendMessageFn = (
  gameObject: string,
  method: string,
  parameter?: string | number
) => void;

export class UnityCommandExecutor implements IUnityCommandExecutor {
  private sendMessage: SendMessageFn;
  private loaded: boolean;

  constructor(sendMessage: SendMessageFn, isLoaded: boolean) {
    this.sendMessage = sendMessage;
    this.loaded = isLoaded;
  }

  /**
   * Update the loaded state (called when Unity finishes loading)
   */
  updateLoadedState(isLoaded: boolean): void {
    this.loaded = isLoaded;
  }

  /**
   * Check if Unity is ready to receive commands
   */
  isReady(): boolean {
    return this.loaded;
  }

  /**
   * Execute a command on Unity WebGL instance
   *
   * @param command - The command to execute
   * @returns Result indicating success or failure
   */
  executeCommand(command: UnityCommand): UnityCommandResult {
    // Validate Unity is loaded
    if (!this.loaded) {
      const error = "Unity is not loaded yet. Please wait for initialization.";
      console.warn("[UnityCommandExecutor]", error);
      return {
        success: false,
        command,
        error,
      };
    }

    // Validate command action
    const normalizedAction = command.action.toLowerCase();
    const mapping = UNITY_METHOD_MAP[normalizedAction];

    if (!mapping) {
      const error = `Unknown command action: ${command.action}`;
      console.error("[UnityCommandExecutor]", error);
      return {
        success: false,
        command,
        error,
      };
    }

    // Execute command
    try {
      console.log(
        `[UnityCommandExecutor] Executing: ${mapping.gameObject}.${mapping.method}("${command.target}")`
      );

      this.sendMessage(mapping.gameObject, mapping.method, command.target);

      return {
        success: true,
        command,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[UnityCommandExecutor] Error executing command:", error);

      return {
        success: false,
        command,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate command before execution (can be used for pre-flight checks)
   */
  validateCommand(command: UnityCommand): { valid: boolean; error?: string } {
    const normalizedAction = command.action.toLowerCase();

    if (!UNITY_METHOD_MAP[normalizedAction]) {
      return {
        valid: false,
        error: `Invalid action: ${command.action}. Valid actions: ${Object.keys(
          UNITY_METHOD_MAP
        ).join(", ")}`,
      };
    }

    if (
      command.action !== "reset" &&
      (!command.target || command.target.trim() === "")
    ) {
      return {
        valid: false,
        error: "Command target cannot be empty (except for 'reset' action)",
      };
    }

    return { valid: true };
  }
}
