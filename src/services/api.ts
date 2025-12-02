// API Service for backend communication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: ChatMessage[];
  images?: Array<{
    format: string;
    source: {
      bytes: string;
    };
  }>;
}

export interface ChatResponse {
  response?: string;        // Old format
  content?: string;         // New format from your backend
  role?: string;
  id?: number;
  chat_id?: number;
  created_at?: string;
  conversationId?: string;
  voiceSettings?: {
    voice?: string;
    speed?: number;
    pitch?: number;
  };
}

/**
 * Send a chat message to the backend API
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('Sending request to:', `${API_URL}/chat`);
    console.log('Request payload:', request);
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Stream chat response from the backend (if your API supports streaming)
 */
export const streamChatMessage = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Error streaming chat message:', error);
    onError(error as Error);
  }
};

/**
 * Health check endpoint
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
