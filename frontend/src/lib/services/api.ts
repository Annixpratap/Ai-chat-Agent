import type { ChatRequest, ChatResponse, ConversationResponse, ErrorResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TIMEOUT = 30000; // 30 seconds

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ErrorResponse = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Backend server may be down.');
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getConversation(conversationId: string): Promise<ConversationResponse> {
    return this.fetch<ConversationResponse>(`/api/chat/${conversationId}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetch('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
