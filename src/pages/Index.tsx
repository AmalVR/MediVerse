import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Brain, Video } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

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
            Interactive 3D anatomy learning with real-time collaboration and voice-driven navigation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-2">
          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <Video className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Live Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time teaching with synchronized 3D models
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Voice Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate anatomy using natural voice commands
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Student Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Take and save notes during live sessions
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Collaborative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Multiple students can join and learn together
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-2">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                I'm a Teacher
              </CardTitle>
              <CardDescription>
                Create and host live anatomy teaching sessions with voice controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/teacher')}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                Start Teaching
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-accent">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-accent" />
                I'm a Student
              </CardTitle>
              <CardDescription>
                Join live sessions, view synchronized 3D models, and take notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/student')}
                size="lg"
                variant="secondary"
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:opacity-90"
              >
                Join Session
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