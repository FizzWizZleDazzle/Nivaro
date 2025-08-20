// Authentication and session management utilities

import { MemberRole } from './types';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  token?: string;
  expiresAt?: string;
}

export interface ClubSession extends AuthSession {
  clubId: string;
  clubName: string;
  memberRole: MemberRole;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  expiresAt?: string;
  error?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'github' | 'microsoft' | 'discord';
  accessToken: string;
  profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

// Authentication API functions
const API_BASE = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  ? 'https://nivaroapi.fizzwizzledazzle.com'
  : process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
  ? 'https://nivaroapi.fizzwizzledazzle.dev'
  : 'http://localhost:8788';

// CSRF Token Management
let csrfToken: string | null = null;
let csrfTokenExpiry: Date | null = null;

async function getCsrfToken(): Promise<string> {
  // Check if we have a valid token
  if (csrfToken && csrfTokenExpiry && csrfTokenExpiry > new Date()) {
    return csrfToken;
  }

  try {
    const response = await fetch(`${API_BASE}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Include httpOnly auth cookies
    });

    if (!response.ok) {
      throw new Error(`CSRF token request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('No CSRF token received from server');
    }
    
    const token = data.token as string;
    csrfToken = token;
    csrfTokenExpiry = new Date(data.expires_at);
    
    return token;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
}

function clearCsrfToken(): void {
  csrfToken = null;
  csrfTokenExpiry = null;
}

export class AuthAPI {
  private static async request(endpoint: string, options?: RequestInit, requiresCsrf: boolean = false): Promise<unknown> {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for httpOnly auth tokens
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Add CSRF token for state-changing operations
    if (requiresCsrf && options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      try {
        const token = await getCsrfToken();
        mergedOptions.headers = {
          ...mergedOptions.headers,
          'X-CSRF-Token': token,
        };
      } catch (error) {
        console.error('Failed to get CSRF token for request:', error);
        throw new Error('CSRF token required but unavailable');
      }
    }

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();
      
      if (!response.ok) {
        // Clear CSRF token if we get a 403 (might be expired)
        if (response.status === 403 && requiresCsrf) {
          clearCsrfToken();
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async signup(request: SignupRequest): Promise<AuthResponse> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as Promise<AuthResponse>;
  }

  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as AuthResponse;
    
    // Token is now handled via httpOnly cookies automatically
    return response;
  }

  static async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
    // Clear CSRF token after logout
    clearCsrfToken();
  }

  static async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as Promise<{ message: string }>;
  }

  static async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as Promise<{ message: string }>;
  }

  static async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true) as Promise<{ message: string }>;
  }

  static async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }) as Promise<{ message: string }>;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await this.request('/api/auth/me') as { data: User };
    return response.data;
  }

  static async updateProfile(request: UpdateProfileRequest): Promise<User> {
    const response = await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(request),
    }, true) as { data: User };
    return response.data;
  }

  static async deleteAccount(): Promise<{ message: string }> {
    const response = await this.request('/api/auth/account', {
      method: 'DELETE',
    }, true) as { message: string };
    
    // Clear CSRF token after account deletion
    clearCsrfToken();
    return response;
  }

  static async socialLogin(request: SocialLoginRequest): Promise<AuthResponse> {
    const response = await this.request('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as AuthResponse;
    
    // Token is now handled via httpOnly cookies automatically
    return response;
  }

  static async getSessions(): Promise<unknown[]> {
    const response = await this.request('/api/auth/sessions') as { data: unknown[] };
    return response.data;
  }

  static async revokeAllSessions(): Promise<{ message: string }> {
    const response = await this.request('/api/auth/sessions', {
      method: 'DELETE',
    }, true) as { message: string };
    
    // Clear CSRF token after session revocation
    clearCsrfToken();
    return response;
  }
}

// Utility functions
export function isAuthenticated(): boolean {
  // With httpOnly cookies, we can't directly check auth status from client
  // This would typically require a call to the /api/auth/me endpoint
  // or implementing a session check endpoint that returns only boolean
  // For now, return false as we can't access httpOnly cookies from JS
  return false;
}

export function getAuthToken(): string | null {
  // With httpOnly cookies, auth tokens are not accessible from JavaScript
  // This is by design for security - prevents XSS attacks
  return null;
}

export function clearAuth(): void {
  // httpOnly cookies can only be cleared by the server
  // This function is kept for compatibility but does nothing
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Role-based access control functions

export function isAdmin(role: MemberRole): boolean {
  return role === MemberRole.ADMIN;
}

export function canEditClub(role: MemberRole): boolean {
  return isAdmin(role);
}

export function canInviteMembers(role: MemberRole): boolean {
  return isAdmin(role);
}

export function canManageContent(role: MemberRole): boolean {
  return isAdmin(role);
}

// CSRF-protected API utility for other modules
export async function apiRequestWithCsrf(endpoint: string, options?: RequestInit): Promise<unknown> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Add CSRF token for state-changing operations
  if (options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    try {
      const token = await getCsrfToken();
      mergedOptions.headers = {
        ...mergedOptions.headers,
        'X-CSRF-Token': token,
      };
    } catch (error) {
      console.error('Failed to get CSRF token for request:', error);
      throw new Error('CSRF token required but unavailable');
    }
  }

  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      // Clear CSRF token if we get a 403 (might be expired)
      if (response.status === 403 && options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
        clearCsrfToken();
      }
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Export CSRF token utilities for manual use if needed
export { getCsrfToken, clearCsrfToken };