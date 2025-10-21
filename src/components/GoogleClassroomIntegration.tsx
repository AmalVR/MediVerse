import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  BookOpen,
  Plus,
  Share2,
  LogIn,
  LogOut,
  RefreshCw,
  ExternalLink,
  Calendar,
  FileText,
} from "lucide-react";
import {
  googleClassroom,
  isGoogleClassroomAvailable,
  GoogleClassroomCourse,
  GoogleClassroomAnnouncement,
  GoogleClassroomAssignment,
} from "@/lib/google-classroom";

interface GoogleClassroomIntegrationProps {
  onShareContent?: (courseId: string, content: unknown) => void;
}

export function GoogleClassroomIntegration({
  onShareContent,
}: GoogleClassroomIntegrationProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<GoogleClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [announcements, setAnnouncements] = useState<
    GoogleClassroomAnnouncement[]
  >([]);
  const [assignments, setAssignments] = useState<GoogleClassroomAssignment[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"courses" | "share" | "content">(
    "courses"
  );

  // Share content form
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [shareType, setShareType] = useState<"announcement" | "assignment">(
    "announcement"
  );
  const [shareVideoUrl, setShareVideoUrl] = useState("");
  const [shareThumbnailUrl, setShareThumbnailUrl] = useState("");

  const initializeGoogleClassroom = useCallback(async () => {
    if (!isGoogleClassroomAvailable()) {
      toast({
        title: "Google Classroom not configured",
        description:
          "Please configure Google API credentials in environment variables",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Initializing Google Classroom...");
      await googleClassroom.initialize();
      console.log("Google Classroom initialized successfully");
      setIsInitialized(true);

      // Check if user is already signed in
      const signedIn = googleClassroom.isUserSignedIn();
      console.log("User signed in:", signedIn);
      setIsSignedIn(signedIn);

      if (signedIn) {
        await loadCourses();
      }
    } catch (error) {
      console.error("Failed to initialize Google Classroom:", error);
      toast({
        title: "Initialization failed",
        description: `Failed to initialize Google Classroom: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    // Add a delay to ensure Google scripts are loaded
    const timer = setTimeout(() => {
      initializeGoogleClassroom();
    }, 2000);

    return () => clearTimeout(timer);
  }, [initializeGoogleClassroom]);

  const handleSignIn = async () => {
    if (!isInitialized) {
      toast({
        title: "Service not ready",
        description:
          "Google Classroom service is still initializing. Please wait.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Attempting to sign in...");
      const success = await googleClassroom.signIn();

      if (success) {
        setIsSignedIn(true);
        await loadCourses();
        toast({
          title: "Signed in successfully",
          description: "Connected to Google Classroom",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: "Failed to sign in to Google Classroom",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in error",
        description: `An error occurred during sign in: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleClassroom.signOut();
      setIsSignedIn(false);
      setCourses([]);
      setAnnouncements([]);
      setAssignments([]);
      toast({
        title: "Signed out",
        description: "Disconnected from Google Classroom",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const loadCourses = useCallback(async () => {
    try {
      const coursesList = await googleClassroom.getCourses();
      setCourses(coursesList);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast({
        title: "Failed to load courses",
        description: "Could not retrieve your Google Classroom courses",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadCourseContent = async (courseId: string) => {
    try {
      const [announcementsList, assignmentsList] = await Promise.all([
        googleClassroom.getAnnouncements(courseId),
        googleClassroom.getAssignments(courseId),
      ]);

      setAnnouncements(announcementsList);
      setAssignments(assignmentsList);
    } catch (error) {
      console.error("Failed to load course content:", error);
      toast({
        title: "Failed to load content",
        description: "Could not retrieve course announcements and assignments",
        variant: "destructive",
      });
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    if (courseId) {
      loadCourseContent(courseId);
    }
  };

  const handleShareContent = async () => {
    if (!selectedCourse || !shareTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a course and enter a title",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      await googleClassroom.shareToClassroom(selectedCourse, {
        title: shareTitle,
        description: shareDescription,
        videoUrl: shareVideoUrl,
        thumbnailUrl: shareThumbnailUrl,
        type: shareType,
      });

      toast({
        title: "Content shared successfully",
        description: `${
          shareType === "announcement" ? "Announcement" : "Assignment"
        } shared to Google Classroom`,
      });

      // Reset form
      setShareTitle("");
      setShareDescription("");
      setShareVideoUrl("");
      setShareThumbnailUrl("");

      // Reload course content
      await loadCourseContent(selectedCourse);
    } catch (error) {
      console.error("Failed to share content:", error);
      toast({
        title: "Share failed",
        description: "Failed to share content to Google Classroom",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGoogleClassroomAvailable()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Google Classroom Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Not Configured</h3>
            <p className="text-muted-foreground mb-4">
              Google Classroom integration requires API credentials. Add the
              following environment variables:
            </p>
            <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono">
              <div>VITE_GOOGLE_CLIENT_ID=your_client_id</div>
              <div>VITE_GOOGLE_API_KEY=your_api_key</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Google Classroom Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Initializing...</h3>
            <p className="text-muted-foreground">
              Setting up Google Classroom integration
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Google Classroom Integration
          </div>
          {isSignedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSignIn}
              disabled={isLoading || !isInitialized}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isSignedIn ? (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Connect to Google Classroom
            </h3>
            <p className="text-muted-foreground mb-6">
              Sign in to access your Google Classroom courses and share
              MediVerse content
            </p>
            <Button
              onClick={handleSignIn}
              disabled={isLoading || !isInitialized}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In with Google"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              <Button
                variant={activeTab === "courses" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("courses")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                My Courses
              </Button>
              <Button
                variant={activeTab === "share" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("share")}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Content
              </Button>
              <Button
                variant={activeTab === "content" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("content")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Course Content
              </Button>
            </div>

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Courses</h3>
                  <Button variant="outline" size="sm" onClick={loadCourses}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No courses found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                {course.name}
                              </h4>
                              {course.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {course.enrollmentCode}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(
                                    course.creationTime
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(course.alternateLink, "_blank")
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Share Content Tab */}
            {activeTab === "share" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Share MediVerse Content
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-select">Select Course</Label>
                    <Select
                      value={selectedCourse}
                      onValueChange={handleCourseSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-type">Content Type</Label>
                    <Select
                      value={shareType}
                      onValueChange={(value: "announcement" | "assignment") =>
                        setShareType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-title">Title *</Label>
                    <Input
                      id="share-title"
                      value={shareTitle}
                      onChange={(e) => setShareTitle(e.target.value)}
                      placeholder="Enter content title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-description">Description</Label>
                    <Textarea
                      id="share-description"
                      value={shareDescription}
                      onChange={(e) => setShareDescription(e.target.value)}
                      placeholder="Describe the content..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-video-url">
                      Video URL (Optional)
                    </Label>
                    <Input
                      id="share-video-url"
                      value={shareVideoUrl}
                      onChange={(e) => setShareVideoUrl(e.target.value)}
                      placeholder="https://example.com/video"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="share-thumbnail-url">
                      Thumbnail URL (Optional)
                    </Label>
                    <Input
                      id="share-thumbnail-url"
                      value={shareThumbnailUrl}
                      onChange={(e) => setShareThumbnailUrl(e.target.value)}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  <Button
                    onClick={handleShareContent}
                    disabled={
                      !selectedCourse || !shareTitle.trim() || isLoading
                    }
                    className="w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {isLoading
                      ? "Sharing..."
                      : `Share as ${
                          shareType === "announcement"
                            ? "Announcement"
                            : "Assignment"
                        }`}
                  </Button>
                </div>
              </div>
            )}

            {/* Course Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content-course-select">Select Course</Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={handleCourseSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course to view content" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCourse && (
                  <div className="space-y-6">
                    {/* Announcements */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        Recent Announcements
                      </h4>
                      {announcements.length === 0 ? (
                        <p className="text-muted-foreground">
                          No announcements found
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {announcements.slice(0, 5).map((announcement) => (
                            <Card key={announcement.id}>
                              <CardContent className="p-3">
                                <p className="text-sm">{announcement.text}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(
                                    announcement.creationTime
                                  ).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assignments */}
                    <div>
                      <h4 className="font-semibold mb-3">Recent Assignments</h4>
                      {assignments.length === 0 ? (
                        <p className="text-muted-foreground">
                          No assignments found
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assignments.slice(0, 5).map((assignment) => (
                            <Card key={assignment.id}>
                              <CardContent className="p-3">
                                <h5 className="font-medium text-sm">
                                  {assignment.title}
                                </h5>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {assignment.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(
                                    assignment.creationTime
                                  ).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
