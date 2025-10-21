import { env, isGoogleClassroomConfigured } from "@/lib/env";

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED";
  alternateLink: string;
  teacherGroupEmail: string;
  courseGroupEmail: string;
  teacherFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
  guardiansEnabled: boolean;
  calendarId: string;
}

export interface GoogleClassroomStudent {
  userId: string;
  courseId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
  studentWorkFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
}

export interface GoogleClassroomTeacher {
  userId: string;
  courseId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface GoogleClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  materials?: Array<{
    driveFile?: {
      driveFile: {
        id: string;
        title: string;
        alternateLink: string;
        thumbnailUrl?: string;
      };
    };
    youtubeVideo?: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl?: string;
    };
    link?: {
      url: string;
      title: string;
      thumbnailUrl?: string;
    };
  }>;
  state: "PUBLISHED" | "DRAFT" | "DELETED";
  creationTime: string;
  updateTime: string;
  scheduledTime?: string;
}

export interface GoogleClassroomAssignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: Array<{
    driveFile?: {
      driveFile: {
        id: string;
        title: string;
        alternateLink: string;
        thumbnailUrl?: string;
      };
    };
    youtubeVideo?: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl?: string;
    };
    link?: {
      url: string;
      title: string;
      thumbnailUrl?: string;
    };
  }>;
  state: "PUBLISHED" | "DRAFT" | "DELETED";
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: "ASSIGNMENT" | "SHORT_ANSWER_QUESTION" | "MULTIPLE_CHOICE_QUESTION";
}

