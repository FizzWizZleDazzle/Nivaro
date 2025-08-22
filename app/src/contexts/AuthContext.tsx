'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthAPI, User, AuthResponse, isAuthenticated, clearAuth } from '../lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, name: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  socialLogin: (provider: string, accessToken: string, profile: { id: string; email: string; name: string; avatar?: string }) => Promise<AuthResponse>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      // Try to get current user to check if we have a valid session
      try {
        dispatch({ type: 'AUTH_START' });
        const user = await AuthAPI.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        // If we can't get the current user, we're not authenticated
        console.log('Not authenticated on init:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthAPI.login({ email, password });
      
      console.log('Login response:', response);
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Login failed' });
      }
      
      return response;
    } catch (error) {
      console.error('Login error caught:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthAPI.signup({ email, password, name });
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Signup failed' });
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await AuthAPI.forgotPassword({ email });
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await AuthAPI.resetPassword({ token, newPassword });
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await AuthAPI.changePassword({ currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }): Promise<void> => {
    try {
      const updatedUser = await AuthAPI.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await AuthAPI.deleteAccount();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await AuthAPI.verifyEmail(token);
      // Refresh user data to update verification status
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const socialLogin = async (provider: string, accessToken: string, profile: { id: string; email: string; name: string; avatar?: string }): Promise<AuthResponse> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthAPI.socialLogin({
        provider: provider as 'google' | 'github' | 'microsoft' | 'discord',
        accessToken,
        profile,
      });
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Social login failed' });
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async (): Promise<void> => {
    if (isAuthenticated()) {
      try {
        const user = await AuthAPI.getCurrentUser();
        dispatch({ type: 'UPDATE_USER', payload: user });
      } catch (error) {
        console.error('Failed to refresh user:', error);
        clearAuth();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    deleteAccount,
    verifyEmail,
    socialLogin,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for authentication guard
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, isLoading]);
  
  return { isAuthenticated, isLoading, user };
}