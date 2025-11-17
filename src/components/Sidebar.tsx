import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const {
    conversations,
    currentConversationId,
    createNewConversation,
    setCurrentConversation,
    deleteConversation,
    toggleTheme,
    theme: appTheme,
  } = useChatStore();

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const drawerContent = (
    <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          New Chat
        </Button>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 1 }}>
          {conversations.map((conversation) => (
            <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={conversation.id === currentConversationId}
                onClick={() => handleSelectConversation(conversation.id)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ChatIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <ListItemText
                  primary={conversation.title}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                    sx: { fontSize: '14px' },
                  }}
                />
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  sx={{ 
                    opacity: 0,
                    '.MuiListItemButton-root:hover &': { opacity: 1 },
                    ml: 1,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="text"
          fullWidth
          startIcon={appTheme === 'light' ? <DarkMode /> : <LightMode />}
          onClick={toggleTheme}
          sx={{ justifyContent: 'flex-start' }}
        >
          {appTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: theme.zIndex.drawer + 1,
          display: { sm: 'none' },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};