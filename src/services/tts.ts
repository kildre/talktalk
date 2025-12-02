// Text-to-Speech Service using Google Cloud TTS

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

/**
 * Convert text to speech using Google Cloud TTS
 * Returns an audio blob that can be played
 */
export const textToSpeech = async (request: TTSRequest): Promise<Blob> => {
  try {
    const response = await fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `TTS request failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};
