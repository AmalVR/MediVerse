import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, ExternalLink } from "lucide-react";

interface UnityPlaceholderProps {
  onRetry?: () => void;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
}

export function UnityPlaceholder({
  onRetry,
  errorMessage,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
}: UnityPlaceholderProps) {
  const canRetry = retryCount < maxRetries;
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b bg-background/50">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">3D Anatomy Viewer</h3>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <Brain className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-yellow-800">
              3D Viewer Unavailable
            </h4>
            <p className="text-sm text-muted-foreground">
              Unity WebGL files are not deployed. You can still use video
              tutorials and AI assistance.
            </p>
          </div>

          {/* Error Details (if any) */}
          {errorMessage ? (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-left">
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-left">
              <p className="text-xs text-blue-700">
                The 3D viewer requires Unity WebGL build files to be deployed to
                the server.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {onRetry && canRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                disabled={isRetrying}
              >
                <Download
                  className={`mr-1 h-3 w-3 ${isRetrying ? "animate-spin" : ""}`}
                />
                {isRetrying
                  ? "Retrying..."
                  : `Retry (${retryCount}/${maxRetries})`}
              </Button>
            )}
            {!canRetry && retryCount > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Maximum retry attempts reached
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/MediVerse/MediVerse"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Help
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-muted/30 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Deploy Unity WebGL files to{" "}
            <code className="bg-muted px-1 rounded text-xs">
              /public/unity/Build/
            </code>{" "}
            to enable 3D viewer
          </p>
        </div>
      </div>
    </div>
  );
}
