export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  userMessage: Message;
  aiReply: Message;
}

export interface ConversationResponse {
  conversationId: string;
  messages: Message[];
}

export interface ErrorResponse {
  error: string;
  statusCode?: number;
}

export interface ChatStore {
  conversationId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}
