import { writable, derived } from 'svelte/store';
import type { Message, ChatStore } from '../types';
import { apiClient } from '../services/api';

// Session storage key
const SESSION_KEY = 'chat_conversation_id';

function createChatStore() {
  // Restore conversation ID from localStorage
  let initialConversationId: string | null = null;
  if (typeof window !== 'undefined') {
    initialConversationId = localStorage.getItem(SESSION_KEY);
  }

  const { subscribe, set, update } = writable<ChatStore>({
    conversationId: initialConversationId,
    messages: [],
    loading: false,
    error: null
  });

  return {
    subscribe,

    async initialize() {
      const state = (await new Promise(resolve => {
        subscribe(s => resolve(s))();
      })) as ChatStore;

      // Restore messages if we have a conversation ID
      if (state.conversationId) {
        try {
          const response = await apiClient.getConversation(state.conversationId);
          update(s => ({
            ...s,
            messages: response.messages,
            error: null
          }));
        } catch (error) {
          console.error('Failed to restore conversation:', error);
          // Start fresh if restoration fails
          update(s => ({
            ...s,
            conversationId: null,
            messages: []
          }));
          localStorage.removeItem(SESSION_KEY);
        }
      }
    },

    async sendMessage(text: string) {
      update(s => ({ ...s, loading: true, error: null }));

      try {
        const state = (await new Promise(resolve => {
          subscribe(s => resolve(s))();
        })) as ChatStore;

        const response = await apiClient.sendMessage({
          message: text,
          conversationId: state.conversationId || undefined
        });

        // Save conversation ID if new
        if (!state.conversationId) {
          localStorage.setItem(SESSION_KEY, response.conversationId);
        }

        update(s => ({
          ...s,
          conversationId: response.conversationId,
          messages: [...s.messages, response.userMessage, response.aiReply],
          loading: false,
          error: null
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to send message';

        update(s => ({
          ...s,
          loading: false,
          error: errorMessage
        }));

        throw error;
      }
    },

    clearError() {
      update(s => ({ ...s, error: null }));
    },

    reset() {
      localStorage.removeItem(SESSION_KEY);
      set({
        conversationId: null,
        messages: [],
        loading: false,
        error: null
      });
    }
  };
}

export const chatStore = createChatStore();

// Derived stores
export const messages = derived(chatStore, $chat => $chat.messages);
export const loading = derived(chatStore, $chat => $chat.loading);
export const error = derived(chatStore, $chat => $chat.error);
export const conversationId = derived(chatStore, $chat => $chat.conversationId);
