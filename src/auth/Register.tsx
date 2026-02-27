

import React, { useState } from "react";
import { registerUser } from "../api";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import TalkTalkLogo from "../assets/TalkTalk_logo.svg";

interface RegisterProps {
  onToggleLogin?: () => void;
  onRegistered?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggleLogin, onRegistered }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await registerUser(form);
      // Store first name in localStorage for later use
      localStorage.setItem("firstName", form.first_name);
      setSuccess(true);
      if (onRegistered) onRegistered();
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
          <Typography variant="h5" align="center">Register</Typography>
          <TextField
            name="first_name"
            label="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <TextField
            name="last_name"
            label="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary">Register</Button>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Registration successful!</Alert>}
        </Box>
        {onToggleLogin && (
          <Button onClick={onToggleLogin} sx={{ mt: 2, width: '100%' }}>Already have an account? Login</Button>
        )}
      </Paper>
    </Box>
  );
};

export default Register;
