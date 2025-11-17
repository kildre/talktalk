import React from 'react';
import { ThemeProvider, CssBaseline, Box, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useChatStore } from './store/chatStore';
import { lightTheme, darkTheme } from './theme';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  const { theme, sidebarOpen, toggleSidebar } = useChatStore();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${sidebarOpen ? 260 : 0}px)` },
            ml: { sm: sidebarOpen ? '260px' : 0 },
            transition: 'margin 0.3s, width 0.3s',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Desktop Toggle Button */}
          {!sidebarOpen && (
            <IconButton
              onClick={toggleSidebar}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
                display: { xs: 'none', sm: 'flex' },
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <ChatInterface />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
