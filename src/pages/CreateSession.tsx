import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { anatomyAPI } from "@/lib/api/anatomy-api";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Users, Calendar } from "lucide-react";

export default function CreateSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    system: "SKELETAL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a session title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const teacherId = `teacher-${Date.now()}`;
      const result = await anatomyAPI.createSession(formData.title, teacherId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create session");
      }

      toast({
        title: "Session created!",
        description: `Session code: ${result.data.code}`,
      });

      navigate(`/teach/session/${result.data.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Live Session</h1>
            <p className="text-muted-foreground">
              Start a new interactive anatomy session
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Cardiovascular System Review"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this session..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Anatomical System</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "SKELETAL",
                    "CARDIOVASCULAR",
                    "NERVOUS",
                    "RESPIRATORY",
                    "MUSCULAR",
                  ].map((system) => (
                    <Button
                      key={system}
                      type="button"
                      variant={
                        formData.system === system ? "default" : "outline"
                      }
                      onClick={() => setFormData({ ...formData, system })}
                      className="justify-start"
                    >
                      {system}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Live Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Students can join with a 6-digit code and interact in
                    real-time
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium">Create Session</p>
                <p className="text-sm text-muted-foreground">
                  Fill out the form above to create your session
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium">Share Code</p>
                <p className="text-sm text-muted-foreground">
                  Students join using the 6-digit session code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium">Teach Together</p>
                <p className="text-sm text-muted-foreground">
                  Guide students through 3D anatomy exploration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
