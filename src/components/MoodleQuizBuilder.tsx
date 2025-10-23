import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, CheckCircle, Loader2 } from "lucide-react";
import {
  MoodleContentService,
  MoodleQuizData,
  MoodleQuestionData,
  MoodleAnswerData,
} from "@/lib/moodle/content";

interface MoodleQuizBuilderProps {
  courseId: number;
  onQuizCreated?: (quizId: number) => void;
  onQuizError?: (error: string) => void;
}

export function MoodleQuizBuilder({
  courseId,
  onQuizCreated,
  onQuizError,
}: MoodleQuizBuilderProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [quizData, setQuizData] = useState<MoodleQuizData>({
    name: "",
    intro: "",
    timeopen: 0,
    timeclose: 0,
    timelimit: 0,
    attempts: 0,
    grademethod: 1,
    questions: [],
  });

  const contentService = new MoodleContentService(
    // This would be injected or created from context
    {} as any // Placeholder - would need proper API service instance
  );

  const addQuestion = () => {
    const newQuestion: MoodleQuestionData = {
      questiontext: "",
      qtype: "multichoice",
      defaultmark: 1,
      answers: [
        { answer: "", fraction: 1, feedback: "" },
        { answer: "", fraction: 0, feedback: "" },
      ],
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (index: number) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (
    index: number,
    field: keyof MoodleQuestionData,
    value: any
  ) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const addAnswer = (questionIndex: number) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: [
                ...(q.answers || []),
                { answer: "", fraction: 0, feedback: "" },
              ],
            }
          : q
      ),
    }));
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: q.answers?.filter((_, ai) => ai !== answerIndex) || [],
            }
          : q
      ),
    }));
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: keyof MoodleAnswerData,
    value: any
  ) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers:
                q.answers?.map((a, ai) =>
                  ai === answerIndex ? { ...a, [field]: value } : a
                ) || [],
            }
          : q
      ),
    }));
  };

  const handleCreateQuiz = async () => {
    if (!quizData.name.trim()) {
      toast({
        title: "Quiz name required",
        description: "Please enter a name for the quiz.",
        variant: "destructive",
      });
      return;
    }

    if (quizData.questions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to the quiz.",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (const question of quizData.questions) {
      if (!question.questiontext.trim()) {
        toast({
          title: "Question text required",
          description: "All questions must have text.",
          variant: "destructive",
        });
        return;
      }

      if (!question.answers || question.answers.length < 2) {
        toast({
          title: "Answers required",
          description: "Each question must have at least 2 answers.",
          variant: "destructive",
        });
        return;
      }

      const hasCorrectAnswer = question.answers.some(
        (answer) => answer.fraction > 0
      );
      if (!hasCorrectAnswer) {
        toast({
          title: "Correct answer required",
          description: "Each question must have at least one correct answer.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      const result = await contentService.createMoodleQuiz(courseId, quizData);

      if (result.success && result.quizId) {
        toast({
          title: "Quiz created successfully",
          description: "Quiz has been created in Moodle course.",
        });

        onQuizCreated?.(result.quizId);

        // Reset form
        setQuizData({
          name: "",
          intro: "",
          timeopen: 0,
          timeclose: 0,
          timelimit: 0,
          attempts: 0,
          grademethod: 1,
          questions: [],
        });
      } else {
        throw new Error(result.error || "Quiz creation failed");
      }
    } catch (error) {
      console.error("Quiz creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Quiz creation failed";

      toast({
        title: "Quiz creation failed",
        description: errorMessage,
        variant: "destructive",
      });

      onQuizError?.(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          Create Quiz for Moodle Course
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-name">Quiz Name *</Label>
            <Input
              id="quiz-name"
              value={quizData.name}
              onChange={(e) =>
                setQuizData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter quiz name"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-intro">Description</Label>
            <Textarea
              id="quiz-intro"
              value={quizData.intro}
              onChange={(e) =>
                setQuizData((prev) => ({ ...prev, intro: e.target.value }))
              }
              placeholder="Enter quiz description"
              disabled={isCreating}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-timelimit">Time Limit (minutes)</Label>
              <Input
                id="quiz-timelimit"
                type="number"
                value={quizData.timelimit}
                onChange={(e) =>
                  setQuizData((prev) => ({
                    ...prev,
                    timelimit: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0 = no limit"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-attempts">Max Attempts</Label>
              <Input
                id="quiz-attempts"
                type="number"
                value={quizData.attempts}
                onChange={(e) =>
                  setQuizData((prev) => ({
                    ...prev,
                    attempts: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0 = unlimited"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Questions</Label>
            <Button onClick={addQuestion} disabled={isCreating} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {quizData.questions.map((question, questionIndex) => (
            <Card key={questionIndex} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Question {questionIndex + 1}
                  </CardTitle>
                  <Button
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={isCreating}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={question.questiontext}
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        "questiontext",
                        e.target.value
                      )
                    }
                    placeholder="Enter your question"
                    disabled={isCreating}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.qtype}
                    onValueChange={(value) =>
                      updateQuestion(questionIndex, "qtype", value)
                    }
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multichoice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="truefalse">True/False</SelectItem>
                      <SelectItem value="shortanswer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={question.defaultmark}
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        "defaultmark",
                        parseFloat(e.target.value) || 1
                      )
                    }
                    placeholder="1"
                    disabled={isCreating}
                    min="0.1"
                    step="0.1"
                  />
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Answers</Label>
                    <Button
                      onClick={() => addAnswer(questionIndex)}
                      disabled={isCreating}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Answer
                    </Button>
                  </div>

                  {question.answers?.map((answer, answerIndex) => (
                    <div
                      key={answerIndex}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={answer.fraction > 0}
                          onChange={() => {
                            // Set this answer as correct and others as incorrect
                            question.answers?.forEach((a, i) => {
                              updateAnswer(
                                questionIndex,
                                i,
                                "fraction",
                                i === answerIndex ? 1 : 0
                              );
                            });
                          }}
                          disabled={isCreating}
                        />
                        <Label className="text-sm">Correct</Label>
                      </div>

                      <Input
                        value={answer.answer}
                        onChange={(e) =>
                          updateAnswer(
                            questionIndex,
                            answerIndex,
                            "answer",
                            e.target.value
                          )
                        }
                        placeholder="Enter answer"
                        disabled={isCreating}
                        className="flex-1"
                      />

                      <Button
                        onClick={() => removeAnswer(questionIndex, answerIndex)}
                        disabled={
                          isCreating || (question.answers?.length || 0) <= 2
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateQuiz}
          disabled={
            !quizData.name.trim() ||
            quizData.questions.length === 0 ||
            isCreating
          }
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create Quiz in Moodle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
