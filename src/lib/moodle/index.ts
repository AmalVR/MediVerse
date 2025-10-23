/**
 * Moodle Integration Services
 *
 * This module provides a complete integration with Moodle LMS,
 * including authentication, course management, and API services.
 */

export { moodleAPI, MoodleAPIError } from "./api";
export type {
  MoodleUser,
  MoodleCourse,
  MoodleEnrollment,
  MoodleQuiz,
  MoodleQuizAttempt,
  MoodleGrade,
} from "./api";

export { moodleAuth, MoodleAuthError } from "./auth";
export type { AuthUser, OAuthConfig } from "./auth";

export { moodleCourseService, MoodleCourseError } from "./course";
export type { AnatomyCourse, CourseEnrollment } from "./course";

export { MoodleContentService } from "./content";
export type {
  MoodleVideoMetadata,
  MoodleQuizData,
  MoodleQuestionData,
  MoodleAnswerData,
  MoodleAssignmentData,
  MoodleCourseContent,
  MoodleModule,
  MoodleFileContent,
} from "./content";

export { MoodleSyncService } from "./sync";
export type { SyncSessionData, SyncContentData, SyncResult } from "./sync";

// Re-export for convenience
export { env } from "../env";
