import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Users, Brain, Video, Book } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  // Force refresh to clear cache

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 px-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              MediVerse AI
            </h1>
          </div>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Interactive 3D anatomy learning with real-time collaboration and
            voice-driven navigation
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-2">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Book className="h-6 w-6 text-primary" />
                Learn Mode
              </CardTitle>
              <CardDescription>
                Self-paced learning with AI assistance and interactive 3D models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/learn")}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-accent">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                Teach Mode
              </CardTitle>
              <CardDescription>
                Create courses, upload videos, and host live teaching sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/teach")}
                size="lg"
                variant="secondary"
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:opacity-90"
              >
                Start Teaching
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                Group Study
              </CardTitle>
              <CardDescription>
                Collaborate with peers, schedule sessions, and share content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/group-study")}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90"
              >
                Join Groups
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            Powered by Z-Anatomy • Built with React Three Fiber
          </p>
        </div>
      </div>
    </div>
  );
}
