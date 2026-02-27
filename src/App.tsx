import React from 'react';

import { ThemeProvider, CssBaseline, Box, IconButton, Button } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useChatStore } from './store/chatStore';
import { lightTheme, darkTheme } from './theme';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { useAuth } from './auth/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import './App.css';


function App() {
  const { theme, sidebarOpen, toggleSidebar } = useChatStore();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { token, logout } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {showRegister ? (
            <Box sx={{ position: 'relative' }}>
              <Register onRegistered={() => setShowRegister(false)} onToggleLogin={() => setShowRegister(false)} />
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <Login onToggleRegister={() => setShowRegister(true)} />
            </Box>
          )}
        </Box>
      </Box>
    );
  }

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
          {/* Add a logout button for convenience */}
          <Button onClick={logout} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>Logout</Button>
          <ChatInterface />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
