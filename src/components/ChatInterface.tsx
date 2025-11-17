import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import {
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { sendChatMessage } from '../services/api';
import type { ChatMessage } from '../services/api';

export const ChatInterface: React.FC = () => {
  const {
    currentConversationId,
    getCurrentMessages,
    addMessage,
    updateMessage,
    createNewConversation,
    isTyping,
    setIsTyping,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = getCurrentMessages();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create initial conversation if none exists
  useEffect(() => {
    if (!currentConversationId) {
      createNewConversation();
    }
  }, [currentConversationId, createNewConversation]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    // Add user message
    addMessage(currentConversationId, {
      content,
      role: 'user',
    });

    // Add loading message for assistant
    addMessage(currentConversationId, {
      content: '',
      role: 'assistant',
      isLoading: true,
    });

    setIsTyping(true);

    try {
      // Get conversation history
      const history: ChatMessage[] = getCurrentMessages()
        .filter(msg => !msg.isLoading)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call the backend API
      const response = await sendChatMessage({
        message: content,
        conversationId: currentConversationId,
        history,
      });

      // Update the loading message with actual response
      const updatedMessages = getCurrentMessages();
      const loadingMessage = updatedMessages.find(msg => msg.isLoading);
      
      if (loadingMessage) {
        updateMessage(currentConversationId, loadingMessage.id, {
          content: response.response,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update the loading message with error
      const updatedMessages = getCurrentMessages();
      const loadingMessage = updatedMessages.find(msg => msg.isLoading);
      
      if (loadingMessage) {
        updateMessage(currentConversationId, loadingMessage.id, {
          content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
          isLoading: false,
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const EmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <BotIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
      <Typography variant="h4" gutterBottom>
        Welcome to TalkTalk
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 400 }}>
        Start a conversation by typing a message below. I'm here to help with questions, 
        creative tasks, analysis, and more!
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'background.default',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <Box>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />
    </Box>
  );
};