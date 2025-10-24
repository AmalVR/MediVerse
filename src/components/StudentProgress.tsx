import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/UserContext";
import { moodleAPI, MoodleQuizAttempt, MoodleGrade } from "@/lib/moodle";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  Brain,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Star,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

interface StudentProgressProps {
  courseId?: number;
  className?: string;
}

interface ProgressData {
  courseId: number;
  courseName: string;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalTimeSpent: number;
  lastActivity: Date;
  quizAttempts: MoodleQuizAttempt[];
  grades: MoodleGrade[];
}

interface AnalyticsData {
  totalCourses: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalStudyTime: number;
  streakDays: number;
  lastWeekActivity: Array<{
    date: string;
    quizzes: number;
    timeSpent: number;
  }>;
  subjectBreakdown: Array<{
    subject: string;
    score: number;
    attempts: number;
  }>;
}

export function StudentProgress({
  courseId,
  className = "",
}: StudentProgressProps) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | "all">(
    courseId || "all"
  );
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    loadProgressData();
  }, [user, selectedCourse, timeRange]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.moodleUserId) {
        throw new Error("User not authenticated with Moodle");
      }

      // Load user's courses
      const courses = await moodleAPI.getUserCourses(user.moodleUserId);

      // Load progress data for each course
      const progressPromises = courses.map(async (course) => {
        const quizAttempts = await moodleAPI.getUserQuizAttempts(
          user.moodleUserId,
          course.id
        );
        const grades = await moodleAPI.getUserGrades(
          user.moodleUserId,
          course.id
        );

        const completedQuizzes = quizAttempts.filter(
          (attempt) => attempt.state === "finished"
        ).length;
        const averageScore =
          quizAttempts.length > 0
            ? quizAttempts.reduce(
                (sum, attempt) => sum + (attempt.sumgrades || 0),
                0
              ) / quizAttempts.length
            : 0;

        const totalTimeSpent = quizAttempts.reduce((sum, attempt) => {
          if (attempt.timefinish && attempt.timestart) {
            return sum + (attempt.timefinish - attempt.timestart);
          }
          return sum;
        }, 0);

        const lastActivity =
          quizAttempts.length > 0
            ? new Date(Math.max(...quizAttempts.map((a) => a.timestart * 1000)))
            : new Date();

        return {
          courseId: course.id,
          courseName: course.fullname,
          totalQuizzes:
            course.modules?.filter((m) => m.modname === "quiz").length || 0,
          completedQuizzes,
          averageScore: Math.round(averageScore),
          totalTimeSpent,
          lastActivity,
          quizAttempts,
          grades,
        };
      });

      const progressResults = await Promise.all(progressPromises);
      setProgressData(progressResults);

      // Calculate analytics data
      const analytics: AnalyticsData = {
        totalCourses: courses.length,
        totalQuizzes: progressResults.reduce(
          (sum, p) => sum + p.totalQuizzes,
          0
        ),
        completedQuizzes: progressResults.reduce(
          (sum, p) => sum + p.completedQuizzes,
          0
        ),
        averageScore:
          progressResults.length > 0
            ? Math.round(
                progressResults.reduce((sum, p) => sum + p.averageScore, 0) /
                  progressResults.length
              )
            : 0,
        totalStudyTime: progressResults.reduce(
          (sum, p) => sum + p.totalTimeSpent,
          0
        ),
        streakDays: calculateStreakDays(progressResults),
        lastWeekActivity: generateLastWeekActivity(progressResults),
        subjectBreakdown: generateSubjectBreakdown(progressResults),
      };

      setAnalyticsData(analytics);
    } catch (err) {
      console.error("Error loading progress data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load progress data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreakDays = (progressData: ProgressData[]): number => {
    // Simple streak calculation - count consecutive days with activity
    const activityDates = new Set<string>();
    progressData.forEach((course) => {
      course.quizAttempts.forEach((attempt) => {
        const date = new Date(attempt.timestart * 1000).toDateString();
        activityDates.add(date);
      });
    });

    const sortedDates = Array.from(activityDates).sort().reverse();
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const activityDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor(
        (today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const generateLastWeekActivity = (progressData: ProgressData[]) => {
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    return lastWeek.map((date) => {
      let quizzes = 0;
      let timeSpent = 0;

      progressData.forEach((course) => {
        course.quizAttempts.forEach((attempt) => {
          const attemptDate = new Date(attempt.timestart * 1000)
            .toISOString()
            .split("T")[0];
          if (attemptDate === date) {
            quizzes++;
            if (attempt.timefinish && attempt.timestart) {
              timeSpent += attempt.timefinish - attempt.timestart;
            }
          }
        });
      });

      return {
        date,
        quizzes,
        timeSpent: Math.round(timeSpent / 60), // Convert to minutes
      };
    });
  };

  const generateSubjectBreakdown = (progressData: ProgressData[]) => {
    const subjects: Record<string, { score: number; attempts: number }> = {};

    progressData.forEach((course) => {
      const subject = extractSubjectFromCourseName(course.courseName);
      if (!subjects[subject]) {
        subjects[subject] = { score: 0, attempts: 0 };
      }

      subjects[subject].score += course.averageScore;
      subjects[subject].attempts += course.completedQuizzes;
    });

    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      score: Math.round(
        data.score /
          progressData.filter(
            (p) => extractSubjectFromCourseName(p.courseName) === subject
          ).length
      ),
      attempts: data.attempts,
    }));
  };

  const extractSubjectFromCourseName = (courseName: string): string => {
    const subjects = [
      "Anatomy",
      "Physiology",
      "Pathology",
      "Cardiology",
      "Neurology",
      "General",
    ];
    const found = subjects.find((subject) =>
      courseName.toLowerCase().includes(subject.toLowerCase())
    );
    return found || "General";
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <XCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProgressData =
    selectedCourse === "all"
      ? progressData
      : progressData.filter((p) => p.courseId === selectedCourse);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Progress</h2>
          <p className="text-muted-foreground">
            Track your anatomy learning journey
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedCourse.toString()}
            onValueChange={(value) =>
              setSelectedCourse(value === "all" ? "all" : parseInt(value))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {progressData.map((course) => (
                <SelectItem
                  key={course.courseId}
                  value={course.courseId.toString()}
                >
                  {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={timeRange}
            onValueChange={(value: "week" | "month" | "all") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold">
                    {analyticsData.totalCourses}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed Quizzes
                  </p>
                  <p className="text-2xl font-bold">
                    {analyticsData.completedQuizzes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {analyticsData.totalQuizzes} total
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold">
                    {analyticsData.averageScore}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold">
                    {analyticsData.streakDays}
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Course Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProgressData.map((course) => (
              <Card key={course.courseId}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.courseName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Quiz Completion</span>
                      <span>
                        {course.completedQuizzes}/{course.totalQuizzes}
                      </span>
                    </div>
                    <Progress
                      value={
                        (course.completedQuizzes / course.totalQuizzes) * 100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Average Score</p>
                      <p className="font-semibold">{course.averageScore}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Spent</p>
                      <p className="font-semibold">
                        {formatTime(course.totalTimeSpent)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last activity: {course.lastActivity.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {/* Detailed Course Progress */}
          {filteredProgressData.map((course) => (
            <Card key={course.courseId}>
              <CardHeader>
                <CardTitle>{course.courseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.quizAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            attempt.state === "finished"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {attempt.state === "finished" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Quiz Attempt</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              attempt.timestart * 1000
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {attempt.sumgrades || 0} points
                        </p>
                        <Badge
                          variant={
                            attempt.state === "finished"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {attempt.state}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.lastWeekActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="quizzes"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData?.subjectBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, score }) => `${subject}: ${score}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="score"
                    >
                      {analyticsData?.subjectBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {analyticsData?.subjectBreakdown.map((subject, index) => (
                    <div
                      key={subject.subject}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium">
                          {subject.subject}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subject.score}% ({subject.attempts} attempts)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
