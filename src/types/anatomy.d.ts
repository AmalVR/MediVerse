export interface ViewerState {
    command?: {
        action: string;
        target: string;
    };
}
export interface NLPResponse {
    success: boolean;
    data?: {
        action: string;
        target: string;
        success?: boolean;
        errorMsg?: string;
    };
    error?: string;
}
export interface WSMessage {
    type: string;
    sessionId?: string;
    data?: any;
    timestamp?: number;
    payload?: unknown;
}
export interface SessionJoinRequest {
    code: string;
    studentId: string;
}
export interface SessionCreateRequest {
    title: string;
    teacherId: string;
}
export interface SessionResponse {
    id: string;
    code: string;
    title: string;
    teacherId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    endedAt?: string;
}
export type AnatomySystem = "SKELETAL" | "MUSCULAR" | "CARDIOVASCULAR" | "RESPIRATORY" | "NERVOUS" | "DIGESTIVE" | "URINARY" | "REPRODUCTIVE" | "ENDOCRINE" | "LYMPHATIC" | "INTEGUMENTARY";
export type WSMessageType = "SESSION_JOIN" | "SESSION_LEAVE" | "VIEWER_STATE_UPDATE" | "VOICE_COMMAND" | "STUDENT_NOTE" | "TEACHER_ANNOUNCEMENT";
//# sourceMappingURL=anatomy.d.ts.map