import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

interface ImageAttachment {
  id: string;
  data: string;
  mimeType: string;
  name?: string;
  preview: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, images?: ImageAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Message TalkTalk...",
}) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || images.length > 0) && !disabled) {
      onSendMessage(message.trim(), images.length > 0 ? images : undefined);
      setMessage('');
      setImages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await processImageFile(file);
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImageFile = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const newImage: ImageAttachment = {
          id: `img-${Date.now()}-${Math.random()}`,
          data,
          mimeType: file.type,
          name: file.name,
          preview: data,
        };
        setImages(prev => [...prev, newImage]);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startRecording = async () => {
    try {
      // Check for browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textField = textFieldRef.current?.querySelector('textarea');
    if (textField) {
      textField.style.height = 'auto';
      textField.style.height = `${Math.min(textField.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'white',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pt: 1.5,
          pr: 1.5,
          pb: 1.5,
          pl: 1,
          borderRadius: 3,
          border: '2px solid',
          borderColor: '#e8e8e8',
          maxWidth: '768px',
          mx: 'auto',
          backgroundColor: 'white',
          transition: 'border-color 0.2s',
          '&:focus-within': {
            borderColor: '#ff85c0',
            boxShadow: '0 0 0 3px rgba(255, 133, 192, 0.1)',
          },
        }}
      >
        {/* Image previews */}
        {images.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 1 }}>
            {images.map((img) => (
              <Box
                key={img.id}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <img
                  src={img.preview}
                  alt={img.name || 'Pasted image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(img.id)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Input area */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, pt: 1.5 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            sx={{
              mb: 0.5,
              ml: 0,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <ImageIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            sx={{
              mb: 0.5,
              color: isRecording ? '#ff85c0' : 'text.secondary',
              '&:hover': {
                color: isRecording ? '#ff6bb0' : 'primary.main',
              },
            }}
          >
            {isRecording ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          </IconButton>

          <TextField
            ref={textFieldRef}
            multiline
            fullWidth
            variant="standard"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            maxRows={8}
            sx={{
              ml: -1,
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '16px',
                '& .MuiInputBase-input': {
                  py: 1.5,
                  pl: 0,
                  pr: 2,
                  resize: 'none',
                  lineHeight: 1.5,
                  color: '#1a1a1a',
                  textAlign: 'left',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
              },
            }}
          />
          <IconButton
            type="submit"
            onClick={handleSubmit}
            disabled={(!message.trim() && images.length === 0) || disabled}
            size="medium"
            sx={{
              mb: 0.5,
              mr: 0.5,
              width: 40,
              height: 40,
              backgroundColor: (message.trim() || images.length > 0) && !disabled ? '#ff85c0' : '#e8e8e8',
              color: (message.trim() || images.length > 0) && !disabled ? 'white' : '#999',
              '&:hover': {
                backgroundColor: (message.trim() || images.length > 0) && !disabled ? '#ff6bb0' : '#ddd',
              },
              '&.Mui-disabled': {
                backgroundColor: '#e8e8e8',
                color: '#999',
              },
              transition: 'all 0.2s',
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Helper text */}
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Box
          component="span"
          sx={{
            fontSize: '13px',
            color: '#888',
          }}
        >
          Press Enter to send, Shift+Enter for new line, Ctrl+V to paste images
        </Box>
      </Box>
    </Box>
  );
};