/**
 * Core command types and interfaces
 */

export type CommandSource = "voice" | "ui" | "nlp" | "api";

export type CommandAction =
  | "show"
  | "hide"
  | "highlight"
  | "isolate"
  | "reset"
  | "rotate"
  | "zoom"
  | "transparency";

export interface AnatomyCommand {
  id: string;
  source: CommandSource;
  action: CommandAction;
  target: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface CommandResult {
  success: boolean;
  command: AnatomyCommand;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Command Processor Interface (Strategy Pattern)
export interface ICommandProcessor {
  canProcess(command: AnatomyCommand): boolean;
  process(command: AnatomyCommand): Promise<CommandResult>;
}

// Command Validator Interface
export interface ICommandValidator {
  validate(command: AnatomyCommand): Promise<boolean>;
  getValidationErrors(command: AnatomyCommand): Promise<string[]>;
}

// Command Queue Interface
export interface ICommandQueue {
  enqueue(command: AnatomyCommand): void;
  dequeue(): AnatomyCommand | undefined;
  peek(): AnatomyCommand | undefined;
  clear(): void;
  size(): number;
}

// Command History Interface
export interface ICommandHistory {
  add(result: CommandResult): void;
  getLastCommand(): CommandResult | undefined;
  undo(): Promise<void>;
  redo(): Promise<void>;
  clear(): void;
}

// Ontology Service Interface
export interface IOntologyService {
  resolveAnatomyPart(term: string): Promise<string | null>;
  validateAnatomyPart(partId: string): Promise<boolean>;
  getRelatedParts(partId: string): Promise<string[]>;
  getSystemForPart(partId: string): Promise<string | null>;
}

// Viewer Interface
export interface IAnatomyViewer {
  executeCommand(command: AnatomyCommand): Promise<void>;
  isReady(): boolean;
  getState(): Record<string, unknown>;
}

// Command Broker Interface
export interface ICommandBroker {
  registerProcessor(processor: ICommandProcessor): void;
  registerValidator(validator: ICommandValidator): void;
  registerViewer(viewer: IAnatomyViewer): void;
  execute(command: AnatomyCommand): Promise<CommandResult>;
  executeAsync(command: AnatomyCommand): void;
}
