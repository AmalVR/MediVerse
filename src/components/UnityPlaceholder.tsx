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
  const isIncompleteBuild =
    errorMessage?.includes("framework") ||
    errorMessage?.includes("wasm") ||
    errorMessage?.includes("corrupt");

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
          {/* Info Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-blue-800">
              {isIncompleteBuild
                ? "Unity Build Incomplete"
                : "3D Viewer Optional"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isIncompleteBuild
                ? "The Unity WebGL build is missing required files. You can still explore anatomy through videos and AI interactive learning."
                : "The 3D anatomy viewer is currently unavailable, but you can still explore anatomy through videos and AI interactive learning."}
            </p>
          </div>

          {/* Error Details (if any) */}
          {errorMessage ? (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-left">
              <div className="flex items-start gap-2">
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Technical Details:</p>
                  <p className="text-yellow-700">{errorMessage}</p>
                  {isIncompleteBuild && (
                    <p className="text-yellow-600 mt-2 text-xs">
                      <strong>Solution:</strong> Rebuild Unity WebGL with all
                      required files (framework.js.unityweb, wasm.unityweb)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-left">
              <p className="text-xs text-green-700">
                This feature is optional. You can continue using all other
                learning features.
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
            <strong>Continue Learning:</strong> Explore anatomy through videos,
            AI interactive learning, and live sessions
          </p>
        </div>
      </div>
    </div>
  );
}
