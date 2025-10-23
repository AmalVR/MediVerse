/**
 * Moodle REST API Integration Service
 *
 * This service handles all interactions with the Moodle LMS REST API,
 * including authentication, course management, user enrollment, and assessments.
 */

import { env } from "../env";

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  firstaccess: number;
  lastaccess: number;
  suspended: boolean;
  confirmed: boolean;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  summary: string;
  summaryformat: number;
  startdate: number;
  enddate: number;
  visible: boolean;
  categoryid: number;
  categorysortorder: number;
  idnumber: string;
  format: string;
  showgrades: boolean;
  newsitems: number;
  timecreated: number;
  timemodified: number;
  defaultgroupingid: number;
  enablecompletion: boolean;
  completionnotify: boolean;
  lang: string;
  theme: string;
  maxbytes: number;
  legacyfiles: number;
  calendartype: string;
  requested: number;
  enablecompletion: boolean;
  completionstartonenrol: boolean;
  completionnotify: boolean;
  hiddensections: number;
  coursedisplay: number;
  numsections: number;
  maxattachments: number;
  maxbytes: number;
  showreports: number;
  showactivitydates: boolean;
  showcompletionconditions: boolean;
}

export interface MoodleEnrollment {
  id: number;
  courseid: number;
  userid: number;
  status: number;
  timestart: number;
  timeend: number;
  modifierid: number;
  timecreated: number;
  timemodified: number;
}

export interface MoodleQuiz {
  id: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  timeopen: number;
  timeclose: number;
  timelimit: number;
  overduehandling: string;
  graceperiod: number;
  preferredbehaviour: string;
  canredoquestions: number;
  attempts: number;
  attemptonlast: number;
  grademethod: number;
  decimalpoints: number;
  questiondecimalpoints: number;
  reviewattempt: number;
  reviewcorrectness: number;
  reviewmarks: number;
  reviewspecificfeedback: number;
  reviewgeneralfeedback: number;
  reviewrightanswer: number;
  reviewoverallfeedback: number;
  questionsperpage: number;
  navmethod: string;
  shuffleanswers: number;
  sumgrades: number;
  grade: number;
  timecreated: number;
  timemodified: number;
  password: string;
  subnet: string;
  browsersecurity: string;
  delay1: number;
  delay2: number;
  showuserpicture: number;
  showblocks: number;
  completionattemptsexhausted: number;
  completionpass: number;
  allowofflineattempts: number;
}

export interface MoodleQuizAttempt {
  id: number;
  quiz: number;
  userid: number;
  attempt: number;
  uniqueid: number;
  layout: string;
  state: string;
  timestart: number;
  timefinish: number;
  timemodified: number;
  timecheckstate: number;
  sumgrades: number;
}

export interface MoodleGrade {
  id: number;
  courseid: number;
  categoryid: number;
  itemname: string;
  itemtype: string;
  itemmodule: string;
  iteminstance: number;
  itemnumber: number;
  idnumber: string;
  calculation: string;
  gradetype: number;
  grademax: number;
  grademin: number;
  scaleid: number;
  outcomeid: number;
  gradepass: number;
  multfactor: number;
  plusfactor: number;
  aggregationcoef: number;
  aggregationcoef2: number;
  sortorder: number;
  display: number;
  decimals: number;
  hidden: number;
  locked: number;
  locktime: number;
  needsupdate: number;
  weightoverride: number;
  timecreated: number;
  timemodified: number;
  grade: number;
  userid: number;
  feedback: string;
  feedbackformat: number;
  information: string;
  informationformat: number;
}

export class MoodleAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "MoodleAPIError";
  }
}

