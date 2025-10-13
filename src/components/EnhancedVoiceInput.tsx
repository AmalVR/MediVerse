// Enhanced Voice Input with GCP Speech-to-Text integration

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import type { VoiceCommandResult } from "@/types/anatomy";

interface EnhancedVoiceInputProps {
  onCommand: (command: VoiceCommandResult) => void;
  enableFeedback?: boolean;
}

export function EnhancedVoiceInput({
  onCommand,
  enableFeedback = true,
}: EnhancedVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<HTMLAudioElement | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup
      if (audioFeedback) {
        audioFeedback.pause();
        audioFeedback.src = "";
      }
    };
  }, [audioFeedback]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);

      toast({
        title: "🎤 Listening...",
        description: "Speak your anatomical command",
      });
    } catch (error) {
      console.error("Microphone error:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice commands",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert audio to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];

        if (!base64Audio) {
          throw new Error("Failed to process audio");
        }

        // TODO: Send to GCP Speech-to-Text API
        // For now, using browser API as fallback
        const transcriptResult = await transcribeWithBrowserAPI();

        if (!transcriptResult) {
          throw new Error("No transcript received");
        }

        setTranscript(transcriptResult);

        // Process command via Dialogflow
        const result = await anatomyAPI.processVoiceCommand(transcriptResult);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to process command");
        }

        const command = result.data;

        // Play audio feedback if enabled
        if (enableFeedback && command.success) {
          await playFeedback(getFeedbackText(command));
        }

        onCommand(command);

        toast({
          title: command.success
            ? "✅ Command understood"
            : "❌ Command unclear",
          description: command.success
            ? `Action: ${command.action} ${command.target || ""}`
            : command.errorMsg || "Please try again",
          variant: command.success ? "default" : "destructive",
        });
      };
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process voice command",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback to browser Speech Recognition API
  const transcribeWithBrowserAPI = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      recognition.start();
    });
  };

  const playFeedback = async (text: string) => {
    try {
      const result = await anatomyAPI.getVoiceFeedback(text);

      if (!result.success || !result.data) {
        return;
      }

      const audioUrl = URL.createObjectURL(result.data);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      setAudioFeedback(audio);
      await audio.play();
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const getFeedbackText = (command: VoiceCommandResult): string => {
    const actionMap: Record<string, string> = {
      SHOW: `Showing ${command.target}`,
      HIDE: `Hiding ${command.target}`,
      HIGHLIGHT: `Here is the ${command.target}`,
      ISOLATE: `Isolating ${command.target}`,
      ROTATE: `Rotating ${command.target}`,
      ZOOM: `Zooming ${command.target}`,
      SLICE: `Creating cross-section`,
      RESET: `Resetting view`,
      SYSTEM_TOGGLE: `Toggling ${command.target} system`,
    };

    return actionMap[command.action] || "Command executed";
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="gap-2 w-full"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Processing...</span>
          </>
        ) : isListening ? (
          <>
            <MicOff className="h-5 w-5" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            <span>Voice Command</span>
          </>
        )}
      </Button>

      {transcript && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Last command:
            </span>
          </div>
          <p className="text-sm break-words">"{transcript}"</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">Example commands:</p>
        <ul className="space-y-0.5 pl-4">
          <li>• "Show the skeleton"</li>
          <li>• "Highlight the heart"</li>
          <li>• "Isolate the femur"</li>
          <li>• "Rotate left"</li>
          <li>• "Create cross-section"</li>
        </ul>
      </div>
    </div>
  );
}
