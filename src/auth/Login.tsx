

import React, { useState } from "react";
import { loginUser } from "../api";
import { useAuth } from "./AuthContext";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import TalkTalkLogo from "../assets/TalkTalk_logo.svg";

interface LoginProps {
  onToggleRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleRegister }) => {
  const { setToken, setFirstName } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { access_token } = await loginUser({ email, password });
      setToken(access_token);
      // Load firstName from localStorage if it exists
      const storedFirstName = localStorage.getItem("firstName");
      if (storedFirstName) {
        setFirstName(storedFirstName);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box
        sx={{
          position: "fixed",
          top: { xs: "30%", sm: "28%", md: "25%", lg: "22%" },
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Box
          component="img"
          src={TalkTalkLogo}
          alt="TalkTalk Logo"
          sx={{
            width: { xs: "80vw", sm: "60vw", md: "50vw", lg: "40vw" },
            maxWidth: "900px",
            minWidth: "300px",
            opacity: 0.08,
            objectFit: "contain",
          }}
        />
      </Box>
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, zIndex: 1, position: "relative" }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" align="center">Login</Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary">Login</Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
        {onToggleRegister && (
          <Button onClick={onToggleRegister} sx={{ mt: 2, width: '100%' }}>Need an account? Register</Button>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
