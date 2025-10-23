import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UnityAnatomyViewer } from "@/components/UnityAnatomyViewer";
import { moodleAPI, MoodleQuiz, MoodleQuizAttempt } from "@/lib/moodle";
import { useAuth } from "@/contexts/UserContext";
import {
  Brain,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  BookOpen,
  Trophy,
  Zap,
} from "lucide-react";
import type { IUnityViewerHandle } from "@/types/unity";

interface AnatomyAssessmentProps {
  courseId: number;
  quizId: number;
  onComplete?: (score: number, totalQuestions: number) => void;
  className?: string;
}

interface AssessmentQuestion {
  id: number;
  questionText: string;
  questionType: "multichoice" | "truefalse" | "shortanswer";
  answers: Array<{
    id: number;
    answerText: string;
    fraction: number;
  }>;
  anatomyFocus?: {
    system: string;
    part: string;
    highlightColor?: string;
  };
}

interface AssessmentState {
  currentQuestion: number;
  userAnswers: Record<number, any>;
  timeRemaining: number;
  isStarted: boolean;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
}

export function AnatomyAssessment({
  courseId,
  quizId,
  onComplete,
  className = "",
}: AnatomyAssessmentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const unityRef = useRef<IUnityViewerHandle>(null);

  const [quiz, setQuiz] = useState<MoodleQuiz | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    currentQuestion: 0,
    userAnswers: {},
    timeRemaining: 0,
    isStarted: false,
    isCompleted: false,
    score: 0,
    totalQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnity, setShowUnity] = useState(true);
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null);

  // Load quiz data
  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (
      assessmentState.isStarted &&
      !assessmentState.isCompleted &&
      assessmentState.timeRemaining > 0
    ) {
      const timer = setTimeout(() => {
        setAssessmentState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (
      assessmentState.timeRemaining === 0 &&
      assessmentState.isStarted
    ) {
      handleSubmitAssessment();
    }
  }, [
    assessmentState.isStarted,
    assessmentState.isCompleted,
    assessmentState.timeRemaining,
  ]);

  const loadQuizData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load quiz details
      const quizData = await moodleAPI.getQuiz(quizId);
      setQuiz(quizData);

      // Load quiz questions
      const questionsData = await moodleAPI.getQuizQuestions(quizId);
      const formattedQuestions: AssessmentQuestion[] = questionsData.map(
        (q) => ({
          id: q.id,
          questionText: q.questiontext,
          questionType: q.qtype as "multichoice" | "truefalse" | "shortanswer",
          answers:
            q.answers?.map((a) => ({
              id: a.id,
              answerText: a.answer,
              fraction: a.fraction,
            })) || [],
          anatomyFocus: extractAnatomyFocus(q.questiontext),
        })
      );

      setQuestions(formattedQuestions);
      setAssessmentState((prev) => ({
        ...prev,
        totalQuestions: formattedQuestions.length,
        timeRemaining: quizData.timelimit || 1800, // Default 30 minutes
      }));
    } catch (err) {
      console.error("Error loading quiz data:", err);
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const extractAnatomyFocus = (
    questionText: string
  ): AssessmentQuestion["anatomyFocus"] => {
    // Simple keyword extraction for anatomy focus
    const systems = [
      "cardiovascular",
      "respiratory",
      "nervous",
      "muscular",
      "skeletal",
      "digestive",
    ];
    const parts = [
      "heart",
      "lung",
      "brain",
      "muscle",
      "bone",
      "liver",
      "kidney",
    ];

    const foundSystem = systems.find((s) =>
      questionText.toLowerCase().includes(s)
    );
    const foundPart = parts.find((p) => questionText.toLowerCase().includes(p));

    if (foundSystem || foundPart) {
      return {
        system: foundSystem || "general",
        part: foundPart || "anatomy",
        highlightColor: getSystemColor(foundSystem || "general"),
      };
    }

    return undefined;
  };

  const getSystemColor = (system: string): string => {
    const colors: Record<string, string> = {
      cardiovascular: "#ff6b6b",
      respiratory: "#4ecdc4",
      nervous: "#45b7d1",
      muscular: "#96ceb4",
      skeletal: "#feca57",
      digestive: "#ff9ff3",
      general: "#a4b0be",
    };
    return colors[system] || colors.general;
  };

  const startAssessment = () => {
    setAssessmentState((prev) => ({
      ...prev,
      isStarted: true,
    }));

    toast({
      title: "Assessment Started",
      description: "Good luck! Use the 3D viewer to help answer questions.",
    });
  };

  const handleAnswerSelect = (questionId: number, answer: any) => {
    setAssessmentState((prev) => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: answer,
      },
    }));

    // Highlight relevant anatomy part if available
    const question = questions.find((q) => q.id === questionId);
    if (question?.anatomyFocus) {
      setHighlightedPart(question.anatomyFocus.part);

      // Send highlight command to Unity
      if (unityRef.current) {
        unityRef.current.highlightPart(
          question.anatomyFocus.part,
          question.anatomyFocus.highlightColor
        );
      }
    }
  };

  const nextQuestion = () => {
    if (assessmentState.currentQuestion < questions.length - 1) {
      setAssessmentState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  const previousQuestion = () => {
    if (assessmentState.currentQuestion > 0) {
      setAssessmentState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setIsLoading(true);

      // Calculate score
      let correctAnswers = 0;
      questions.forEach((question) => {
        const userAnswer = assessmentState.userAnswers[question.id];
        if (userAnswer) {
          const correctAnswer = question.answers.find(
            (a) => a.fraction === 1.0
          );
          if (correctAnswer && userAnswer === correctAnswer.id) {
            correctAnswers++;
          }
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      // Submit attempt to Moodle
      const attemptData = {
        quizid: quizId,
        userid: user?.moodleUserId || 0,
        timestart: Math.floor(Date.now() / 1000),
        timefinish: Math.floor(Date.now() / 1000),
        state: "finished",
        answers: Object.entries(assessmentState.userAnswers).map(
          ([questionId, answerId]) => ({
            questionid: parseInt(questionId),
            answerid: answerId,
          })
        ),
      };

      await moodleAPI.submitQuizAttempt(attemptData);

      setAssessmentState((prev) => ({
        ...prev,
        isCompleted: true,
        score,
      }));

      toast({
        title: "Assessment Completed!",
        description: `You scored ${score}% (${correctAnswers}/${questions.length} correct)`,
      });

      onComplete?.(score, questions.length);
    } catch (err) {
      console.error("Error submitting assessment:", err);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssessment = () => {
    setAssessmentState({
      currentQuestion: 0,
      userAnswers: {},
      timeRemaining: quiz?.timelimit || 1800,
      isStarted: false,
      isCompleted: false,
      score: 0,
      totalQuestions: questions.length,
    });
    setHighlightedPart(null);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <Alert className={className}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          No questions available for this assessment.
        </AlertDescription>
      </Alert>
    );
  }

  const currentQuestion = questions[assessmentState.currentQuestion];
  const progress =
    ((assessmentState.currentQuestion + 1) / questions.length) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                {quiz.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive Anatomy Assessment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {assessmentState.totalQuestions} Questions
              </Badge>
              {assessmentState.isStarted && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(assessmentState.timeRemaining)}
                </Badge>
              )}
            </div>
          </div>

          {assessmentState.isStarted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>
                  {assessmentState.currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unity Viewer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                3D Anatomy Viewer
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnity(!showUnity)}
              >
                {showUnity ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showUnity ? (
              <div className="h-96 rounded-lg overflow-hidden">
                <UnityAnatomyViewer
                  ref={unityRef}
                  system={currentQuestion?.anatomyFocus?.system || "general"}
                  highlightedPart={highlightedPart}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">3D viewer hidden</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Question {assessmentState.currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!assessmentState.isStarted ? (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ready to Start?</h3>
                  <p className="text-muted-foreground">
                    This assessment has {questions.length} questions and will
                    test your anatomy knowledge. Use the 3D viewer to help
                    answer questions.
                  </p>
                </div>
                <Button onClick={startAssessment} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            ) : assessmentState.isCompleted ? (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
                  <h3 className="text-lg font-semibold">
                    Assessment Complete!
                  </h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {assessmentState.score}%
                  </div>
                  <p className="text-muted-foreground">
                    You answered{" "}
                    {Math.round(
                      (assessmentState.score / 100) * questions.length
                    )}{" "}
                    out of {questions.length} questions correctly.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={resetAssessment}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {currentQuestion.questionText}
                  </p>

                  {currentQuestion.anatomyFocus && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Focus: {currentQuestion.anatomyFocus.system} -{" "}
                      {currentQuestion.anatomyFocus.part}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {currentQuestion.answers.map((answer) => (
                    <Button
                      key={answer.id}
                      variant={
                        assessmentState.userAnswers[currentQuestion.id] ===
                        answer.id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() =>
                        handleAnswerSelect(currentQuestion.id, answer.id)
                      }
                    >
                      <div className="flex items-center gap-2">
                        {assessmentState.userAnswers[currentQuestion.id] ===
                        answer.id ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-sm">{answer.answerText}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={assessmentState.currentQuestion === 0}
                  >
                    Previous
                  </Button>

                  {assessmentState.currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitAssessment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>Next</Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
