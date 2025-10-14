import {
  AnatomyCommand,
  CommandResult,
  ICommandBroker,
  ICommandProcessor,
  ICommandValidator,
  IAnatomyViewer,
  ICommandQueue,
  ICommandHistory,
} from "./types";

/**
 * Command Queue Implementation
 */
class CommandQueue implements ICommandQueue {
  private queue: AnatomyCommand[] = [];

  enqueue(command: AnatomyCommand): void {
    this.queue.push(command);
  }

  dequeue(): AnatomyCommand | undefined {
    return this.queue.shift();
  }

  peek(): AnatomyCommand | undefined {
    return this.queue[0];
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }
}

/**
 * Command History Implementation
 */
class CommandHistory implements ICommandHistory {
  private history: CommandResult[] = [];
  private currentIndex = -1;

  add(result: CommandResult): void {
    // Remove any redoable commands when a new command is added
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(result);
    this.currentIndex++;
  }

  getLastCommand(): CommandResult | undefined {
    return this.history[this.currentIndex];
  }

  async undo(): Promise<void> {
    if (this.currentIndex >= 0) {
      // TODO: Implement undo logic
      this.currentIndex--;
    }
  }

  async redo(): Promise<void> {
    if (this.currentIndex < this.history.length - 1) {
      // TODO: Implement redo logic
      this.currentIndex++;
    }
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

/**
 * Command Broker Implementation
 */
export class CommandBroker implements ICommandBroker {
  private processors: ICommandProcessor[] = [];
  private validators: ICommandValidator[] = [];
  private viewers: IAnatomyViewer[] = [];
  private commandQueue: ICommandQueue;
  private commandHistory: ICommandHistory;

  constructor() {
    this.commandQueue = new CommandQueue();
    this.commandHistory = new CommandHistory();
  }

  registerProcessor(processor: ICommandProcessor): void {
    this.processors.push(processor);
  }

  registerValidator(validator: ICommandValidator): void {
    this.validators.push(validator);
  }

  registerViewer(viewer: IAnatomyViewer): void {
    this.viewers.push(viewer);
  }

  async execute(command: AnatomyCommand): Promise<CommandResult> {
    try {
      // 1. Validate command
      const validationErrors = await this.validateCommand(command);
      if (validationErrors.length > 0) {
        return {
          success: false,
          command,
          error: validationErrors.join(", "),
        };
      }

      // 2. Find appropriate processor
      const processor = this.findProcessor(command);
      if (!processor) {
        return {
          success: false,
          command,
          error: "No processor found for command",
        };
      }

      // 3. Process command
      const result = await processor.process(command);

      // 4. If successful, execute on viewers
      if (result.success) {
        await this.executeOnViewers(command);
      }

      // 5. Add to history
      this.commandHistory.add(result);

      return result;
    } catch (error) {
      return {
        success: false,
        command,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  executeAsync(command: AnatomyCommand): void {
    this.commandQueue.enqueue(command);
    this.processQueue();
  }

  private async validateCommand(command: AnatomyCommand): Promise<string[]> {
    const errors: string[] = [];

    for (const validator of this.validators) {
      const validationErrors = await validator.getValidationErrors(command);
      errors.push(...validationErrors);
    }

    return errors;
  }

  private findProcessor(
    command: AnatomyCommand
  ): ICommandProcessor | undefined {
    return this.processors.find((p) => p.canProcess(command));
  }

  private async executeOnViewers(command: AnatomyCommand): Promise<void> {
    const readyViewers = this.viewers.filter((v) => v.isReady());
    await Promise.all(readyViewers.map((v) => v.executeCommand(command)));
  }

  private async processQueue(): Promise<void> {
    while (this.commandQueue.size() > 0) {
      const command = this.commandQueue.dequeue();
      if (command) {
        await this.execute(command);
      }
    }
  }
}
