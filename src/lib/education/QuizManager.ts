import { IQuizManager, QuestionPaper, QuizAttempt, Question } from "./types";
import { prisma } from "@/lib/db";

export class QuizManager implements IQuizManager {
  async createQuiz(quiz: Partial<QuestionPaper>): Promise<string> {
    const createdQuiz = await prisma.questionPaper.create({
      data: {
        ...quiz,
        id: undefined,
        questions: {
          create: quiz.questions?.map((q) => ({
            ...q,
            id: undefined,
          })),
        },
      },
    });

    return createdQuiz.id;
  }

  async startQuiz(quizId: string, studentId: string): Promise<QuizAttempt> {
    // Check if student already has an incomplete attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        startedAt: new Date(),
        answers: [],
      },
    });

    return attempt;
  }

  async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<void> {
    // Get the question to check correctness
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Calculate if answer is correct
    const isCorrect = this.checkAnswer(question, answer);

    // Save the answer
    await prisma.quizAnswer.create({
      data: {
        attemptId,
        questionId,
        answer: Array.isArray(answer) ? answer : [answer],
        isCorrect,
        timeSpent: 0, // TODO: Track time spent
      },
    });
  }

  async gradeQuiz(attemptId: string): Promise<number> {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        quiz: true,
      },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const answer of attempt.answers) {
      totalPoints += answer.question.points;
      if (answer.isCorrect) {
        earnedPoints += answer.question.points;
      }
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Update attempt with score and completion time
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        completedAt: new Date(),
      },
    });

    return score;
  }

  async getQuizResults(quizId: string): Promise<QuizAttempt[]> {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId,
        completedAt: { not: null },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
    });

    return attempts;
  }

  private checkAnswer(question: Question, answer: string | string[]): boolean {
    switch (question.type) {
      case "multiple_choice":
      case "true_false":
        return (
          (Array.isArray(question.correctAnswer)
            ? question.correctAnswer[0]
            : question.correctAnswer) ===
          (Array.isArray(answer) ? answer[0] : answer)
        );

      case "part_identification":
        // Case-insensitive comparison for part names
        return (
          question.correctAnswer.toLowerCase() ===
          (Array.isArray(answer) ? answer[0] : answer).toLowerCase()
        );

      case "matching":
        // All pairs must match
        if (!Array.isArray(answer) || !Array.isArray(question.correctAnswer)) {
          return false;
        }
        return (
          answer.length === question.correctAnswer.length &&
          answer.every((a, i) => a === question.correctAnswer[i])
        );

      case "short_answer":
        // Simple exact match for now
        // TODO: Implement more sophisticated answer checking
        return (
          question.correctAnswer.toLowerCase() ===
          (Array.isArray(answer) ? answer[0] : answer).toLowerCase()
        );

      default:
        return false;
    }
  }
}
