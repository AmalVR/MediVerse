/**
 * Moodle Course Management Service
 *
 * This service handles course creation, management, and enrollment
 * specifically for anatomy learning courses in MediVerse.
 */

import { moodleAPI, MoodleCourse, MoodleUser } from "./api";
import { moodleAuth } from "./auth";

export interface AnatomyCourse {
  id: number;
  name: string;
  shortName: string;
  description: string;
  category:
    | "cardiovascular"
    | "muscular"
    | "nervous"
    | "respiratory"
    | "skeleton";
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in weeks
  price: number;
  isPublished: boolean;
  enrollmentCount: number;
  maxEnrollments: number;
  startDate: Date;
  endDate: Date;
  prerequisites: string[];
  learningObjectives: string[];
  unityModules: string[];
  assessments: string[];
}

export interface CourseEnrollment {
  userId: number;
  courseId: number;
  enrolledAt: Date;
  status: "active" | "completed" | "dropped";
  progress: number; // percentage
  lastAccessed: Date;
  grades: Record<string, number>;
}

export class MoodleCourseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "MoodleCourseError";
  }
}

export class MoodleCourseService {
  private readonly ANATOMY_CATEGORY_ID = 1; // Default category for anatomy courses

  /**
   * Create a new anatomy course
   */
  async createAnatomyCourse(
    courseData: Partial<AnatomyCourse>
  ): Promise<AnatomyCourse> {
    try {
      const user = moodleAuth.getCurrentUser();
      if (!user || !user.isTeacher) {
        throw new MoodleCourseError(
          "Only teachers can create courses",
          "PERMISSION_DENIED"
        );
      }

      const moodleCourseData: Partial<MoodleCourse> = {
        fullname: courseData.name || "Anatomy Learning Course",
        shortname: courseData.shortName || `anatomy-${Date.now()}`,
        categoryid: this.ANATOMY_CATEGORY_ID,
        summary: this.formatCourseDescription(courseData),
        summaryformat: 1, // HTML format
        format: "topics",
        numsections: courseData.duration || 8,
        startdate: courseData.startDate
          ? Math.floor(courseData.startDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000),
        enddate: courseData.endDate
          ? Math.floor(courseData.endDate.getTime() / 1000)
          : 0,
        visible: courseData.isPublished ? 1 : 0,
        enablecompletion: 1,
        completionstartonenrol: 1,
        completionnotify: 1,
        showgrades: 1,
        showactivitydates: 1,
        showcompletionconditions: 1,
      };

      const moodleCourse = await moodleAPI.createCourse(moodleCourseData);

      // Convert to AnatomyCourse format
      const anatomyCourse: AnatomyCourse = {
        id: moodleCourse.id,
        name: moodleCourse.fullname,
        shortName: moodleCourse.shortname,
        description: moodleCourse.summary,
        category: courseData.category || "cardiovascular",
        level: courseData.level || "beginner",
        duration: courseData.duration || 8,
        price: courseData.price || 0,
        isPublished: moodleCourse.visible === 1,
        enrollmentCount: 0,
        maxEnrollments: courseData.maxEnrollments || 50,
        startDate: new Date(moodleCourse.startdate * 1000),
        endDate: moodleCourse.enddate
          ? new Date(moodleCourse.enddate * 1000)
          : new Date(),
        prerequisites: courseData.prerequisites || [],
        learningObjectives: courseData.learningObjectives || [],
        unityModules: courseData.unityModules || [],
        assessments: courseData.assessments || [],
      };

      return anatomyCourse;
    } catch (error) {
      if (error instanceof MoodleCourseError) {
        throw error;
      }
      throw new MoodleCourseError(
        `Failed to create course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_CREATION_ERROR"
      );
    }
  }

  /**
   * Format course description with anatomy-specific information
   */
  private formatCourseDescription(courseData: Partial<AnatomyCourse>): string {
    let description =
      courseData.description || "Interactive anatomy learning course";

    if (
      courseData.learningObjectives &&
      courseData.learningObjectives.length > 0
    ) {
      description += "\n\n<strong>Learning Objectives:</strong>\n<ul>";
      courseData.learningObjectives.forEach((objective) => {
        description += `<li>${objective}</li>`;
      });
      description += "</ul>";
    }

    if (courseData.prerequisites && courseData.prerequisites.length > 0) {
      description += "\n\n<strong>Prerequisites:</strong>\n<ul>";
      courseData.prerequisites.forEach((prereq) => {
        description += `<li>${prereq}</li>`;
      });
      description += "</ul>";
    }

    if (courseData.unityModules && courseData.unityModules.length > 0) {
      description += "\n\n<strong>Interactive Modules:</strong>\n<ul>";
      courseData.unityModules.forEach((module) => {
        description += `<li>${module}</li>`;
      });
      description += "</ul>";
    }

    return description;
  }

  /**
   * Get all anatomy courses
   */
  async getAnatomyCourses(): Promise<AnatomyCourse[]> {
    try {
      const courses = await moodleAPI.getUserCourses(0); // Get all courses

      return courses
        .filter((course) => course.categoryid === this.ANATOMY_CATEGORY_ID)
        .map((course) => this.convertToAnatomyCourse(course));
    } catch (error) {
      throw new MoodleCourseError(
        `Failed to get courses: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_FETCH_ERROR"
      );
    }
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: number): Promise<AnatomyCourse> {
    try {
      const course = await moodleAPI.getCourse(courseId);
      return this.convertToAnatomyCourse(course);
    } catch (error) {
      throw new MoodleCourseError(
        `Failed to get course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_FETCH_ERROR"
      );
    }
  }

  /**
   * Convert Moodle course to Anatomy course format
   */
  private convertToAnatomyCourse(moodleCourse: MoodleCourse): AnatomyCourse {
    return {
      id: moodleCourse.id,
      name: moodleCourse.fullname,
      shortName: moodleCourse.shortname,
      description: moodleCourse.summary,
      category: "cardiovascular", // Default, would need custom field
      level: "beginner", // Default, would need custom field
      duration: moodleCourse.numsections,
      price: 0, // Would need custom field
      isPublished: moodleCourse.visible === 1,
      enrollmentCount: 0, // Would need to fetch separately
      maxEnrollments: 50, // Default
      startDate: new Date(moodleCourse.startdate * 1000),
      endDate: moodleCourse.enddate
        ? new Date(moodleCourse.enddate * 1000)
        : new Date(),
      prerequisites: [], // Would need custom field
      learningObjectives: [], // Would need custom field
      unityModules: [], // Would need custom field
      assessments: [], // Would need custom field
    };
  }

  /**
   * Enroll student in course
   */
  async enrollStudent(courseId: number, studentId?: number): Promise<void> {
    try {
      const user = moodleAuth.getCurrentUser();
      const userId = studentId || user?.id;

      if (!userId) {
        throw new MoodleCourseError("User not authenticated", "AUTH_ERROR");
      }

      await moodleAPI.enrollUser(userId, courseId);
    } catch (error) {
      if (error instanceof MoodleCourseError) {
        throw error;
      }
      throw new MoodleCourseError(
        `Failed to enroll student: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "ENROLLMENT_ERROR"
      );
    }
  }

