// GCP Dialogflow integration for NLP intent recognition

import { SessionsClient } from "@google-cloud/dialogflow";
import { CommandAction } from "@/types/anatomy";
import type { NLPResponse, VoiceCommandResult } from "@/types/anatomy";

export class DialogflowService {
  private sessionsClient: SessionsClient;
  private projectId: string;
  private sessionId: string;

  constructor(projectId?: string, credentials?: string) {
    this.projectId = projectId || process.env.VITE_GCP_PROJECT_ID || "";
    this.sessionId = `mediverse-${Date.now()}`;

    this.sessionsClient = new SessionsClient(
      credentials ? { keyFilename: credentials } : undefined
    );
  }

  /**
   * Detect intent from voice transcript
   */
  async detectIntent(transcript: string): Promise<NLPResponse> {
    const sessionPath = this.sessionsClient.projectAgentSessionPath(
      this.projectId,
      this.sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: transcript,
          languageCode: "en-US",
        },
      },
    };

    const [response] = await this.sessionsClient.detectIntent(request);
    const result = response.queryResult;

    if (!result) {
      throw new Error("No query result from Dialogflow");
    }

    return {
      intent: result.intent?.displayName || "unknown",
      confidence: result.intentDetectionConfidence || 0,
      parameters: result.parameters
        ? this.structToObject(result.parameters)
        : {},
      fulfillmentText: result.fulfillmentText || undefined,
    };
  }

  /**
   * Parse Dialogflow response into command
   */
  async parseVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
    try {
      const nlpResponse = await this.detectIntent(transcript);

      // Map intent to command action
      const actionMap: Record<string, CommandAction> = {
        "anatomy.show": CommandAction.SHOW,
        "anatomy.hide": CommandAction.HIDE,
        "anatomy.highlight": CommandAction.HIGHLIGHT,
        "anatomy.isolate": CommandAction.ISOLATE,
        "anatomy.rotate": CommandAction.ROTATE,
        "anatomy.zoom": CommandAction.ZOOM,
        "anatomy.slice": CommandAction.SLICE,
        "anatomy.reset": CommandAction.RESET,
        "anatomy.system": CommandAction.SYSTEM_TOGGLE,
      };

      const action = actionMap[nlpResponse.intent];

      if (!action) {
        return {
          success: false,
          action: CommandAction.SHOW,
          transcript,
          errorMsg: `Unknown intent: ${nlpResponse.intent}`,
        };
      }

      // Extract target from parameters
      const target =
        nlpResponse.parameters.anatomyPart ||
        nlpResponse.parameters.direction ||
        nlpResponse.parameters.system ||
        nlpResponse.parameters.zoomDirection;

      return {
        success: nlpResponse.confidence > 0.6,
        action,
        target,
        transcript,
        confidence: nlpResponse.confidence,
        intent: nlpResponse.intent,
      };
    } catch (error) {
      console.error("Dialogflow error:", error);
      return {
        success: false,
        action: CommandAction.SHOW,
        transcript,
        errorMsg: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create new session for user
   */
  createSession(userId: string) {
    this.sessionId = `mediverse-${userId}-${Date.now()}`;
  }

  /**
   * Helper to convert Dialogflow Struct to plain object
   */
  private structToObject(struct: any): Record<string, any> {
    const result: Record<string, any> = {};

    if (!struct || !struct.fields) return result;

    for (const [key, value] of Object.entries(struct.fields)) {
      const val = value as any;
      if (val.stringValue !== undefined) {
        result[key] = val.stringValue;
      } else if (val.numberValue !== undefined) {
        result[key] = val.numberValue;
      } else if (val.boolValue !== undefined) {
        result[key] = val.boolValue;
      }
    }

    return result;
  }
}

export const dialogflow = new DialogflowService(
  process.env.VITE_GCP_PROJECT_ID,
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
