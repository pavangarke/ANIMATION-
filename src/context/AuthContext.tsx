import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  apiGetMe,
  apiLogin,
  apiRegister,
  apiLogout,
  getStoredToken,
  setStoredToken,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'register' | 'forgot';
  openAuthModal: (mode?: 'signin' | 'register' | 'forgot', onAuthenticated?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Check initial authentication
  useEffect(() => {
    async function checkAuth() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: fetchedUser } = await apiGetMe();
        setUser(fetchedUser);
        setToken(stored);
      } catch (err) {
        console.warn('Initial session check failed:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    await login('pavangarke7869@gmail.com', 'animai123');
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore logout errors
    } finally {
      setToken(null);
      setUser(null);
      setStoredToken(null);
    }
  };

  const openAuthModal = (mode: 'signin' | 'register' | 'forgot' = 'signin', onAuthenticated?: () => void) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (onAuthenticated) {
      setPendingCallback(() => onAuthenticated);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginAsDemo,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
