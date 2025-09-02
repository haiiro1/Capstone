import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";

type User = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("pg_token"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) localStorage.setItem("pg_token", token);
    else localStorage.removeItem("pg_token");
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.access_token);
    // si tu backend expone /auth/me, puedes llamar y setUser(await api.get(...))
  };

  const register = async (payload: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token, login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}