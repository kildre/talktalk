export interface ChatImage {
  id: string;
  data: string; // base64 encoded image
  mimeType: string;
  name?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  images?: ChatImage[];
  voiceSettings?: {
    voice?: string;
    speed?: number;
    pitch?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  // Current conversation
  currentConversationId: string | null;
  conversations: Conversation[];
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isTyping: boolean;
  
  // Actions
  createNewConversation: () => void;
  setCurrentConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setIsTyping: (isTyping: boolean) => void;
  
  // Computed getters
  getCurrentConversation: () => Conversation | null;
  getCurrentMessages: () => ChatMessage[];
}