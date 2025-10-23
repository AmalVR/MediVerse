import { MoodleAPIService } from "./api";

export interface MoodleVideoMetadata {
  title: string;
  description?: string;
  duration?: number;
  tags?: string[];
  category?: string;
}

export interface MoodleQuizData {
  name: string;
  intro: string;
  timeopen?: number;
  timeclose?: number;
  timelimit?: number;
  attempts?: number;
  grademethod?: number;
  questions: MoodleQuestionData[];
}

export interface MoodleQuestionData {
  questiontext: string;
  qtype: string;
  defaultmark: number;
  options?: Record<string, any>;
  answers?: MoodleAnswerData[];
}

export interface MoodleAnswerData {
  answer: string;
  fraction: number;
  feedback?: string;
}

export interface MoodleAssignmentData {
  name: string;
  intro: string;
  duedate?: number;
  allowsubmissionsfromdate?: number;
  grade?: number;
  assignmenttype?: string;
}

export interface MoodleCourseContent {
  id: number;
  name: string;
  summary: string;
  modules: MoodleModule[];
}

export interface MoodleModule {
  id: number;
  name: string;
  modname: string;
  description?: string;
  url?: string;
  contents?: MoodleFileContent[];
}

export interface MoodleFileContent {
  filename: string;
  filepath: string;
  filesize: number;
  fileurl: string;
  timemodified: number;
}

export class MoodleContentService {
  private api: MoodleAPIService;

  constructor(api: MoodleAPIService) {
    this.api = api;
  }