  /**
   * Unenroll student from course
   */
  async unenrollStudent(courseId: number, studentId?: number): Promise<void> {
    try {
      const user = moodleAuth.getCurrentUser();
      const userId = studentId || user?.id;

      if (!userId) {
        throw new MoodleCourseError("User not authenticated", "AUTH_ERROR");
      }

      await moodleAPI.unenrollUser(userId, courseId);
    } catch (error) {
      if (error instanceof MoodleCourseError) {
        throw error;
      }
      throw new MoodleCourseError(
        `Failed to unenroll student: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "UNENROLLMENT_ERROR"
      );
    }
  }

  /**
   * Get course enrollments
   */
  async getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]> {
    try {
      const enrollments = await moodleAPI.getCourseEnrollments(courseId);

      return enrollments.map((enrollment) => ({
        userId: enrollment.userid,
        courseId: enrollment.courseid,
        enrolledAt: new Date(enrollment.timecreated * 1000),
        status: enrollment.status === 0 ? "active" : "dropped",
        progress: 0, // Would need to calculate from activities
        lastAccessed: new Date(enrollment.timemodified * 1000),
        grades: {}, // Would need to fetch separately
      }));
    } catch (error) {
      throw new MoodleCourseError(
        `Failed to get enrollments: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "ENROLLMENT_FETCH_ERROR"
      );
    }
  }

