export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  context_data?: Record<string, unknown>;
}

export interface ChatResponse {
  role: string;
  content: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
}