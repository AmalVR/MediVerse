// WebSocket client for real-time session synchronization

import { io, Socket } from "socket.io-client";
import type { WSMessage, WSMessageType, ViewerState } from "@/types/anatomy";

type MessageHandler<T = any> = (data: T) => void;

export class SessionSyncClient {
  private socket: Socket | null = null;
  private handlers: Map<WSMessageType, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private serverUrl: string = import.meta.env.VITE_WS_URL ||
      "http://localhost:3001"
  ) {}

  /**
   * Connect to WebSocket server
   */
  connect(sessionId: string, userId: string, role: "teacher" | "student") {
    if (this.socket?.connected) {
      console.log("Already connected");
      return;
    }

    this.socket = io(this.serverUrl, {
      auth: {
        sessionId,
        userId,
        role,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(
        `Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`
      );
    });

    // Handle incoming messages
    this.socket.on("message", (message: WSMessage) => {
      this.handleMessage(message);
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: WSMessage) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }
  }

  /**
   * Subscribe to message type
   */
  on<T = any>(type: WSMessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Send viewer state update (teacher only)
   */
  updateViewerState(sessionId: string, state: ViewerState) {
    this.send({
      type: "VIEWER_STATE_CHANGE",
      sessionId,
      data: state,
      timestamp: Date.now(),
    });
  }

  /**
   * Send command executed event
   */
  sendCommandExecuted(sessionId: string, command: any) {
    this.send({
      type: "COMMAND_EXECUTED",
      sessionId,
      data: command,
      timestamp: Date.now(),
    });
  }

  /**
   * Notify student joined
   */
  notifyStudentJoined(sessionId: string, studentId: string) {
    this.send({
      type: "STUDENT_JOINED",
      sessionId,
      data: { studentId },
      timestamp: Date.now(),
    });
  }

  /**
   * Notify student left
   */
  notifyStudentLeft(sessionId: string, studentId: string) {
    this.send({
      type: "STUDENT_LEFT",
      sessionId,
      data: { studentId },
      timestamp: Date.now(),
    });
  }

  /**
   * Send message to server
   */
  private send(message: WSMessage) {
    if (!this.socket?.connected) {
      console.warn("WebSocket not connected, message not sent:", message);
      return;
    }

    this.socket.emit("message", message);
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
export const sessionSync = new SessionSyncClient();
