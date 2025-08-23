'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, LoginCredentials, SignupData, AuthResponse } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    if (response.success && response.user) {
      setUser(response.user);
      router.push('/dashboard');
    }
    return response;
  };

  const signup = async (data: SignupData): Promise<AuthResponse> => {
    const response = await authService.signup(data);
    if (response.success) {
      router.push('/auth/verify-email');
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  };

  const updateProfile = async (data: Partial<User>): Promise<AuthResponse> => {
    const response = await authService.updateProfile(data);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}