import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

axios.defaults.withCredentials = true;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  expires_at?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private csrfToken: string | null = null;

  async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/csrf`);
      this.csrfToken = response.data.token;
      return response.data.token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/login`,
        credentials
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/signup`,
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      this.csrfToken = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get<AuthResponse>(
        `${API_URL}/api/auth/me`
      );
      return response.data.user || null;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await axios.put<AuthResponse>(
        `${API_URL}/api/auth/profile`,
        data,
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Update failed'
      };
    }
  }
}

export const authService = new AuthService();