export class MoodleAPIService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl =
      env.MOODLE_API_URL || "http://localhost:8081/webservice/rest/server.php";
    this.token = env.MOODLE_API_TOKEN || "placeholder_token";

    if (!env.MOODLE_API_URL || !env.MOODLE_API_TOKEN) {
      console.warn(
        "⚠️ Moodle API configuration is missing. Using placeholder values. Please check your environment variables."
      );
    }
  }

  /**
   * Check if the API is properly configured
   */
  isConfigured(): boolean {
    return !!(
      env.MOODLE_API_URL &&
      env.MOODLE_API_TOKEN &&
      env.MOODLE_API_TOKEN !== "placeholder_token"
    );
  }

  /**
   * Make a request to the Moodle REST API
   */
  private async makeRequest(
    wsfunction: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new MoodleAPIError(
        "Moodle API is not properly configured. Please check your environment variables and ensure Moodle is running."
      );
    }

    const url = new URL(this.baseUrl);
    url.searchParams.append("wstoken", this.token);
    url.searchParams.append("wsfunction", wsfunction);
    url.searchParams.append("moodlewsrestformat", "json");

    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object") {
            Object.entries(item).forEach(([subKey, subValue]) => {
              url.searchParams.append(
                `${key}[${index}][${subKey}]`,
                String(subValue)
              );
            });
          } else {
            url.searchParams.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          url.searchParams.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new MoodleAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
          response.status
        );
      }

      const data = await response.json();

      if (data.errorcode) {
        throw new MoodleAPIError(
          data.message || "Moodle API error",
          data.errorcode,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof MoodleAPIError) {
        throw error;
      }
      throw new MoodleAPIError(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Get site information
   */
  async getSiteInfo(): Promise<any> {
    return this.makeRequest("core_webservice_get_site_info");
  }

  /**
   * Get user information by ID
   */
  async getUserById(userId: number): Promise<MoodleUser> {
    const response = await this.makeRequest("core_user_get_users_by_id", {
      userids: [userId],
    });
    return response.users[0];
  }

  /**
   * Get user information by field (username, email, etc.)
   */
  async getUserByField(field: string, value: string): Promise<MoodleUser> {
    const response = await this.makeRequest("core_user_get_users_by_field", {
      field,
      values: [value],
    });
    return response.users[0];
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<MoodleUser>): Promise<MoodleUser> {
    const response = await this.makeRequest("core_user_create_users", {
      users: [userData],
    });
    return response.users[0];
  }

  /**
   * Get courses for a user
   */
  async getUserCourses(userId: number): Promise<MoodleCourse[]> {
    const response = await this.makeRequest("core_enrol_get_users_courses", {
      userid: userId,
    });
    return response;
  }

  /**
   * Get course information
   */
  async getCourse(courseId: number): Promise<MoodleCourse> {
    const response = await this.makeRequest(
      "core_course_get_courses_by_field",
      {
        field: "id",
        value: courseId.toString(),
      }
    );
    return response.courses[0];
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: Partial<MoodleCourse>): Promise<MoodleCourse> {
    const response = await this.makeRequest("core_course_create_courses", {
      courses: [courseData],
    });
    return response.courses[0];
  }

  /**
   * Update a course
   */
  async updateCourse(
    courseId: number,
    courseData: Partial<MoodleCourse>
  ): Promise<void> {
    await this.makeRequest("core_course_edit_section", {
      id: courseId,
      ...courseData,
    });
  }

  /**
   * Enroll user in a course
   */
  async enrollUser(userId: number, courseId: number): Promise<void> {
    await this.makeRequest("enrol_manual_enrol_users", {
      enrolments: [
        {
          roleid: 5, // Student role
          userid: userId,
          courseid: courseId,
        },
      ],
    });
  }

  /**
   * Unenroll user from a course
   */
  async unenrollUser(userId: number, courseId: number): Promise<void> {
    await this.makeRequest("enrol_manual_unenrol_users", {
      enrolments: [
        {
          userid: userId,
          courseid: courseId,
        },
      ],
    });
  }

  /**
   * Get course enrollments
   */
  async getCourseEnrollments(courseId: number): Promise<MoodleEnrollment[]> {
    const response = await this.makeRequest("core_enrol_get_enrolled_users", {
      courseid: courseId,
    });
    return response;
  }

  /**
   * Create a quiz
   */
  async createQuiz(
    courseId: number,
    quizData: Partial<MoodleQuiz>
  ): Promise<MoodleQuiz> {
    const response = await this.makeRequest("mod_quiz_add_quiz", {
      course: courseId,
      ...quizData,
    });
    return response.quiz;
  }

  /**
   * Get quizzes for a course
   */
  async getCourseQuizzes(courseId: number): Promise<MoodleQuiz[]> {
    const response = await this.makeRequest("mod_quiz_get_quizzes_by_courses", {
      courseids: [courseId],
    });
    return response.quizzes;
  }

  /**
   * Get quiz attempts for a user
   */
  async getUserQuizAttempts(
    userId: number,
    quizId: number
  ): Promise<MoodleQuizAttempt[]> {
    const response = await this.makeRequest("mod_quiz_get_user_attempts", {
      userid: userId,
      quizid: quizId,
    });
    return response.attempts;
  }

  /**
   * Get user grades for a course
   */
  async getUserGrades(
    userId: number,
    courseId: number
  ): Promise<MoodleGrade[]> {
    const response = await this.makeRequest(
      "gradereport_user_get_grade_items",
      {
        userid: userId,
        courseid: courseId,
      }
    );
    return response.usergrades;
  }

  /**
   * Get course completion status for a user
   */
  async getUserCourseCompletion(
    userId: number,
    courseId: number
  ): Promise<any> {
    const response = await this.makeRequest(
      "core_completion_get_activities_completion_status",
      {
        userid: userId,
        courseid: courseId,
      }
    );
    return response.statuses;
  }

  /**
   * Generate API token for a user
   */
  async generateUserToken(
    userId: number,
    service: string = "moodle_mobile_app"
  ): Promise<string> {
    const response = await this.makeRequest("core_user_create_user_key", {
      userid: userId,
      service: service,
    });
    return response.key;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getSiteInfo();
      return true;
    } catch (error) {
      console.error("Moodle API connection test failed:", error);
      return false;
    }
  }
}

