'use client';

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub: string;
  role?: string;
  exp?: number;
  [key: string]: any;
};

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const tokenCookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("pt_jwt="))
      ?.split("=")[1] ?? null;

    if (tokenCookie) {
      setToken(tokenCookie);
      try {
        setUser(jwtDecode<JwtPayload>(tokenCookie));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return {
    isLoggedIn: !!token,
    user,
    role: user?.role ?? null,
    token,
  };
}