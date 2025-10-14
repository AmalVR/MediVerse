import { AnatomyCommand, CommandResult, ICommandProcessor } from "../types";

export class ViewCommandProcessor implements ICommandProcessor {
  canProcess(command: AnatomyCommand): boolean {
    return ["rotate", "zoom", "reset", "transparency"].includes(command.action);
  }

  async process(command: AnatomyCommand): Promise<CommandResult> {
    try {
      // Validate view commands
      switch (command.action) {
        case "rotate":
          if (!["left", "right", "up", "down"].includes(command.target)) {
            return {
              success: false,
              command,
              error: "Invalid rotation direction",
            };
          }
          break;

        case "zoom":
          if (!["in", "out"].includes(command.target)) {
            return {
              success: false,
              command,
              error: "Invalid zoom direction",
            };
          }
          break;

        case "transparency":
          const value = parseInt(command.target);
          if (isNaN(value) || value < 0 || value > 100) {
            return {
              success: false,
              command,
              error: "Transparency must be between 0 and 100",
            };
          }
          break;
      }

      return {
        success: true,
        command,
      };
    } catch (error) {
      return {
        success: false,
        command,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
