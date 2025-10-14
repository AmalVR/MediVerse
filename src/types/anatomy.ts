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
