import {
  AnatomyCommand,
  CommandResult,
  ICommandProcessor,
  IOntologyService,
} from "../types";

export class AnatomyCommandProcessor implements ICommandProcessor {
  constructor(private ontologyService: IOntologyService) {}

  canProcess(command: AnatomyCommand): boolean {
    return ["show", "hide", "highlight", "isolate"].includes(command.action);
  }

  async process(command: AnatomyCommand): Promise<CommandResult> {
    try {
      // 1. Resolve the anatomy part
      const resolvedPartId = await this.ontologyService.resolveAnatomyPart(
        command.target
      );

      if (!resolvedPartId) {
        return {
          success: false,
          command,
          error: `Could not resolve anatomy part: ${command.target}`,
        };
      }

      // 2. Validate the part exists
      const isValid = await this.ontologyService.validateAnatomyPart(
        resolvedPartId
      );

      if (!isValid) {
        return {
          success: false,
          command,
          error: `Invalid anatomy part: ${resolvedPartId}`,
        };
      }

      // 3. Get the system for the part
      const system = await this.ontologyService.getSystemForPart(
        resolvedPartId
      );

      // 4. Return success with resolved information
      return {
        success: true,
        command: {
          ...command,
          target: resolvedPartId,
          metadata: {
            originalTarget: command.target,
            system,
          },
        },
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
