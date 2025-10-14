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
  payload: unknown;
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
