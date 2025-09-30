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

  function syncAuth() {
    const tokenStorage = localStorage.getItem("pt_jwt");
    if (tokenStorage) {
      try {
        const decoded = jwtDecode<JwtPayload>(tokenStorage);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("pt_jwt");
        } else {
          setToken(tokenStorage);
          setUser(decoded);
        }
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem("pt_jwt");
      }
    } else {
      setToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    syncAuth();

    const listener = () => syncAuth();
    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener("storage", listener);
    };
  }, []);

  return {
    isLoggedIn: !!token && !!user,
    user,
    role: user?.role ?? null,
    token,
  };
}
