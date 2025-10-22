/**
 * AI Interactive Panel - Medical Learning Specialist
 * AI-powered anatomy tutor with medical knowledge base integration
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  X,
  Brain,
  BookOpen,
  Stethoscope,
  Activity,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIInteractivePanelProps {
  onCommand: (command: VoiceCommand) => void;
}

// Simple local NLP parser - converts natural language to Unity commands
// TODO: Replace with OpenAI/Claude API for production
function parseLocalCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim();

  // Show/Display commands
  if (lowerText.match(/show|display|enable/)) {
    const systems = [
      "skeletal",
      "muscular",
      "nervous",
      "circulatory",
      "digestive",
      "respiratory",
    ];
    const parts = [
      "skull",
      "femur",
      "humerus",
      "spine",
      "ribs",
      "heart",
      "brain",
    ];

    for (const system of systems) {
      if (lowerText.includes(system)) {
        return { action: "show", target: system, success: true };
      }
    }
    for (const part of parts) {
      if (lowerText.includes(part)) {
        return { action: "show", target: part, success: true };
      }
    }
  }

  // Hide commands
  if (lowerText.match(/hide|remove|disable/)) {
    const systems = [
      "skeletal",
      "muscular",
      "nervous",
      "circulatory",
      "digestive",
      "respiratory",
    ];
    for (const system of systems) {
      if (lowerText.includes(system)) {
        return { action: "hide", target: system, success: true };
      }
    }
  }

  // Highlight commands
  if (lowerText.match(/highlight|focus|emphasize/)) {
    const parts = [
      "skull",
      "femur",
      "humerus",
      "spine",
      "ribs",
      "heart",
      "brain",
    ];
    for (const part of parts) {
      if (lowerText.includes(part)) {
        return { action: "highlight", target: part, success: true };
      }
    }
  }

  // Rotate commands
  if (lowerText.match(/rotate|turn|spin/)) {
    if (lowerText.match(/left/))
      return { action: "rotate", target: "left", success: true };
    if (lowerText.match(/right/))
      return { action: "rotate", target: "right", success: true };
    if (lowerText.match(/up/))
      return { action: "rotate", target: "up", success: true };
    if (lowerText.match(/down/))
      return { action: "rotate", target: "down", success: true };
  }

  // Zoom commands
  if (lowerText.match(/zoom/)) {
    if (lowerText.match(/in|closer/))
      return { action: "zoom", target: "in", success: true };
    if (lowerText.match(/out|away/))
      return { action: "zoom", target: "out", success: true };
  }

  // Reset command
  if (lowerText.match(/reset|default|clear/)) {
    return { action: "reset", target: "", success: true };
  }

  // If no command matched, return error
  return {
    action: "",
    target: "",
    success: false,
    errorMsg:
      "I didn't understand that command. Try: 'show skeletal system', 'highlight femur', 'rotate left', or 'zoom in'.",
  };
}

export function AIInteractivePanel({ onCommand }: AIInteractivePanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🩺 Welcome! I'm your AI medical tutor specialized in anatomy and physiology. I can help you with:\n\n• **Anatomy & Physiology** - Detailed explanations of body systems\n• **Pathology & Disease** - Understanding medical conditions\n• **Clinical Cases** - Real-world medical scenarios\n• **Study Strategies** - Personalized learning approaches\n\nAsk me anything or try commands like 'explain cardiovascular system' or 'show me the heart anatomy'.",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processInput = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Simple local NLP parser (TODO: Replace with OpenAI/Claude for production)
      const command = parseLocalCommand(text);

      // If it's a viewer command, execute it
      if (command.success && command.action) {
        onCommand(command);

        // Add success response
        const response: Message = {
          role: "assistant",
          content: `✓ ${command.action} ${
            command.target || ""
          } - Command executed!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      } else {
        // For questions/learning, would integrate with LLM here
        // For now, provide helpful response
        const response: Message = {
          role: "assistant",
          content:
            command.errorMsg ||
            "I can help you explore anatomy. Try commands like 'show heart', 'rotate left', or ask questions about body systems.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }
    } catch (error) {
      console.error("Error processing input:", error);
      const errorResponse: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processInput(inputText);
  };

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
    };

    recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      await processInput(transcript);
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

  const clearMessages = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hi! I'm your AI anatomy assistant. Ask me anything about the human body, or use commands like 'show skeleton' or 'zoom in'.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20 border-0 shadow-none backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            AI Medical Tutor
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearMessages}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Medical Knowledge Base Categories */}
      <div className="px-4 py-3 border-b border-border/50 bg-background/30">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs"
            onClick={() =>
              setInputText("Explain cardiovascular system anatomy")
            }
          >
            <Stethoscope className="h-3 w-3 mr-1" />
            Cardiovascular
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-green-50 hover:border-green-300 text-xs"
            onClick={() => setInputText("Explain nervous system structure")}
          >
            <Brain className="h-3 w-3 mr-1" />
            Nervous
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 text-xs"
            onClick={() => setInputText("Explain muscular system")}
          >
            <Activity className="h-3 w-3 mr-1" />
            Muscular
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 text-xs"
            onClick={() => setInputText("Explain respiratory system")}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Respiratory
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md",
                message.role === "user"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  : "bg-card border border-border/50"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={cn(
                  "text-xs mt-1 opacity-70",
                  message.role === "user"
                    ? "text-white"
                    : "text-muted-foreground"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-card border border-border/50 shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about anatomy or give commands..."
              disabled={isProcessing || isListening}
              className="pr-12 bg-background border-border/50 focus:border-purple-500 transition-colors"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse [animation-delay:0.1s]" />
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="shrink-0"
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim() || isProcessing || isListening}
            className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Try: "Show the heart" • "Rotate left" • "What is the femur?"
        </p>
      </div>
    </div>
  );
}
