import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clock, Brain, Check, FileQuestion } from "lucide-react";
import type {
  Question,
  QuestionType,
  QuestionPaper,
} from "@/lib/education/types";

interface QuizCreatorProps {
  onSave: (quiz: Partial<QuestionPaper>) => Promise<void>;
}

export function QuizCreator({ onSave }: QuizCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [passingScore, setPassingScore] = useState<number | undefined>();
  const [difficultyLevel, setDifficultyLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple_choice",
        text: "",
        options: ["", ""],
        correctAnswer: "",
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      type: "question_paper",
      title,
      description,
      timeLimit,
      passingScore,
      difficultyLevel,
      questions: questions as Question[],
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTimeLimit(undefined);
    setPassingScore(undefined);
    setQuestions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          Create Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  value={timeLimit || ""}
                  onChange={(e) =>
                    setTimeLimit(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore || ""}
                  onChange={(e) =>
                    setPassingScore(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={difficultyLevel}
                onValueChange={(value) =>
                  setDifficultyLevel(
                    value as "beginner" | "intermediate" | "advanced"
                  )
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
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            updateQuestion(index, {
                              type: value as QuestionType,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">
                              Multiple Choice
                            </SelectItem>
                            <SelectItem value="true_false">
                              True/False
                            </SelectItem>
                            <SelectItem value="part_identification">
                              Part Identification
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(index, {
                              text: e.target.value,
                            })
                          }
                          placeholder="Enter question"
                          rows={2}
                        />
                      </div>

                      {question.type === "multiple_choice" && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options?.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(question.options || []),
                                  ];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(index, {
                                    options: newOptions,
                                  });
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = question.options?.filter(
                                    (_, i) => i !== optIndex
                                  );
                                  updateQuestion(index, {
                                    options: newOptions,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateQuestion(index, {
                                options: [...(question.options || []), ""],
                              });
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        {question.type === "multiple_choice" ? (
                          <Select
                            value={
                              Array.isArray(question.correctAnswer)
                                ? question.correctAnswer[0]
                                : question.correctAnswer
                            }
                            onValueChange={(value) =>
                              updateQuestion(index, {
                                correctAnswer: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options?.map((option, i) => (
                                <SelectItem key={i} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={
                              Array.isArray(question.correctAnswer)
                                ? question.correctAnswer[0]
                                : question.correctAnswer
                            }
                            onChange={(e) =>
                              updateQuestion(index, {
                                correctAnswer: e.target.value,
                              })
                            }
                            placeholder="Enter correct answer"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min={1}
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(index, {
                              points: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Save Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
