import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  firstName: string | null;
  setFirstName: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("token"));
  const [firstName, setFirstNameState] = useState<string | null>(() => localStorage.getItem("firstName"));

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (firstName) localStorage.setItem("firstName", firstName);
    else localStorage.removeItem("firstName");
  }, [firstName]);

  const setToken = (t: string | null) => setTokenState(t);
  const setFirstName = (name: string | null) => setFirstNameState(name);
  const logout = () => {
    setTokenState(null);
    setFirstNameState(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, firstName, setFirstName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
