/**
 * Student Course Enrollment Component
 *
 * This component allows students to browse, enroll in, and access
 * anatomy learning courses.
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Play,
  CheckCircle,
  Star,
  Filter,
  GraduationCap,
  Target,
  Award,
} from "lucide-react";
import { moodleCourseService, AnatomyCourse } from "@/lib/moodle";
import { moodleAuth } from "@/lib/moodle";

interface StudentCourseEnrollmentProps {
  className?: string;
}

export const StudentCourseEnrollment: React.FC<
  StudentCourseEnrollmentProps
> = ({ className = "" }) => {
  const [courses, setCourses] = useState<AnatomyCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<AnatomyCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const user = moodleAuth.getCurrentUser();

  useEffect(() => {
    if (user?.isStudent) {
      loadCourses();
      loadEnrolledCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courseList = await moodleCourseService.getAnatomyCourses();
      setCourses(courseList.filter((course) => course.isPublished));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const enrolledList = await moodleCourseService.getStudentCourses();
      setEnrolledCourses(enrolledList);
    } catch (err) {
      console.error("Failed to load enrolled courses:", err);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await moodleCourseService.enrollStudent(courseId);
      await loadEnrolledCourses();
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll in course"
      );
    }
  };

  const handleUnenroll = async (courseId: number) => {
    if (!confirm("Are you sure you want to unenroll from this course?")) return;

    try {
      await moodleCourseService.unenrollStudent(courseId);
      await loadEnrolledCourses();
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to unenroll from course"
      );
    }
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const isEnrolled = (courseId: number) => {
    return enrolledCourses.some((course) => course.id === courseId);
  };

  if (!user?.isStudent) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Student Access Required
            </h3>
            <p className="text-muted-foreground">
              Only students can access course enrollment features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Anatomy Learning Courses</h2>
        <p className="text-muted-foreground">
          Discover and enroll in interactive anatomy courses
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="cardiovascular">Cardiovascular</option>
              <option value="muscular">Muscular</option>
              <option value="nervous">Nervous</option>
              <option value="respiratory">Respiratory</option>
              <option value="skeleton">Skeleton</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            My Enrolled Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category}
                    </Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {course.duration} weeks
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(course.startDate)} -{" "}
                      {formatDate(course.endDate)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Continue Learning
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnenroll(course.id)}
                    >
                      Unenroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Available Courses
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {course.shortName}
                  </CardDescription>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category}
                    </Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    {course.price > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        <DollarSign className="h-3 w-3 mr-1" />${course.price}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {course.duration} weeks
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {course.enrollmentCount} / {course.maxEnrollments}{" "}
                      students
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(course.startDate)} -{" "}
                      {formatDate(course.endDate)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isEnrolled(course.id) ? (
                      <Button size="sm" className="flex-1" disabled>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEnroll(course.id)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Enroll Now
                      </Button>
                    )}

                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new
                  courses.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentCourseEnrollment;