  /**
   * Get student's courses
   */
  async getStudentCourses(studentId?: number): Promise<AnatomyCourse[]> {
    try {
      const user = moodleAuth.getCurrentUser();
      const userId = studentId || user?.id;

      if (!userId) {
        throw new MoodleCourseError("User not authenticated", "AUTH_ERROR");
      }

      const courses = await moodleAPI.getUserCourses(userId);

      return courses
        .filter((course) => course.categoryid === this.ANATOMY_CATEGORY_ID)
        .map((course) => this.convertToAnatomyCourse(course));
    } catch (error) {
      throw new MoodleCourseError(
        `Failed to get student courses: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_FETCH_ERROR"
      );
    }
  }

  /**
   * Update course information
   */
  async updateCourse(
    courseId: number,
    updates: Partial<AnatomyCourse>
  ): Promise<void> {
    try {
      const user = moodleAuth.getCurrentUser();
      if (!user || !user.isTeacher) {
        throw new MoodleCourseError(
          "Only teachers can update courses",
          "PERMISSION_DENIED"
        );
      }

      const moodleUpdates: Partial<MoodleCourse> = {};

      if (updates.name) moodleUpdates.fullname = updates.name;
      if (updates.description) moodleUpdates.summary = updates.description;
      if (updates.isPublished !== undefined)
        moodleUpdates.visible = updates.isPublished ? 1 : 0;
      if (updates.startDate)
        moodleUpdates.startdate = Math.floor(
          updates.startDate.getTime() / 1000
        );
      if (updates.endDate)
        moodleUpdates.enddate = Math.floor(updates.endDate.getTime() / 1000);

      await moodleAPI.updateCourse(courseId, moodleUpdates);
    } catch (error) {
      if (error instanceof MoodleCourseError) {
        throw error;
      }
      throw new MoodleCourseError(
        `Failed to update course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_UPDATE_ERROR"
      );
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: number): Promise<void> {
    try {
      const user = moodleAuth.getCurrentUser();
      if (!user || !user.isTeacher) {
        throw new MoodleCourseError(
          "Only teachers can delete courses",
          "PERMISSION_DENIED"
        );
      }

      // Note: Moodle doesn't have a direct delete course API
      // You would need to implement this through course visibility or custom solution
      await moodleAPI.updateCourse(courseId, { visible: 0 });
    } catch (error) {
      if (error instanceof MoodleCourseError) {
        throw error;
      }
      throw new MoodleCourseError(
        `Failed to delete course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COURSE_DELETE_ERROR"
      );
    }
  }

  /**
   * Get course completion status for student
   */
  async getCourseCompletion(
    courseId: number,
    studentId?: number
  ): Promise<any> {
    try {
      const user = moodleAuth.getCurrentUser();
      const userId = studentId || user?.id;

      if (!userId) {
        throw new MoodleCourseError("User not authenticated", "AUTH_ERROR");
      }

      return await moodleAPI.getUserCourseCompletion(userId, courseId);
    } catch (error) {
      throw new MoodleCourseError(
        `Failed to get completion status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "COMPLETION_FETCH_ERROR"
      );
    }
  }
}

// Create singleton instance with lazy initialization
let _moodleCourseService: MoodleCourseService | null = null;

export const moodleCourseService = {
  get instance() {
    if (!_moodleCourseService) {
      _moodleCourseService = new MoodleCourseService();
    }
    return _moodleCourseService;
  },

  // Proxy all methods to the instance
  async createAnatomyCourse(courseData: Partial<AnatomyCourse>) {
    return this.instance.createAnatomyCourse(courseData);
  },

  async enrollStudentInCourse(studentId: number, courseId: number) {
    return this.instance.enrollStudentInCourse(studentId, courseId);
  },

  async getStudentCourses(studentId: number) {
    return this.instance.getStudentCourses(studentId);
  },

  async getTeacherCourses(teacherId: number) {
    return this.instance.getTeacherCourses(teacherId);
  },

  async getCourseEnrollments(courseId: number) {
    return this.instance.getCourseEnrollments(courseId);
  },

  async updateCourseProgress(
    studentId: number,
    courseId: number,
    progress: number
  ) {
    return this.instance.updateCourseProgress(studentId, courseId, progress);
  },

  async getCourseCompletion(userId: number, courseId: number) {
    return this.instance.getCourseCompletion(userId, courseId);
  },
};
