import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ChatMessage } from '../types/chat';
import TalkTalkLogo from '../assets/TalkTalk_logoMark.svg';
import { textToSpeech } from '../services/tts';
// import TalkTalkLogo from '../assets/Owl.svg';

interface MessageBubbleProps {
  message: ChatMessage;
}

const ThinkingAnimation: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ position: 'relative', width: 40, height: 40 }}>
      {/* TalkTalk Head with rotation */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          animation: 'rotate 3s linear infinite',
          zIndex: 2,
          '@keyframes rotate': {
            '0%': {
              transform: 'translate(-50%, -50%) rotate(0deg)',
            },
            '100%': {
              transform: 'translate(-50%, -50%) rotate(360deg)',
            },
          },
        }}
      >
        <img 
          src={TalkTalkLogo} 
          alt="Thinking" 
          style={{ 
            width: '100%', 
            height: '100%',
            display: 'block',
          }} 
        />
      </Box>
      
      {/* Pulsing Beacon Waves from center */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 8,
          zIndex: 1,
        }}
      >
        {[0, 0.6, 1.2].map((delay, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #ff85c0',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 2s ease-out infinite',
              animationDelay: `${delay}s`,
              '@keyframes pulse': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0.5)',
                  opacity: 0.8,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(5)',
                  opacity: 0,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
    <Typography variant="body2" sx={{ color: '#666', fontSize: '16px' }}>
      Thinking...
    </Typography>
  </Box>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Cleanup audio on unmount to prevent ghost audio playback
  useEffect(() => {
    return () => {
      // Stop and cleanup any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      // Stop browser speech synthesis
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = async () => {
    if (isSpeaking) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Get selected text if any, otherwise use full message
    let textToSpeak = message.content;
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && contentRef.current?.contains(selection.anchorNode)) {
      textToSpeak = selection.toString();
    }

    // Strip markdown formatting for speech
    const cleanText = textToSpeak
      .replace(/#{1,6}\s/g, '') // Remove heading markers (# ## ###)
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.+?)\*/g, '$1') // Remove italic *text*
      .replace(/_(.+?)_/g, '$1') // Remove italic _text_
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links [text](url)
      .replace(/`{1,3}(.+?)`{1,3}/g, '$1') // Remove code `code` and ```code```
      .replace(/^\s*[-*+]\s/gm, '. ') // Replace list markers with period for pause
      .replace(/^\s*\d+\.\s/gm, '. ') // Replace numbered list markers with period for pause
      .replace(/>\s/g, '') // Remove blockquote markers
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with period
      .replace(/\n/g, '. ') // Replace single newlines with period for pause
      .replace(/\.{2,}/g, '.') // Clean up multiple periods
      .replace(/\.\s*\./g, '.') // Clean up consecutive periods with spaces
      .trim();

    try {
      // Use voice settings from backend if available, otherwise use defaults
      const voiceSettings = message.voiceSettings || {};
      const voice = voiceSettings.voice || 'en-GB-Neural2-B'; // Default: British authoritative
      const speed = voiceSettings.speed !== undefined ? voiceSettings.speed : 4.0; // Default: 4.0
      const pitch = voiceSettings.pitch !== undefined ? voiceSettings.pitch : -9.0; // Default: -9.0
      
      // Try Google Cloud TTS first
      const audioBlob = await textToSpeech({
        text: cleanText,
        voice,
        speed,
        pitch,
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Increase playback speed for even faster speech
      audio.playbackRate = 5; // Multiplies the TTS speed (4.0 * 1.5 = 6x total)

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        audioRef.current = null;
        console.error('Audio playback error');
      };

      await audio.play();
    } catch (error) {
      console.error('Google Cloud TTS failed, falling back to browser TTS:', error);
      
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Load voices if not loaded yet
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        await new Promise(resolve => {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(undefined);
          };
        });
      }
      
      // Priority list for HAL-like voices
      const preferredVoices = [
        'Alex', // macOS - BEST quality
        'Daniel (Enhanced)', // macOS UK
        'Google UK English Male',
        'Google US English Male',
        'Microsoft David Desktop',
        'Microsoft Mark',
      ];
      
      let selectedVoice = voices.find(voice => 
        preferredVoices.some(preferred => voice.name.includes(preferred))
      );
      
      // Fallback: any deep male voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('daniel'))
        );
      }
      
      // Final fallback: any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      }
      
      // HAL-like settings
      utterance.rate = 0.75; // Much slower - HAL is very deliberate
      utterance.pitch = 0.75; // Lower pitch
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 2,
        py: 3,
        px: 4,
        maxWidth: '100%',
        backgroundColor: isUser ? 'transparent' : '#fafafa',
      }}
    >
      {/* Message Content */}
      <Box 
        sx={{ 
          minWidth: 0,
          width: isUser ? '55%' : '85%',
          maxWidth: isUser ? '55%' : '85%',
        }}
      >
        {isLoading ? (
          <ThinkingAnimation />
        ) : (
          <Box>
            {isUser ? (
              <Box
                sx={{
                  backgroundColor: '#fff0f6',
                  border: '2px solid #ff85c0',
                  borderRadius: '12px',
                  p: 2.5,
                  boxShadow: '0 2px 8px rgba(255, 133, 192, 0.15)',
                }}
              >
                {/* Display images if any */}
                {message.images && message.images.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: message.content ? 2 : 0 }}>
                    {message.images.map((img) => (
                      <Box
                        key={img.id}
                        sx={{
                          maxWidth: 200,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: 1,
                          borderColor: '#ffb3d9',
                        }}
                      >
                        <img
                          src={img.data}
                          alt={img.name || 'Attached image'}
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
                {message.content && (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: '#2d2d2d',
                    }}
                  >
                    {message.content}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Box
                  ref={contentRef}
                  sx={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: '#1a1a1a',
                  '& pre': {
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 2,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    border: '1px solid #e0e0e0',
                  },
                  '& code': {
                    backgroundColor: '#f5f5f5',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    color: '#d63384',
                    border: '1px solid #e8e8e8',
                  },
                  '& p': {
                    mb: 1.5,
                    '&:last-child': { mb: 0 },
                  },
                  '& ul, & ol': {
                    pl: 3,
                    mb: 1.5,
                    '&:last-child': { mb: 0 },
                  },
                  '& li': {
                    mb: 0.5,
                  },
                  '& blockquote': {
                    borderLeft: '4px solid',
                    borderColor: '#ff85c0',
                    pl: 2,
                    ml: 0,
                    fontStyle: 'italic',
                    color: '#555',
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 2,
                    mb: 1,
                    fontWeight: 600,
                    color: '#1a1a1a',
                  },
                }}
              >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Box>
                {/* Text-to-speech button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={handleSpeak}
                    sx={{
                      color: isSpeaking ? '#ff85c0' : '#999',
                      '&:hover': {
                        color: '#ff85c0',
                        backgroundColor: 'rgba(255, 133, 192, 0.1)',
                      },
                    }}
                  >
                    {isSpeaking ? <StopIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};