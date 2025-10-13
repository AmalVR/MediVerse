// Type-safe anatomy types for Z-Anatomy integration

export enum AnatomySystem {
  SKELETAL = "SKELETAL",
  MUSCULAR = "MUSCULAR",
  NERVOUS = "NERVOUS",
  CARDIOVASCULAR = "CARDIOVASCULAR",
  RESPIRATORY = "RESPIRATORY",
  DIGESTIVE = "DIGESTIVE",
  URINARY = "URINARY",
  REPRODUCTIVE = "REPRODUCTIVE",
  ENDOCRINE = "ENDOCRINE",
  LYMPHATIC = "LYMPHATIC",
  INTEGUMENTARY = "INTEGUMENTARY",
}

export enum CommandAction {
  SHOW = "SHOW",
  HIDE = "HIDE",
  HIGHLIGHT = "HIGHLIGHT",
  ISOLATE = "ISOLATE",
  ROTATE = "ROTATE",
  ZOOM = "ZOOM",
  SLICE = "SLICE",
  RESET = "RESET",
  SYSTEM_TOGGLE = "SYSTEM_TOGGLE",
}

export interface LODLevels {
  low: string;
  medium: string;
  high: string;
}

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
  center: { x: number; y: number; z: number };
  radius: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AnatomyPart {
  id: string;
  partId: string;
  name: string;
  latinName?: string;
  system: AnatomySystem;
  parentId?: string;
  modelPath?: string;
  lodLevels?: LODLevels;
  boundingBox?: BoundingBox;
}

export interface AnatomySynonym {
  id: string;
  partId: string;
  synonym: string;
  language: string;
  priority: number;
}

export interface ViewerState {
  highlightedPart?: string;
  cameraPosition: Vector3D;
  modelRotation: Vector3D;
  visibleSystems: AnatomySystem[];
  slicePosition?: {
    axis: "x" | "y" | "z";
    position: number;
  };
  isolatedPart?: string;
}

export interface VoiceCommandResult {
  success: boolean;
  action: CommandAction;
  target?: string;
  transcript: string;
  confidence?: number;
  intent?: string;
  errorMsg?: string;
}

export interface SessionState {
  id: string;
  code: string;
  title: string;
  isActive: boolean;
  viewerState: ViewerState;
  teacherId: string;
}

// GCP Dialogflow types
export interface DialogflowIntent {
  displayName: string;
  trainingPhrases: string[];
  parameters: {
    name: string;
    entityType: string;
    required: boolean;
  }[];
}

export interface NLPResponse {
  intent: string;
  confidence: number;
  parameters: Record<string, unknown>;
  fulfillmentText?: string;
}

// WebSocket message types
export enum WSMessageType {
  SESSION_UPDATE = "SESSION_UPDATE",
  VIEWER_STATE_CHANGE = "VIEWER_STATE_CHANGE",
  COMMAND_EXECUTED = "COMMAND_EXECUTED",
  STUDENT_JOINED = "STUDENT_JOINED",
  STUDENT_LEFT = "STUDENT_LEFT",
}

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  sessionId: string;
  data: T;
  timestamp: number;
}
