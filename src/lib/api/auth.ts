import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      
      return {
        user,
        token,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        token: null,
        error: error.response?.data?.message || 'An error occurred during login',
      };
    }
  },

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      
      return {
        user,
        token,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        token: null,
        error: error.response?.data?.message || 'An error occurred during registration',
      };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return {
        user: response.data.user,
        token: token,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        token: null,
        error: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },
};