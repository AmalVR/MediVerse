import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  GraduationCap,
  Link,
  Users,
  Calendar,
  BookOpen,
  Plus,
  Video,
  Brain,
} from "lucide-react";

export default function GoogleClassroom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [classes, setClasses] = useState([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Get pre-filled data from URL parameters
  const prefilledTopic = searchParams.get("topic");
  const prefilledTitle = searchParams.get("title");

  useEffect(() => {
    // Check if user is already connected
    const savedEmail = localStorage.getItem("google_classroom_email");
    if (savedEmail) {
      setIsConnected(true);
      setUserEmail(savedEmail);
      loadClasses();
    }

    // If there's a pre-filled title, show the create session form
    if (prefilledTitle) {
      setSessionTitle(decodeURIComponent(prefilledTitle));
      setShowCreateSession(true);
    }
  }, [prefilledTitle]);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    try {
      // In a real implementation, this would use Google OAuth
      // For now, we'll simulate the login process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockEmail = "teacher@school.edu";
      setIsConnected(true);
      setUserEmail(mockEmail);
      localStorage.setItem("google_classroom_email", mockEmail);

      toast({
        title: "Connected!",
        description: "Successfully connected to Google Classroom",
      });

      loadClasses();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Classroom",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const loadClasses = async () => {
    // Mock classes data
    const mockClasses = [
      { id: "1", name: "Anatomy 101", students: 25 },
      { id: "2", name: "Biology Advanced", students: 18 },
      { id: "3", name: "Medical Studies", students: 32 },
    ];
    setClasses(mockClasses);
  };

  const handleCreateLiveSession = () => {
    if (!sessionTitle || !selectedClass) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Live Session Created!",
      description: `"${sessionTitle}" has been scheduled for ${selectedClass}`,
    });

    // Reset form
    setSessionTitle("");
    setSelectedClass("");
    setShowCreateSession(false);
  };

  const handleCreateGroupStudy = () => {
    toast({
      title: "Group Study Created!",
      description: "Group study session has been posted to Google Classroom",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserEmail("");
    setClasses([]);
    localStorage.removeItem("google_classroom_email");
    toast({
      title: "Disconnected",
      description: "Google Classroom account disconnected",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Google Classroom Integration</h1>
            <p className="text-muted-foreground">
              Connect MediVerse with your Google Classroom
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Connect your Google Classroom account to start creating
                      assignments and managing students.
                    </p>
                  </div>
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting
                      ? "Connecting..."
                      : "Login with Google Classroom"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Successfully connected to Google Classroom
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Connected Account</Label>
                    <Input value={userEmail} disabled />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                disabled={!isConnected}
                onClick={() => setShowCreateSession(true)}
              >
                <Video className="h-4 w-4 mr-2" />
                Create Live Session
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!isConnected}
                onClick={handleCreateGroupStudy}
              >
                <Users className="h-4 w-4 mr-2" />
                Create Group Study
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!isConnected}
              >
                <Brain className="h-4 w-4 mr-2" />
                Share 3D Anatomy Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Live Session Modal */}
        {showCreateSession && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-500" />
                Create Live Session
                {prefilledTopic && (
                  <Badge variant="outline" className="ml-2">
                    Based on {prefilledTopic} topic
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefilledTitle && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Suggested Topic
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    This session is based on recent mentor content:{" "}
                    <strong>{prefilledTitle}</strong>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTitle">Session Title</Label>
                  <Input
                    id="sessionTitle"
                    placeholder="e.g., Cardiovascular System Study"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectedClass">Select Class</Label>
                  <select
                    id="selectedClass"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Choose a class...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name} ({cls.students} students)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateLiveSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateSession(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Classes */}
        {isConnected && classes.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Your Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cls.students} students
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedClass(cls.name);
                        setShowCreateSession(true);
                      }}
                    >
                      Create Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Assignment Creation</h3>
                <p className="text-sm text-muted-foreground">
                  Create interactive anatomy assignments directly in Google
                  Classroom
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Student Management</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically sync student rosters and track progress
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Live Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule and manage live anatomy sessions with your class
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium">Connect Account</p>
                <p className="text-sm text-muted-foreground">
                  Link your Google Classroom account to MediVerse
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium">Sync Classes</p>
                <p className="text-sm text-muted-foreground">
                  Import your existing classes and student rosters
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium">Create Assignments</p>
                <p className="text-sm text-muted-foreground">
                  Start creating interactive anatomy assignments for your
                  students
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
