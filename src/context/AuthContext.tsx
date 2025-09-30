'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub: string;
  role?: string;
  exp?: number;
  [key: string]: any;
};

type AuthContextType = {
  isLoggedIn: boolean;
  role: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pt_jwt");
    if (saved) login(saved);
  }, []);

  function login(newToken: string) {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        logout();
        return;
      }
      setToken(newToken);
      setRole(decoded.role ?? null);
      localStorage.setItem("pt_jwt", newToken);
    } catch {
      logout();
    }
  }

  function logout() {
    setToken(null);
    setRole(null);
    localStorage.removeItem("pt_jwt");
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token, role, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
