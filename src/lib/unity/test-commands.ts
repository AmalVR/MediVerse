/**
 * Unity Command Testing Utilities
 *
 * Use these functions to manually test Unity commands from the browser console
 * or during development.
 */

import type { UnityCommand } from "@/types/unity";

/**
 * Sample commands for testing
 */
export const TEST_COMMANDS: Record<string, UnityCommand[]> = {
  basic: [
    { action: "show", target: "skeletal" },
    { action: "hide", target: "muscular" },
    { action: "highlight", target: "skull" },
    { action: "reset", target: "" },
  ],

  systems: [
    { action: "show", target: "skeletal" },
    { action: "show", target: "muscular" },
    { action: "show", target: "nervous" },
    { action: "show", target: "circulatory" },
    { action: "show", target: "digestive" },
    { action: "show", target: "respiratory" },
  ],

  parts: [
    { action: "highlight", target: "skull" },
    { action: "highlight", target: "femur" },
    { action: "highlight", target: "humerus" },
    { action: "highlight", target: "spine" },
    { action: "highlight", target: "ribs" },
  ],

  camera: [
    { action: "rotate", target: "left" },
    { action: "rotate", target: "right" },
    { action: "rotate", target: "up" },
    { action: "rotate", target: "down" },
    { action: "zoom", target: "in" },
    { action: "zoom", target: "out" },
    { action: "reset", target: "" },
  ],

  transparency: [
    { action: "transparency", target: "0" }, // Opaque
    { action: "transparency", target: "25" },
    { action: "transparency", target: "50" },
    { action: "transparency", target: "75" },
    { action: "transparency", target: "100" }, // Fully transparent
  ],
};

/**
 * Execute a sequence of commands with delays
 *
 * @param commands Array of commands to execute
 * @param executeCommand Function to execute each command
 * @param delayMs Delay between commands in milliseconds
 */
export async function executeCommandSequence(
  commands: UnityCommand[],
  executeCommand: (cmd: UnityCommand) => void,
  delayMs: number = 1000
): Promise<void> {
  for (const command of commands) {
    console.log(`[Test] Executing: ${command.action} ${command.target}`);
    executeCommand(command);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Run a demo showcasing different systems
 */
export async function runSystemDemo(
  executeCommand: (cmd: UnityCommand) => void
): Promise<void> {
  console.log("[Test] Starting system demo...");

  const demo: UnityCommand[] = [
    { action: "reset", target: "" },
    { action: "show", target: "skeletal" },
    { action: "highlight", target: "skull" },
    { action: "zoom", target: "in" },
    { action: "rotate", target: "left" },
    { action: "rotate", target: "left" },
    { action: "zoom", target: "out" },
    { action: "transparency", target: "50" },
    { action: "show", target: "muscular" },
    { action: "transparency", target: "0" },
    { action: "reset", target: "" },
  ];

  await executeCommandSequence(demo, executeCommand, 2000);
  console.log("[Test] Demo complete!");
}

/**
 * Validate a command structure
 */
export function validateCommand(command: unknown): command is UnityCommand {
  if (typeof command !== "object" || command === null) {
    return false;
  }

  const cmd = command as Record<string, unknown>;

  return (
    typeof cmd.action === "string" &&
    typeof cmd.target === "string" &&
    cmd.action.length > 0
  );
}

/**
 * Create a command builder for easier testing
 */
export class UnityCommandBuilder {
  private command: Partial<UnityCommand> = {};

  action(action: string): this {
    this.command.action = action;
    return this;
  }

  target(target: string): this {
    this.command.target = target;
    return this;
  }

  build(): UnityCommand {
    if (!this.command.action || this.command.target === undefined) {
      throw new Error("Command must have both action and target");
    }

    return this.command as UnityCommand;
  }

  static show(target: string): UnityCommand {
    return new UnityCommandBuilder().action("show").target(target).build();
  }

  static hide(target: string): UnityCommand {
    return new UnityCommandBuilder().action("hide").target(target).build();
  }

  static highlight(target: string): UnityCommand {
    return new UnityCommandBuilder().action("highlight").target(target).build();
  }

  static rotate(direction: string): UnityCommand {
    return new UnityCommandBuilder().action("rotate").target(direction).build();
  }

  static zoom(direction: string): UnityCommand {
    return new UnityCommandBuilder().action("zoom").target(direction).build();
  }

  static transparency(level: number): UnityCommand {
    return new UnityCommandBuilder()
      .action("transparency")
      .target(level.toString())
      .build();
  }

  static reset(): UnityCommand {
    return new UnityCommandBuilder().action("reset").target("").build();
  }
}

// Export for browser console testing
if (typeof window !== "undefined") {
  (window as any).UnityTestCommands = {
    TEST_COMMANDS,
    executeCommandSequence,
    runSystemDemo,
    UnityCommandBuilder,
  };
  console.log(
    "[Unity Test] Test utilities loaded. Access via window.UnityTestCommands"
  );
}
