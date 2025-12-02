import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useChatStore } from '../store/chatStore';
import TalkTalkLogo from '../assets/TalkTalk_logoMark.svg';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { sendChatMessage } from '../services/api';
import type { ChatMessage } from '../services/api';
import type { ChatImage } from '../types/chat';

interface ImageAttachment {
  id: string;
  data: string;
  mimeType: string;
  name?: string;
  preview: string;
}

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

  const handleSendMessage = async (content: string, imageAttachments?: ImageAttachment[]) => {
    if (!currentConversationId) return;

    // Convert image attachments to ChatImage format
    const images: ChatImage[] | undefined = imageAttachments?.map(img => ({
      id: img.id,
      data: img.data,
      mimeType: img.mimeType,
      name: img.name,
    }));

    // Add user message
    addMessage(currentConversationId, {
      content,
      role: 'user',
      images,
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

      // Call the backend API with images
      const response = await sendChatMessage({
        message: content,
        conversationId: currentConversationId,
        history,
        images: images?.map(img => {
          // Extract base64 data from data URL
          const base64Data = img.data.split(',')[1] || img.data;
          // Convert mime type to format (e.g., 'image/png' -> 'png')
          const format = img.mimeType.split('/')[1] || 'png';
          return {
            format,
            source: {
              bytes: base64Data,
            },
          };
        }),
      });

      // Update the loading message with actual response
      const updatedMessages = getCurrentMessages();
      const loadingMessage = updatedMessages.find(msg => msg.isLoading);
      
      if (loadingMessage) {
        // Handle both response formats (response or content)
        const messageContent = response.content || response.response || 'No response received';
        
        updateMessage(currentConversationId, loadingMessage.id, {
          content: messageContent,
          isLoading: false,
          voiceSettings: response.voiceSettings, // Pass voice settings from backend
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
        textAlign: 'center',
        color: 'text.secondary',
        width: '100%',
        mb: '8vh',
      }}
    >
      <Box sx={{ display: 'inline-block', mb: 2.5 }}>
        <img src={TalkTalkLogo} alt="TalkTalk" style={{ width: 80, height: 80 }} />
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5, fontSize: '2rem', lineHeight: 1.2 }}>
        What are We Building Today?
      </Typography>
      
      
      {/* Centered Input */}
      <Box sx={{ width: '100%', maxWidth: '768px', mx: 'auto', px: 2 }}>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        ...(messages.length > 0 && {
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      {messages.length === 0 ? (
        /* Empty State with centered welcome and input */
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        >
          <EmptyState />
        </Box>
      ) : (
        <>
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'transparent',
            }}
          >
            <Box sx={{ 
              maxWidth: '900px',
              mx: 'auto',
              px: 2,
            }}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Input Area for chat state */}
          <Box
            sx={{
              backgroundColor: 'white',
            }}
          >
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
            />
          </Box>
        </>
      )}
    </Box>
  );
};