// Create singleton instance with lazy initialization
let _moodleAPI: MoodleAPIService | null = null;

export const moodleAPI = {
  get instance() {
    if (!_moodleAPI) {
      _moodleAPI = new MoodleAPIService();
    }
    return _moodleAPI;
  },

  // Proxy all methods to the instance
  get isConfigured() {
    return this.instance.isConfigured();
  },

  async getUserCourses(userId: number) {
    return this.instance.getUserCourses(userId);
  },

  async getCourse(courseId: number) {
    return this.instance.getCourse(courseId);
  },

  async createCourse(courseData: Partial<MoodleCourse>) {
    return this.instance.createCourse(courseData);
  },

  async enrollUserInCourse(userId: number, courseId: number) {
    return this.instance.enrollUserInCourse(userId, courseId);
  },

  async getCourseEnrollments(courseId: number) {
    return this.instance.getCourseEnrollments(courseId);
  },

  async getQuiz(quizId: number) {
    return this.instance.getQuiz(quizId);
  },

  async getQuizQuestions(quizId: number) {
    return this.instance.getQuizQuestions(quizId);
  },

  async submitQuizAttempt(attemptData: any) {
    return this.instance.submitQuizAttempt(attemptData);
  },

  async getUserQuizAttempts(userId: number, courseId?: number) {
    return this.instance.getUserQuizAttempts(userId, courseId);
  },

  async getUserGrades(userId: number, courseId?: number) {
    return this.instance.getUserGrades(userId, courseId);
  },

  async generateUserToken(username: string, password: string) {
    return this.instance.generateUserToken(username, password);
  },

  async createUser(userData: Partial<MoodleUser>) {
    return this.instance.createUser(userData);
  },

  async getUserByField(field: string, value: string) {
    return this.instance.getUserByField(field, value);
  },

  async updateUser(userId: number, userData: Partial<MoodleUser>) {
    return this.instance.updateUser(userId, userData);
  },

  async getSiteInfo() {
    return this.instance.getSiteInfo();
  },

  async testConnection() {
    return this.instance.testConnection();
  },
};
