// GCP Text-to-Speech for voice feedback

import { TextToSpeechClient } from "@google-cloud/text-to-speech";

export class TextToSpeechService {
  private client: TextToSpeechClient;

  constructor(credentials?: string) {
    this.client = new TextToSpeechClient(
      credentials ? { keyFilename: credentials } : undefined
    );
  }

  /**
   * Convert text to speech audio
   */
  async synthesize(
    text: string,
    options: {
      languageCode?: string;
      voiceName?: string;
      gender?: "MALE" | "FEMALE" | "NEUTRAL";
      audioEncoding?: "MP3" | "LINEAR16" | "OGG_OPUS";
    } = {}
  ): Promise<Buffer> {
    const {
      languageCode = "en-US",
      voiceName,
      gender = "NEUTRAL",
      audioEncoding = "MP3",
    } = options;

    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender: gender,
      },
      audioConfig: {
        audioEncoding,
        speakingRate: 1.0,
        pitch: 0.0,
      },
    };

    const [response] = await this.client.synthesizeSpeech(request as any);

    if (!response.audioContent) {
      throw new Error("No audio content received");
    }

    return Buffer.from(response.audioContent as Uint8Array);
  }

  /**
   * Pre-generate common anatomy feedback phrases
   */
  async generateAnatomyFeedback(
    partName: string,
    action: "show" | "hide" | "highlight" | "isolate"
  ): Promise<Buffer> {
    const feedbackMap = {
      show: `Showing ${partName}`,
      hide: `Hiding ${partName}`,
      highlight: `Here is the ${partName}`,
      isolate: `Isolating ${partName}`,
    };

    return this.synthesize(feedbackMap[action]);
  }

  /**
   * Generate error feedback
   */
  async generateErrorFeedback(message: string): Promise<Buffer> {
    return this.synthesize(message, {
      gender: "FEMALE",
      audioEncoding: "MP3",
    });
  }
}

export const textToSpeech = new TextToSpeechService(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
