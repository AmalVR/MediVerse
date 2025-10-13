// Type-safe API layer for anatomy operations

import type {
  AnatomyPart,
  AnatomySynonym,
  VoiceCommandResult,
  ViewerState,
  SessionState,
  AnatomySystem,
} from "@/types/anatomy";

// API Response wrapper
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AnatomyAPI {
  private baseURL: string;

  constructor(baseURL = import.meta.env.VITE_API_URL || "/api") {
    this.baseURL = baseURL;
  }

  /**
   * Fetch anatomy parts by system
   */
  async getPartsBySystem(
    system: AnatomySystem
  ): Promise<APIResponse<AnatomyPart[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/anatomy/parts?system=${system}`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search anatomy parts
   */
  async searchParts(
    query: string,
    limit = 10
  ): Promise<APIResponse<AnatomyPart[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/anatomy/search?q=${encodeURIComponent(
          query
        )}&limit=${limit}`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get part by ID
   */
  async getPartById(partId: string): Promise<APIResponse<AnatomyPart>> {
    try {
      const response = await fetch(`${this.baseURL}/anatomy/parts/${partId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all synonyms for a part
   */
  async getSynonyms(partId: string): Promise<APIResponse<AnatomySynonym[]>> {
    try {
      const response = await fetch(
        `${this.baseURL}/anatomy/parts/${partId}/synonyms`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process voice command via Dialogflow
   */
  async processVoiceCommand(
    transcript: string
  ): Promise<APIResponse<VoiceCommandResult>> {
    try {
      const response = await fetch(`${this.baseURL}/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get audio feedback for command
   */
  async getVoiceFeedback(text: string): Promise<APIResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseURL}/voice/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create teaching session
   */
  async createSession(
    title: string,
    teacherId: string
  ): Promise<APIResponse<SessionState>> {
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, teacherId }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Join session by code
   */
  async joinSession(
    code: string,
    studentId: string
  ): Promise<APIResponse<SessionState>> {
    try {
      const response = await fetch(`${this.baseURL}/sessions/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, studentId }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update session viewer state
   */
  async updateSessionState(
    sessionId: string,
    viewerState: Partial<ViewerState>
  ): Promise<APIResponse<SessionState>> {
    try {
      const response = await fetch(
        `${this.baseURL}/sessions/${sessionId}/state`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewerState }),
        }
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<APIResponse<void>> {
    try {
      await fetch(`${this.baseURL}/sessions/${sessionId}/end`, {
        method: "POST",
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(
        `${this.baseURL}/sessions/${sessionId}/analytics`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const anatomyAPI = new AnatomyAPI();
