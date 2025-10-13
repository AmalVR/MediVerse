import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface VoiceCommand {
  action: string;
  target?: string;
  success?: boolean;
  errorMsg?: string;
}

interface VoiceInputProps {
  onCommand: (command: VoiceCommand) => void;
}

export function VoiceInput({ onCommand }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognitionAPI =
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognition;
          SpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your anatomical command",
      });
    };

    recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);

      try {
        // Process via Dialogflow API
        const result = await anatomyAPI.processVoiceCommand(transcript);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to process command");
        }

        const command = result.data;

        if (command.success) {
          onCommand(command);
          toast({
            title: "Command understood",
            description: `Action: ${command.action} ${command.target || ""}`,
          });
        } else {
          toast({
            title: "Command unclear",
            description: command.errorMsg || "Please try again",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing command:", error);
        toast({
          title: "Error",
          description: "Failed to process voice command",
          variant: "destructive",
        });
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Speech recognition failed. Please try again.",
        variant: "destructive",
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="gap-2 w-full"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Stop Listening</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Voice Command</span>
          </>
        )}
      </Button>
      {transcript && (
        <p className="text-xs sm:text-sm text-muted-foreground break-words">
          Last command: "{transcript}"
        </p>
      )}
    </div>
  );
}
