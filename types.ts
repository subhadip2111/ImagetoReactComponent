export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'code' | 'success' | 'error';
}

export interface GenerateResponse {
  code: string;
  logs: string[];
}
