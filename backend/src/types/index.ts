export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
}

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
