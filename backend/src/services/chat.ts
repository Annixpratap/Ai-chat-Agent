import {
  createConversation,
  getConversation,
  addMessage,
  getConversationMessages
} from '../db/index.js';
import { generateReply } from './llm.js';
import { ChatRequest, ChatResponse } from '../types/index.js';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_MESSAGES = 20;

export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
    };
  }

  return { valid: true };
}

export async function handleChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // Validate input
  const validation = validateMessage(request.message);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const userMessage = request.message.trim();
  let conversationId = request.conversationId;

  // Create new conversation or verify existing one
  if (!conversationId) {
    const conversation = await createConversation();
    conversationId = conversation.id;
  } else {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  }

  // Add user message to database
  const savedUserMessage = await addMessage(conversationId, 'user', userMessage);

  // Get conversation history
  const allMessages = await getConversationMessages(conversationId);
  
  // Get recent messages for context (limit to MAX_CONTEXT_MESSAGES to control token usage)
  const recentMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);

  // Generate AI reply
  let aiReplyText: string;
  try {
    aiReplyText = await generateReply(recentMessages, userMessage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Determine appropriate fallback message
    let fallback = 'I apologize, but I encountered an issue processing your request. Please try again later.';
    
    if (errorMessage.includes('API key') || errorMessage.includes('not set')) {
      fallback = 'The support system is temporarily unavailable. Please contact support@techgear.example';
    } else if (errorMessage.includes('rate limit')) {
      fallback = 'Too many requests. Please wait a moment and try again.';
    } else if (errorMessage.includes('timeout')) {
      fallback = 'Request took too long to process. Please try again.';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      fallback = 'Network connection issue. Please check your internet and try again.';
    }
    
    aiReplyText = fallback;
    
    // Log the actual error for debugging
    console.error('LLM Error:', errorMessage);
  }

  // Add AI reply to database
  const savedAIReply = await addMessage(conversationId, 'ai', aiReplyText);

  return {
    conversationId,
    userMessage: savedUserMessage,
    aiReply: savedAIReply
  };
}

export async function getConversationHistory(conversationId: string) {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const messages = await getConversationMessages(conversationId);
  return { conversationId, messages };
}
