/**
 * Educational content types
 */

export type ContentType = "video" | "note" | "quiz" | "question_paper";

export interface EducationalContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  authorId: string;
  systemId?: string; // Related anatomy system
  partId?: string; // Related anatomy part
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoTutorial extends EducationalContent {
  type: "video";
  url: string;
  duration: number; // in seconds
  thumbnailUrl?: string;
  transcription?: string;
}

export interface Note extends EducationalContent {
  type: "note";
  content: string;
  attachments?: string[]; // URLs to attached files
}

export interface QuestionPaper extends EducationalContent {
  type: "question_paper";
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore?: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  partId?: string; // For part identification questions
  imageUrl?: string; // For visual questions
}

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "part_identification"
  | "matching"
  | "short_answer";

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface PartIdentificationChallenge {
  id: string;
  title: string;
  description?: string;
  systemId: string;
  parts: string[]; // Array of part IDs to identify
  timeLimit?: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
}

// Service interfaces
export interface IContentManager {
  uploadContent(content: Partial<EducationalContent>): Promise<string>;
  getContent(id: string): Promise<EducationalContent | null>;
  listContent(filters?: ContentFilters): Promise<EducationalContent[]>;
  updateContent(
    id: string,
    updates: Partial<EducationalContent>
  ): Promise<void>;
  deleteContent(id: string): Promise<void>;
}

export interface IQuizManager {
  createQuiz(quiz: Partial<QuestionPaper>): Promise<string>;
  startQuiz(quizId: string, studentId: string): Promise<QuizAttempt>;
  submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<void>;
  gradeQuiz(attemptId: string): Promise<number>;
  getQuizResults(quizId: string): Promise<QuizAttempt[]>;
}

export interface IPartIdentificationManager {
  createChallenge(
    challenge: Partial<PartIdentificationChallenge>
  ): Promise<string>;
  startChallenge(challengeId: string, studentId: string): Promise<string>;
  submitIdentification(
    attemptId: string,
    partId: string,
    answer: string
  ): Promise<boolean>;
  getChallengeResults(challengeId: string): Promise<
    {
      attemptId: string;
      student: {
        id: string;
        name: string;
      };
      accuracy: number;
      correctIdentifications: number;
      totalParts: number;
      timeSpent: number;
      completedAt: Date;
    }[]
  >;
}

export interface ContentFilters {
  type?: ContentType;
  authorId?: string;
  systemId?: string;
  partId?: string;
  tags?: string[];
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