  /**
   * Upload a video file to a Moodle course
   */
  async uploadVideoToMoodleCourse(
    courseId: number,
    videoFile: File,
    metadata: MoodleVideoMetadata
  ): Promise<{ success: boolean; fileId?: number; error?: string }> {
    try {
      // First, upload the file to Moodle's file system
      const uploadResult = await this.api.call("core_files_upload", {
        contextlevel: "module",
        instanceid: courseId,
        component: "mod_resource",
        filearea: "content",
        itemid: 0,
        filepath: "/",
        filename: videoFile.name,
        filecontent: await this.fileToBase64(videoFile),
      });

      if (!uploadResult.success) {
        return { success: false, error: "Failed to upload video file" };
      }

      // Create a resource module for the video
      const resourceResult = await this.api.call("mod_resource_add_instance", {
        course: courseId,
        name: metadata.title,
        intro: metadata.description || "",
        introformat: 1,
        display: 0, // Embed
        displayoptions: 'a:1:{s:12:"printintro";i:1;}',
        filterfiles: 0,
        revision: 1,
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!resourceResult.success) {
        return { success: false, error: "Failed to create video resource" };
      }

      return { success: true, fileId: uploadResult.itemid };
    } catch (error) {
      console.error("Error uploading video to Moodle:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a quiz in a Moodle course
   */
  async createMoodleQuiz(
    courseId: number,
    quizData: MoodleQuizData
  ): Promise<{ success: boolean; quizId?: number; error?: string }> {
    try {
      // Create the quiz
      const quizResult = await this.api.call("mod_quiz_add_instance", {
        course: courseId,
        name: quizData.name,
        intro: quizData.intro,
        introformat: 1,
        timeopen: quizData.timeopen || 0,
        timeclose: quizData.timeclose || 0,
        timelimit: quizData.timelimit || 0,
        attempts: quizData.attempts || 0,
        grademethod: quizData.grademethod || 1,
        grade: 100,
        sumgrades: 0,
        shuffleanswers: 1,
        shufflequestions: 0,
        questionsperpage: 0,
        navmethod: "free",
        browsersecurity: "",
        delay1: 0,
        delay2: 0,
        showuserpicture: 0,
        showblocks: 0,
        completionpass: 0,
        completionview: 0,
        completionusegrade: 0,
        completionexpected: 0,
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!quizResult.success) {
        return { success: false, error: "Failed to create quiz" };
      }

      const quizId = quizResult.instanceid;

      // Add questions to the quiz
      for (const questionData of quizData.questions) {
        const questionResult = await this.createMoodleQuestion(
          courseId,
          questionData
        );

        if (questionResult.success && questionResult.questionId) {
          // Add question to quiz
          await this.api.call("mod_quiz_add_question", {
            quizid: quizId,
            questionid: questionResult.questionId,
            page: 1,
            maxmark: questionData.defaultmark,
          });
        }
      }

      return { success: true, quizId };
    } catch (error) {
      console.error("Error creating Moodle quiz:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a question in Moodle
   */
  private async createMoodleQuestion(
    courseId: number,
    questionData: MoodleQuestionData
  ): Promise<{ success: boolean; questionId?: number; error?: string }> {
    try {
      const questionResult = await this.api.call("mod_quiz_add_question", {
        courseid: courseId,
        category: 1, // Default category
        name: questionData.questiontext.substring(0, 50),
        questiontext: questionData.questiontext,
        questiontextformat: 1,
        qtype: questionData.qtype,
        defaultmark: questionData.defaultmark,
        generalfeedback: "",
        generalfeedbackformat: 1,
        penalty: 0.3333333,
        hidden: 0,
        idnumber: "",
        timecreated: Math.floor(Date.now() / 1000),
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!questionResult.success) {
        return { success: false, error: "Failed to create question" };
      }

      const questionId = questionResult.questionid;

      // Add answers if provided
      if (questionData.answers && questionData.answers.length > 0) {
        for (const answer of questionData.answers) {
          await this.api.call("mod_quiz_add_answer", {
            questionid: questionId,
            answer: answer.answer,
            answerformat: 1,
            fraction: answer.fraction,
            feedback: answer.feedback || "",
            feedbackformat: 1,
          });
        }
      }

      return { success: true, questionId };
    } catch (error) {
      console.error("Error creating Moodle question:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create an assignment in a Moodle course
   */
  async createMoodleAssignment(
    courseId: number,
    assignmentData: MoodleAssignmentData
  ): Promise<{ success: boolean; assignmentId?: number; error?: string }> {
    try {
      const assignmentResult = await this.api.call("mod_assign_add_instance", {
        course: courseId,
        name: assignmentData.name,
        intro: assignmentData.intro,
        introformat: 1,
        alwaysshowdescription: 0,
        nosubmissions: 0,
        preventsubmissionnotingroup: 0,
        teamsubmission: 0,
        teamsubmissiongroupingid: 0,
        blindmarking: 0,
        hidegrader: 0,
        allowsubmissionsfromdate: assignmentData.allowsubmissionsfromdate || 0,
        duedate: assignmentData.duedate || 0,
        cutoffdate: 0,
        gradingduedate: 0,
        scale: 0,
        grade: assignmentData.grade || 100,
        markingworkflow: 0,
        markingallocation: 0,
        sendnotifications: 0,
        sendstudentnotifications: 1,
        requiresubmissionstatement: 0,
        configs: [],
        timemodified: Math.floor(Date.now() / 1000),
      });

      if (!assignmentResult.success) {
        return { success: false, error: "Failed to create assignment" };
      }

      return { success: true, assignmentId: assignmentResult.instanceid };
    } catch (error) {
      console.error("Error creating Moodle assignment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get content from a Moodle course
   */
  async getMoodleCourseContent(
    courseId: number
  ): Promise<{
    success: boolean;
    content?: MoodleCourseContent;
    error?: string;
  }> {
    try {
      const courseResult = await this.api.call("core_course_get_contents", {
        courseid: courseId,
      });

      if (!courseResult.success || !courseResult.courses) {
        return { success: false, error: "Failed to fetch course content" };
      }

      const course = courseResult.courses[0];
      if (!course) {
        return { success: false, error: "Course not found" };
      }

      const content: MoodleCourseContent = {
        id: course.id,
        name: course.fullname,
        summary: course.summary,
        modules:
          course.modules?.map((module: any) => ({
            id: module.id,
            name: module.name,
            modname: module.modname,
            description: module.description,
            url: module.url,
            contents: module.contents?.map((content: any) => ({
              filename: content.filename,
              filepath: content.filepath,
              filesize: content.filesize,
              fileurl: content.fileurl,
              timemodified: content.timemodified,
            })),
          })) || [],
      };

      return { success: true, content };
    } catch (error) {
      console.error("Error fetching Moodle course content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete content from a Moodle course
   */
  async deleteMoodleContent(
    courseId: number,
    moduleId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.api.call("mod_resource_delete_instance", {
        instanceid: moduleId,
      });

      if (!result.success) {
        return { success: false, error: "Failed to delete content" };
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
   * Convert File to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Get course modules by type
   */
  async getCourseModulesByType(
    courseId: number,
    moduleType: string
  ): Promise<{ success: boolean; modules?: MoodleModule[]; error?: string }> {
    try {
      const contentResult = await this.getMoodleCourseContent(courseId);

      if (!contentResult.success || !contentResult.content) {
        return { success: false, error: contentResult.error };
      }

      const modules = contentResult.content.modules.filter(
        (module) => module.modname === moduleType
      );

      return { success: true, modules };
    } catch (error) {
      console.error("Error fetching course modules by type:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
