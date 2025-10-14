/**
 * Anatomy API Types
 */
import type {
  SessionJoinRequest,
  SessionCreateRequest,
  SessionResponse,
  ViewerState,
} from "@/types/anatomy";
import { config } from "@/lib/config";

export interface AnatomyAPI {
  joinSession: (
    code: string,
    studentId: string
  ) => Promise<APIResponse<SessionResponse>>;
  createSession: (
    title: string,
    teacherId: string
  ) => Promise<APIResponse<SessionResponse>>;
  updateSessionState: (
    sessionId: string,
    state: Partial<ViewerState>
  ) => Promise<APIResponse<SessionResponse>>;
  endSession: (sessionId: string) => Promise<APIResponse<void>>;
  processVoiceCommand: (transcript: string) => Promise<
    APIResponse<{
      action: string;
      target: string;
      success: boolean;
      errorMsg?: string;
    }>
  >;
}

export interface ViewerState {
  command?: {
    action: string;
    target: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Anatomy API Client
 */
export const anatomyAPI: AnatomyAPI = {
  joinSession: async (code: string, studentId: string) => {
    try {
      const response = await fetch(`/api/sessions/join`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, studentId }),
      });

      const json = await response.json();

      // Server returns { success: true, data: { id, code, ... } }
      return {
        success: response.ok && json.success,
        data: response.ok && json.data ? json.data : undefined,
        error:
          !response.ok || !json.success
            ? json.error || "Unknown error"
            : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  createSession: async (title: string, teacherId: string) => {
    try {
      const url = `/api/sessions`;
      console.log("[API] Creating session at:", url);

      const response = await fetch(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, teacherId }),
      });

      console.log("[API] Response status:", response.status);

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[API] Non-JSON response:", text.substring(0, 200));
        return {
          success: false,
          error:
            "Server returned non-JSON response. Please check if API server is running.",
        };
      }

      const json = await response.json();
      console.log("[API] Create session response:", json);

      // Server returns { success: true, data: { id, code, ... } }
      return {
        success: response.ok && json.success,
        data: response.ok && json.data ? json.data : undefined,
        error:
          !response.ok || !json.success
            ? json.error || "Unknown error"
            : undefined,
      };
    } catch (error) {
      console.error("[API] Create session error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  updateSessionState: async (
    sessionId: string,
    state: Partial<ViewerState>
  ) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/state`, {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ viewerState: state }),
      });

      const json = await response.json();

      // Server returns { success: true, data: { id, code, ... } }
      return {
        success: response.ok && json.success,
        data: response.ok && json.data ? json.data : undefined,
        error:
          !response.ok || !json.success
            ? json.error || "Unknown error"
            : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  endSession: async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        credentials: "include",
        method: "DELETE",
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  processVoiceCommand: async (transcript: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/nlp/process", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
};
