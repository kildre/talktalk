import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Message TalkTalk...",
}) => {
  const [message, setMessage] = useState('');
  const textFieldRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 1,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          maxWidth: '768px',
          mx: 'auto',
        }}
      >
        <TextField
          ref={textFieldRef}
          multiline
          fullWidth
          variant="standard"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxRows={8}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '16px',
              '& .MuiInputBase-input': {
                py: 1,
                px: 1.5,
                resize: 'none',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 1,
                },
              },
            },
          }}
        />
        <IconButton
          type="submit"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          size="small"
          sx={{
            mb: 0.5,
            mr: 0.5,
            backgroundColor: message.trim() && !disabled ? 'primary.main' : 'grey.300',
            color: message.trim() && !disabled ? 'white' : 'grey.500',
            '&:hover': {
              backgroundColor: message.trim() && !disabled ? 'primary.dark' : 'grey.400',
            },
            '&.Mui-disabled': {
              backgroundColor: 'grey.300',
              color: 'grey.500',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>
      
      {/* Helper text */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box
          component="span"
          sx={{
            fontSize: '12px',
            color: 'text.secondary',
          }}
        >
          Press Enter to send, Shift+Enter for new line
        </Box>
      </Box>
    </Box>
  );
};