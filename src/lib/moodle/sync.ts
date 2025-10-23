import { MoodleAPIService } from "./api";
import { MoodleContentService } from "./content";
import { MoodleCourseService } from "./course";

export interface SyncSessionData {
  sessionId: string;
  title: string;
  description?: string;
  anatomySystem?: string;
  highlightedPart?: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncContentData {
  contentId: string;
  title: string;
  type: "video" | "quiz" | "assignment" | "resource";
  content: any;
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  moodleCourseId?: number;
  moodleActivityId?: number;
  error?: string;
}

export class MoodleSyncService {
  private api: MoodleAPIService;
  private contentService: MoodleContentService;
  private courseService: MoodleCourseService;

  constructor(
    api: MoodleAPIService,
    contentService: MoodleContentService,
    courseService: MoodleCourseService
  ) {
    this.api = api;
    this.contentService = contentService;
    this.courseService = courseService;
  }

  /**
   * Sync a MediVerse teaching session to Moodle
   */
  async syncSessionToMoodle(
    sessionData: SyncSessionData,
    courseId?: number
  ): Promise<SyncResult> {
    try {
      let targetCourseId = courseId;

      // Create course if not provided
      if (!targetCourseId) {
        const courseResult = await this.courseService.createAnatomyCourse({
          fullname: `${sessionData.title} - Anatomy Session`,
          shortname: `ANAT-${sessionData.sessionId.substring(0, 8)}`,
          summary:
            sessionData.description ||
            `Anatomy teaching session: ${sessionData.title}`,
          category: this.getAnatomyCategory(sessionData.anatomySystem),
          level: "intermediate",
          duration: "1 hour",
          price: 0, // Free for now
        });

        if (!courseResult.success || !courseResult.courseId) {
          return {
            success: false,
            error: courseResult.error || "Failed to create course",
          };
        }

        targetCourseId = courseResult.courseId;
      }

      // Create a Moodle activity for the session
      const activityResult = await this.createSessionActivity(
        targetCourseId,
        sessionData
      );

      if (!activityResult.success) {
        return {
          success: false,
          error: activityResult.error || "Failed to create session activity",
        };
      }

      return {
        success: true,
        moodleCourseId: targetCourseId,
        moodleActivityId: activityResult.activityId,
      };
    } catch (error) {
      console.error("Error syncing session to Moodle:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Sync content to Moodle course
   */
  async syncContentToMoodle(
    courseId: number,
    contentData: SyncContentData
  ): Promise<SyncResult> {
    try {
      let activityId: number | undefined;

      switch (contentData.type) {
        case "video":
          const videoResult =
            await this.contentService.uploadVideoToMoodleCourse(
              courseId,
              contentData.content.file,
              {
                title: contentData.title,
                description: contentData.metadata?.description,
                tags: contentData.metadata?.tags,
                category: contentData.metadata?.category,
              }
            );

          if (!videoResult.success) {
            return { success: false, error: videoResult.error };
          }

          activityId = videoResult.fileId;
          break;

        case "quiz":
          const quizResult = await this.contentService.createMoodleQuiz(
            courseId,
            contentData.content
          );

          if (!quizResult.success) {
            return { success: false, error: quizResult.error };
          }

          activityId = quizResult.quizId;
          break;

        case "assignment":
          const assignmentResult =
            await this.contentService.createMoodleAssignment(
              courseId,
              contentData.content
            );

          if (!assignmentResult.success) {
            return { success: false, error: assignmentResult.error };
          }

          activityId = assignmentResult.assignmentId;
          break;

        case "resource":
          // Handle resource upload
          const resourceResult =
            await this.contentService.uploadVideoToMoodleCourse(
              courseId,
              contentData.content.file,
              {
                title: contentData.title,
                description: contentData.metadata?.description,
              }
            );

          if (!resourceResult.success) {
            return { success: false, error: resourceResult.error };
          }

          activityId = resourceResult.fileId;
          break;

        default:
          return { success: false, error: "Unsupported content type" };
      }

      return {
        success: true,
        moodleCourseId: courseId,
        moodleActivityId: activityId,
      };
    } catch (error) {
      console.error("Error syncing content to Moodle:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch Moodle content for display in MediVerse
   */
  async fetchMoodleContentForMediVerse(
    courseId: number
  ): Promise<{ success: boolean; content?: any; error?: string }> {
    try {
      const contentResult = await this.contentService.getMoodleCourseContent(
        courseId
      );

      if (!contentResult.success || !contentResult.content) {
        return { success: false, error: contentResult.error };
      }

      // Transform Moodle content to MediVerse format
      const mediVerseContent = this.transformMoodleContentToMediVerse(
        contentResult.content
      );

      return { success: true, content: mediVerseContent };
    } catch (error) {
      console.error("Error fetching Moodle content for MediVerse:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update content in Moodle
   */
  async updateMoodleContent(
    courseId: number,
    moduleId: number,
    contentData: Partial<SyncContentData>
  ): Promise<SyncResult> {
    try {
      // Get current module info
      const moduleResult = await this.api.call(
        "mod_resource_get_resources_by_courses",
        {
          courseids: [courseId],
        }
      );

      if (!moduleResult.success) {
        return { success: false, error: "Failed to fetch module info" };
      }

      // Update the module
      const updateResult = await this.api.call("mod_resource_update_instance", {
        id: moduleId,
        course: courseId,
        name: contentData.title || "",
        intro: contentData.description || "",
        introformat: 1,
        display: 0,
        displayoptions: 'a:1:{s:12:"printintro";i:1;}',
        filterfiles: 0,
        revision: 1,
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!updateResult.success) {
        return { success: false, error: "Failed to update content" };
      }

      return {
        success: true,
        moodleCourseId: courseId,
        moodleActivityId: moduleId,
      };
    } catch (error) {
      console.error("Error updating Moodle content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete content from Moodle
   */
  async deleteMoodleContent(
    courseId: number,
    moduleId: number
  ): Promise<SyncResult> {
    try {
      const deleteResult = await this.contentService.deleteMoodleContent(
        courseId,
        moduleId
      );

      if (!deleteResult.success) {
        return { success: false, error: deleteResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting Moodle content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a session activity in Moodle
   */
  private async createSessionActivity(
    courseId: number,
    sessionData: SyncSessionData
  ): Promise<{ success: boolean; activityId?: number; error?: string }> {
    try {
      // Create a custom activity for the anatomy session
      const activityResult = await this.api.call("mod_resource_add_instance", {
        course: courseId,
        name: `Anatomy Session: ${sessionData.title}`,
        intro: this.formatSessionDescription(sessionData),
        introformat: 1,
        display: 0, // Embed
        displayoptions: 'a:1:{s:12:"printintro";i:1;}',
        filterfiles: 0,
        revision: 1,
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!activityResult.success) {
        return { success: false, error: "Failed to create session activity" };
      }

      return { success: true, activityId: activityResult.instanceid };
    } catch (error) {
      console.error("Error creating session activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get anatomy category based on system
   */
  private getAnatomyCategory(system?: string): string {
    const categoryMap: Record<string, string> = {
      cardiovascular: "Cardiovascular System",
      muscular: "Muscular System",
      nervous: "Nervous System",
      respiratory: "Respiratory System",
      skeleton: "Skeletal System",
    };

    return categoryMap[system || ""] || "General Anatomy";
  }

  /**
   * Format session description for Moodle
   */
  private formatSessionDescription(sessionData: SyncSessionData): string {
    let description = `<h3>Anatomy Teaching Session</h3>`;
    description += `<p><strong>Title:</strong> ${sessionData.title}</p>`;

    if (sessionData.description) {
      description += `<p><strong>Description:</strong> ${sessionData.description}</p>`;
    }

    if (sessionData.anatomySystem) {
      description += `<p><strong>System:</strong> ${this.getAnatomyCategory(
        sessionData.anatomySystem
      )}</p>`;
    }

    if (sessionData.highlightedPart) {
      description += `<p><strong>Focus Area:</strong> ${sessionData.highlightedPart}</p>`;
    }

    description += `<p><strong>Created:</strong> ${sessionData.createdAt.toLocaleDateString()}</p>`;
    description += `<p><strong>Last Updated:</strong> ${sessionData.updatedAt.toLocaleDateString()}</p>`;

    return description;
  }

  /**
   * Transform Moodle content to MediVerse format
   */
  private transformMoodleContentToMediVerse(moodleContent: any): any {
    return {
      id: moodleContent.id,
      title: moodleContent.name,
      description: moodleContent.summary,
      modules: moodleContent.modules.map((module: any) => ({
        id: module.id,
        name: module.name,
        type: module.modname,
        description: module.description,
        url: module.url,
        files: module.contents || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Sync multiple sessions to Moodle
   */
  async syncMultipleSessionsToMoodle(
    sessions: SyncSessionData[],
    courseId?: number
  ): Promise<{ success: boolean; results?: SyncResult[]; error?: string }> {
    try {
      const results: SyncResult[] = [];

      for (const session of sessions) {
        const result = await this.syncSessionToMoodle(session, courseId);
        results.push(result);
      }

      const allSuccessful = results.every((result) => result.success);

      return {
        success: allSuccessful,
        results,
        error: allSuccessful ? undefined : "Some sessions failed to sync",
      };
    } catch (error) {
      console.error("Error syncing multiple sessions to Moodle:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get sync status for a session
   */
  async getSessionSyncStatus(
    sessionId: string,
    moodleCourseId?: number
  ): Promise<{
    success: boolean;
    synced?: boolean;
    moodleActivityId?: number;
    error?: string;
  }> {
    try {
      if (!moodleCourseId) {
        return { success: true, synced: false };
      }

      // Check if session exists in Moodle
      const contentResult = await this.contentService.getMoodleCourseContent(
        moodleCourseId
      );

      if (!contentResult.success || !contentResult.content) {
        return { success: false, error: contentResult.error };
      }

      // Look for session in course modules
      const sessionModule = contentResult.content.modules.find((module) =>
        module.name.includes(sessionId.substring(0, 8))
      );

      return {
        success: true,
        synced: !!sessionModule,
        moodleActivityId: sessionModule?.id,
      };
    } catch (error) {
      console.error("Error checking session sync status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
