import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, ExternalLink } from "lucide-react";

interface UnityPlaceholderProps {
  onRetry?: () => void;
  errorMessage?: string;
}

export function UnityPlaceholder({
  onRetry,
  errorMessage,
}: UnityPlaceholderProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="p-8 max-w-lg mx-4 text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Brain className="h-16 w-16 text-primary" />
                <div className="absolute -top-2 -right-2 h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-primary"></span>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">3D Anatomy Viewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The interactive 3D anatomy viewer is currently unavailable. This
              feature requires Unity WebGL files to be properly deployed.
            </p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-red-800 mb-2">
                  Error Details:
                </h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Available Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Video tutorials and content sharing</li>
                <li>• Google Classroom integration</li>
                <li>• Live teaching sessions</li>
                <li>• Group study collaboration</li>
                <li>• AI-powered learning assistance</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button onClick={onRetry} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Retry Loading
                </Button>
              )}
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/MediVerse/MediVerse"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Learn More
                </a>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                To enable the 3D viewer, ensure Unity WebGL build files are
                deployed in the{" "}
                <code className="bg-muted px-1 rounded">
                  /public/unity/Build/
                </code>{" "}
                directory.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
