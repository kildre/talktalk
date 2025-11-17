import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { immer } from 'zustand/middleware/immer';
import type { ChatState, Conversation, ChatMessage } from '../types/chat';

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    // Initial state
    currentConversationId: null,
    conversations: [],
    sidebarOpen: true,
    theme: 'light',
    isTyping: false,

    // Actions
    createNewConversation: () => {
      set((state) => {
        const newConversation: Conversation = {
          id: nanoid(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        state.conversations.unshift(newConversation);
        state.currentConversationId = newConversation.id;
      });
    },

    setCurrentConversation: (id: string) => {
      set((state) => {
        state.currentConversationId = id;
      });
    },

    deleteConversation: (id: string) => {
      set((state) => {
        state.conversations = state.conversations.filter(conv => conv.id !== id);
        if (state.currentConversationId === id) {
          state.currentConversationId = state.conversations[0]?.id || null;
        }
      });
    },

    addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          const newMessage: ChatMessage = {
            ...message,
            id: nanoid(),
            timestamp: new Date(),
          };
          
          conversation.messages.push(newMessage);
          conversation.updatedAt = new Date();
          
          // Update title based on first user message
          if (conversation.messages.length === 1 && message.role === 'user') {
            conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          }
        }
      });
    },

    updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
      set((state) => {
        const conversation = state.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          const message = conversation.messages.find(msg => msg.id === messageId);
          if (message) {
            Object.assign(message, updates);
            conversation.updatedAt = new Date();
          }
        }
      });
    },

    toggleSidebar: () => {
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      });
    },

    toggleTheme: () => {
      set((state) => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
      });
    },

    setIsTyping: (isTyping: boolean) => {
      set((state) => {
        state.isTyping = isTyping;
      });
    },

    // Computed getters
    getCurrentConversation: () => {
      const state = get();
      return state.conversations.find(conv => conv.id === state.currentConversationId) || null;
    },

    getCurrentMessages: () => {
      const state = get();
      const currentConversation = state.getCurrentConversation();
      return currentConversation?.messages || [];
    },
  }))
);