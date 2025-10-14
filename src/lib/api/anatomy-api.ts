/**
 * Anatomy API Types
 */
export interface AnatomyAPI {
  joinSession: (code: string) => Promise<APIResponse>;
  createSession: (title: string, teacherId: string) => Promise<APIResponse>;
  updateSessionState: (
    sessionId: string,
    state: Partial<ViewerState>
  ) => Promise<APIResponse>;
  endSession: (sessionId: string) => Promise<APIResponse>;
  processVoiceCommand: (transcript: string) => Promise<APIResponse>;
}

export interface ViewerState {
  command?: {
    action: string;
    target: string;
  };
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Anatomy API Client
 */
export const anatomyAPI: AnatomyAPI = {
  joinSession: async (code: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sessions/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
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

  createSession: async (title: string, teacherId: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, teacherId }),
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

  updateSessionState: async (
    sessionId: string,
    state: Partial<ViewerState>
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${sessionId}/state`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state),
        }
      );

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

  endSession: async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );

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
