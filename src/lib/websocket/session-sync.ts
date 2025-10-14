import { io, Socket } from "socket.io-client";
import { ViewerState } from "@/lib/api/anatomy-api";
import { config } from "@/lib/config";

class SessionSync {
  private socket: Socket | null = null;

  connect(sessionId: string, userId: string, role: "teacher" | "student") {
    if (this.socket) {
      console.warn("Socket already connected");
      return;
    }

    this.socket = io(config.wsUrl, {
      query: {
        sessionId,
        userId,
        role,
      },
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  updateViewerState(sessionId: string, state: ViewerState) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit("viewer_state_update", {
      sessionId,
      state,
    });
  }

  onViewerStateUpdate(callback: (state: ViewerState) => void) {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.on("viewer_state_update", ({ state }) => {
      callback(state);
    });
  }
}

export const sessionSync = new SessionSync();
