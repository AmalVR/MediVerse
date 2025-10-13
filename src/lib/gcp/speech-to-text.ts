// GCP Speech-to-Text integration for voice input

import { SpeechClient } from "@google-cloud/speech";
import { Readable } from "stream";

export class SpeechToTextService {
  private client: SpeechClient;
  private encoding: "LINEAR16" | "WEBM_OPUS" = "LINEAR16";
  private sampleRateHertz = 16000;
  private languageCode = "en-US";

  constructor(credentials?: string) {
    this.client = new SpeechClient(
      credentials ? { keyFilename: credentials } : undefined
    );
  }

  /**
   * Streaming speech recognition for real-time voice input
   */
  async streamingRecognize(audioStream: Readable): Promise<string> {
    const request = {
      config: {
        encoding: this.encoding,
        sampleRateHertz: this.sampleRateHertz,
        languageCode: this.languageCode,
        enableAutomaticPunctuation: true,
        model: "medical_conversation", // Medical-specific model for better anatomy term recognition
      },
      interimResults: false,
    };

    return new Promise((resolve, reject) => {
      const recognizeStream = this.client
        .streamingRecognize(request as any)
        .on("error", reject)
        .on("data", (data: any) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            resolve(data.results[0].alternatives[0].transcript);
          }
        });

      audioStream.pipe(recognizeStream);
    });
  }

  /**
   * Simple audio file/blob transcription
   */
  async transcribeAudio(audioContent: Buffer | string): Promise<string> {
    const audio = {
      content:
        typeof audioContent === "string"
          ? audioContent
          : audioContent.toString("base64"),
    };

    const config = {
      encoding: this.encoding,
      sampleRateHertz: this.sampleRateHertz,
      languageCode: this.languageCode,
      enableAutomaticPunctuation: true,
      model: "medical_conversation",
    };

    const request = {
      audio,
      config,
    };

    const [response] = await this.client.recognize(request as any);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .join("\n");

    return transcription || "";
  }

  /**
   * Multi-language support for anatomy terms
   */
  setLanguage(languageCode: string) {
    this.languageCode = languageCode;
  }

  /**
   * Adjust for different audio formats from web
   */
  setAudioConfig(encoding: "LINEAR16" | "WEBM_OPUS", sampleRate: number) {
    this.encoding = encoding;
    this.sampleRateHertz = sampleRate;
  }
}

export const speechToText = new SpeechToTextService(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