// Declare global Google types
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleClassroomService {
  private gapiInited = false;
  private gisInited = false;
  private tokenClient: any = null;
  private isSignedIn = false;

  private readonly config = {
    clientId: env.GOOGLE_CLIENT_ID,
    apiKey: env.GOOGLE_API_KEY,
    discoveryDocs: [
      "https://classroom.googleapis.com/$discovery/rest?version=v1",
    ],
    scopes: [
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/classroom.courses",
      "https://www.googleapis.com/auth/classroom.rosters.readonly",
      "https://www.googleapis.com/auth/classroom.rosters",
      "https://www.googleapis.com/auth/classroom.profile.emails",
      "https://www.googleapis.com/auth/classroom.profile.photos",
      "https://www.googleapis.com/auth/classroom.coursework.me",
      "https://www.googleapis.com/auth/classroom.coursework.students",
      "https://www.googleapis.com/auth/classroom.announcements",
    ].join(" "),
  };

  /**
   * Wait for Google scripts to load
   */
  private async waitForGoogleScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max wait time

      const checkScripts = () => {
        attempts++;

        console.log(
          `Checking Google scripts (attempt ${attempts}/${maxAttempts}):`,
          {
            gapi: !!window.gapi,
            google: !!window.google,
            googleAccounts: !!(window.google && window.google.accounts),
            windowKeys: Object.keys(window).filter(
              (key) => key.includes("google") || key.includes("gapi")
            ),
          }
        );

        if (window.gapi && window.google && window.google.accounts) {
          console.log("Google scripts loaded successfully!");
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error(
            "Google scripts failed to load. Available window properties:",
            Object.keys(window)
          );
          reject(new Error("Google scripts failed to load within timeout"));
        } else {
          setTimeout(checkScripts, 100);
        }
      };
      checkScripts();
    });
  }

  /**
   * Load Google scripts dynamically if not already loaded
   */
  private async loadGoogleScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if scripts are already loaded
      if (window.gapi && window.google && window.google.accounts) {
        resolve();
        return;
      }

      console.log("Loading Google scripts dynamically...");

      // Load GSI script
      const gsiScript = document.createElement("script");
      gsiScript.src = "https://accounts.google.com/gsi/client";
      gsiScript.async = true;
      gsiScript.defer = true;

      // Load GAPI script
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.defer = true;

      let loadedCount = 0;
      const onScriptLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          console.log("Both Google scripts loaded");
          resolve();
        }
      };

      const onScriptError = (error: any) => {
        console.error("Failed to load Google script:", error);
        reject(error);
      };

      gsiScript.onload = onScriptLoad;
      gsiScript.onerror = onScriptError;
      gapiScript.onload = onScriptLoad;
      gapiScript.onerror = onScriptError;

      document.head.appendChild(gsiScript);
      document.head.appendChild(gapiScript);
    });
  }

  /**
   * Initialize Google API client and Google Identity Services
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error(
        "Google Classroom API can only be used in browser environment"
      );
    }

    try {
      // Try to load scripts dynamically first
      console.log("Attempting to load Google scripts...");
      await this.loadGoogleScripts();

      // Wait for Google scripts to load
      console.log("Waiting for Google scripts to load...");
      await this.waitForGoogleScripts();
      console.log("Google scripts loaded");

      // Initialize GAPI client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: this.config.discoveryDocs,
            });
            this.gapiInited = true;
            console.log("GAPI client initialized");
            resolve();
          } catch (error) {
            console.error("Error initializing GAPI:", error);
            reject(error);
          }
        });
      });

      // Initialize Google Identity Services token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes,
        callback: (tokenResponse: any) => {
          console.log("Token response received:", tokenResponse);
          if (tokenResponse && tokenResponse.access_token) {
            window.gapi.client.setToken(tokenResponse);
            this.isSignedIn = true;
          }
        },
      });
      this.gisInited = true;
      console.log("Google Identity Services initialized");
      this.maybeEnableServices();
    } catch (error) {
      console.error("Failed to initialize Google Classroom:", error);
      throw error;
    }
  }

  private maybeEnableServices() {
    if (this.gapiInited && this.gisInited) {
      console.log("Google Classroom services ready for use");
    }
  }

  /**
   * Sign in to Google account
   */
  async signIn(): Promise<boolean> {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error("Google services not initialized");
    }

    try {
      this.tokenClient.requestAccessToken({ prompt: "consent" });
      // Note: The actual sign-in happens in the callback
      // We'll return true here and let the callback handle the token
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  }

  /**
   * Sign out from Google account
   */
  async signOut(): Promise<void> {
    if (!this.gapiInited) return;

    try {
      const token = window.gapi.client.getToken();
      if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken("");
        this.isSignedIn = false;
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  /**
   * Check if user is signed in
   */
  isUserSignedIn(): boolean {
    return this.isSignedIn && this.gapiInited;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<any> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.oauth2.userinfo.get();
      return response.result;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  /**
   * Get all courses for the current user
   */
  async getCourses(): Promise<GoogleClassroomCourse[]> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.classroom.courses.list({
        pageSize: 100,
      });

      return response.result.courses || [];
    } catch (error) {
      console.error("Failed to get courses:", error);
      throw error;
    }
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string): Promise<GoogleClassroomCourse> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.classroom.courses.get({
        id: courseId,
      });

      return response.result;
    } catch (error) {
      console.error("Failed to get course:", error);
      throw error;
    }
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: {
    name: string;
    description?: string;
    section?: string;
    room?: string;
  }): Promise<GoogleClassroomCourse> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.classroom.courses.create({
        name: courseData.name,
        description: courseData.description,
        section: courseData.section,
        room: courseData.room,
      });

      return response.result;
    } catch (error) {
      console.error("Failed to create course:", error);
      throw error;
    }
  }

  /**
   * Get students in a course
   */
  async getStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.classroom.courses.students.list(
        {
          courseId: courseId,
          pageSize: 100,
        }
      );

      return response.result.students || [];
    } catch (error) {
      console.error("Failed to get students:", error);
      throw error;
    }
  }

  /**
   * Get teachers in a course
   */
  async getTeachers(courseId: string): Promise<GoogleClassroomTeacher[]> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response = await window.gapi.client.classroom.courses.teachers.list(
        {
          courseId: courseId,
          pageSize: 100,
        }
      );

      return response.result.teachers || [];
    } catch (error) {
      console.error("Failed to get teachers:", error);
      throw error;
    }
  }

  /**
   * Get announcements for a course
   */
  async getAnnouncements(
    courseId: string
  ): Promise<GoogleClassroomAnnouncement[]> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response =
        await window.gapi.client.classroom.courses.announcements.list({
          courseId: courseId,
          pageSize: 100,
        });

      return response.result.announcements || [];
    } catch (error) {
      console.error("Failed to get announcements:", error);
      throw error;
    }
  }

  /**
   * Create an announcement
   */
  async createAnnouncement(
    courseId: string,
    announcementData: {
      text: string;
      materials?: any[];
    }
  ): Promise<GoogleClassroomAnnouncement> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response =
        await window.gapi.client.classroom.courses.announcements.create({
          courseId: courseId,
          text: announcementData.text,
          materials: announcementData.materials,
        });

      return response.result;
    } catch (error) {
      console.error("Failed to create announcement:", error);
      throw error;
    }
  }

  /**
   * Get assignments for a course
   */
  async getAssignments(courseId: string): Promise<GoogleClassroomAssignment[]> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response =
        await window.gapi.client.classroom.courses.courseWork.list({
          courseId: courseId,
          pageSize: 100,
        });

      return response.result.courseWork || [];
    } catch (error) {
      console.error("Failed to get assignments:", error);
      throw error;
    }
  }

  /**
   * Create an assignment
   */
  async createAssignment(
    courseId: string,
    assignmentData: {
      title: string;
      description?: string;
      materials?: any[];
      dueDate?: { year: number; month: number; day: number };
      dueTime?: { hours: number; minutes: number };
      maxPoints?: number;
      workType:
        | "ASSIGNMENT"
        | "SHORT_ANSWER_QUESTION"
        | "MULTIPLE_CHOICE_QUESTION";
    }
  ): Promise<GoogleClassroomAssignment> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const response =
        await window.gapi.client.classroom.courses.courseWork.create({
          courseId: courseId,
          title: assignmentData.title,
          description: assignmentData.description,
          materials: assignmentData.materials,
          dueDate: assignmentData.dueDate,
          dueTime: assignmentData.dueTime,
          maxPoints: assignmentData.maxPoints,
          workType: assignmentData.workType,
        });

      return response.result;
    } catch (error) {
      console.error("Failed to create assignment:", error);
      throw error;
    }
  }

  /**
   * Share MediVerse content to Google Classroom
   */
  async shareToClassroom(
    courseId: string,
    content: {
      title: string;
      description: string;
      videoUrl?: string;
      thumbnailUrl?: string;
      type: "announcement" | "assignment";
    }
  ): Promise<void> {
    if (!this.isUserSignedIn()) {
      throw new Error("User not signed in");
    }

    try {
      const materials = [];

      if (content.videoUrl) {
        materials.push({
          link: {
            url: content.videoUrl,
            title: content.title,
            thumbnailUrl: content.thumbnailUrl,
          },
        });
      }

      if (content.type === "announcement") {
        await this.createAnnouncement(courseId, {
          text: content.description,
          materials: materials,
        });
      } else {
        await this.createAssignment(courseId, {
          title: content.title,
          description: content.description,
          materials: materials,
          workType: "ASSIGNMENT",
        });
      }
    } catch (error) {
      console.error("Failed to share to classroom:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleClassroom = new GoogleClassroomService();

// Helper function to check if Google Classroom is available
export const isGoogleClassroomAvailable = (): boolean => {
  return isGoogleClassroomConfigured();
};
