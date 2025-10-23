/**
 * Course Management Component
 *
 * This component allows teachers to create, manage, and view anatomy courses
 * integrated with Moodle LMS.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Clock,
  Target,
  Video,
  FileText,
  Upload,
} from "lucide-react";
import { moodleCourseService, AnatomyCourse } from "@/lib/moodle";
import { MoodleVideoUpload } from "./MoodleVideoUpload";
import { MoodleQuizBuilder } from "./MoodleQuizBuilder";
import { MoodleAssignmentCreator } from "./MoodleAssignmentCreator";
import { moodleAuth } from "@/lib/moodle";

interface CourseManagementProps {
  className?: string;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  className = "",
}) => {
  const [courses, setCourses] = useState<AnatomyCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AnatomyCourse | null>(null);
  const [contentType, setContentType] = useState<"video" | "quiz" | "assignment">("video");
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<AnatomyCourse>>({
    name: "",
    shortName: "",
    description: "",
    category: "cardiovascular",
    level: "beginner",
    duration: 8,
    price: 0,
    maxEnrollments: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), // 8 weeks from now
    prerequisites: [],
    learningObjectives: [],
    unityModules: [],
    assessments: [],
  });

  const user = moodleAuth.getCurrentUser();

  useEffect(() => {
    if (user?.isTeacher) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courseList = await moodleCourseService.getAnatomyCourses();
      setCourses(courseList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      const course = await moodleCourseService.createAnatomyCourse(newCourse);
      setCourses((prev) => [course, ...prev]);
      setIsCreateDialogOpen(false);
      setNewCourse({
        name: "",
        shortName: "",
        description: "",
        category: "cardiovascular",
        level: "beginner",
        duration: 8,
        price: 0,
        maxEnrollments: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
        prerequisites: [],
        learningObjectives: [],
        unityModules: [],
        assessments: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await moodleCourseService.deleteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  const handleCreateContent = (course: AnatomyCourse, type: "video" | "quiz" | "assignment") => {
    setSelectedCourse(course);
    setContentType(type);
    setIsContentDialogOpen(true);
  };

  const handleContentCreated = (contentId: number) => {
    // Refresh courses to show updated content
    loadCourses();
    setIsContentDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleContentError = (error: string) => {
    setError(error);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      cardiovascular: "bg-red-100 text-red-800",
      muscular: "bg-orange-100 text-orange-800",
      nervous: "bg-purple-100 text-purple-800",
      respiratory: "bg-blue-100 text-blue-800",
      skeleton: "bg-gray-100 text-gray-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!user?.isTeacher) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Teacher Access Required
            </h3>
            <p className="text-muted-foreground">
              Only teachers can access course management features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">
            Create and manage anatomy learning courses
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Anatomy Course</DialogTitle>
              <DialogDescription>
                Set up a new interactive anatomy learning course
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Cardiovascular System Fundamentals"
                  />
                </div>
                <div>
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={newCourse.shortName}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        shortName: e.target.value,
                      }))
                    }
                    placeholder="e.g., cardio-101"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what students will learn in this course..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(value) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        category: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiovascular">
                        Cardiovascular
                      </SelectItem>
                      <SelectItem value="muscular">Muscular</SelectItem>
                      <SelectItem value="nervous">Nervous</SelectItem>
                      <SelectItem value="respiratory">Respiratory</SelectItem>
                      <SelectItem value="skeleton">Skeleton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={newCourse.level}
                    onValueChange={(value) =>
                      setNewCourse((prev) => ({ ...prev, level: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 8,
                      }))
                    }
                    min="1"
                    max="52"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="maxEnrollments">Max Enrollments</Label>
                  <Input
                    id="maxEnrollments"
                    type="number"
                    value={newCourse.maxEnrollments}
                    onChange={(e) =>
                      setNewCourse((prev) => ({
                        ...prev,
                        maxEnrollments: parseInt(e.target.value) || 50,
                      }))
                    }
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCourse}
                  disabled={loading || !newCourse.name || !newCourse.shortName}
                >
                  {loading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && courses.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {course.shortName}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getCategoryColor(course.category)}>
                    {course.category}
                  </Badge>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {course.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.duration} weeks
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {course.enrollmentCount} / {course.maxEnrollments} students
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(course.startDate)} -{" "}
                    {formatDate(course.endDate)}
                  </div>

                  {course.price > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />${course.price}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>

                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>

                {/* Content Creation Buttons */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateContent(course, "video")}
                      className="flex-1"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Add Video
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateContent(course, "quiz")}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Add Quiz
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateContent(course, "assignment")}
                      className="flex-1"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Add Assignment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {courses.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first anatomy learning course to get started.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Content Creation Dialog */}
    <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add {contentType === "video" ? "Video" : contentType === "quiz" ? "Quiz" : "Assignment"} to Course
          </DialogTitle>
          <DialogDescription>
            {selectedCourse && `Adding content to: ${selectedCourse.name}`}
          </DialogDescription>
        </DialogHeader>
        
        {selectedCourse && (
          <div className="mt-4">
            {contentType === "video" && (
              <MoodleVideoUpload
                courseId={selectedCourse.id}
                onUploadComplete={handleContentCreated}
                onUploadError={handleContentError}
              />
            )}
            
            {contentType === "quiz" && (
              <MoodleQuizBuilder
                courseId={selectedCourse.id}
                onQuizCreated={handleContentCreated}
                onQuizError={handleContentError}
              />
            )}
            
            {contentType === "assignment" && (
              <MoodleAssignmentCreator
                courseId={selectedCourse.id}
                onAssignmentCreated={handleContentCreated}
                onAssignmentError={handleContentError}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

export default CourseManagement;
