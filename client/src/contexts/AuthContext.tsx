/**
 * PhytoPathometric — AuthContext
 * Local auth: signup/login stored in localStorage (no backend needed).
 * Scalable: swap localStorage calls with API calls when backend is ready.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'phyto_users';
const SESSION_KEY = 'phyto_session';

function getUsers(): Record<string, { user: User; password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession());
  const [isLoading] = useState(false);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const users = getUsers();
    const key = email.toLowerCase().trim();

    if (users[key]) {
      return { ok: false, error: 'email_exists' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'password_short' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: key,
      createdAt: new Date().toISOString(),
    };

    users[key] = { user: newUser, password };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { ok: true };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const key = email.toLowerCase().trim();
    const record = users[key];

    if (!record) return { ok: false, error: 'user_not_found' };
    if (record.password !== password) return { ok: false, error: 'wrong_password' };

    localStorage.setItem(SESSION_KEY, JSON.stringify(record.user));
    setUser(record.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
