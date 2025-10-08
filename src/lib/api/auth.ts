import axios from 'axios';
// dotenv is a Node-only library and must not be used in client-side code.
// Vite provides client env vars via import.meta.env, so we avoid using `process`/dotenv here.

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      // Log full error for easier debugging in browser console
      console.error('auth.login error:', error?.response ?? error)

      const status = error?.response?.status
      const message = error?.response?.data?.message || 'An error occurred during login'

      return {
        user: null,
        token: null,
        error: status ? `${message} (status ${status})` : message,
      };
    }
  },

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      // Include both `name` and `username` to match different backend expectations.
      // Also include a nested `user` object because some backends destructure `user` from req.body
      // (e.g. `const { user } = req.body`). Sending both shapes increases compatibility.
      const payload: Record<string, any> = {
        email,
        password,
        user: {
          email,
          password,
          name: name || undefined,
        },
      }
      if (name) {
        payload.name = name
        payload.username = name
      }
      // Helpful client-side debug: show what we're sending to the server
      console.debug('auth.register payload:', payload)
      const response = await axios.post(
        `${API_URL}/auth/register`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      
      return {
        user,
        token,
        error: null,
      };
    } catch (error: any) {
      // Log full error for easier debugging in browser console
      // Include response body, headers and status when available.
      console.error('auth.register error:', error)
      console.error('auth.register response.data:', error?.response?.data)

      const status = error?.response?.status
      // Try a few common shapes for server error messages
      const serverData = error?.response?.data
      const messageFromServer = serverData?.message || serverData?.error || serverData?.errors || (typeof serverData === 'string' ? serverData : undefined)
      const message = messageFromServer || 'An error occurred during registration'

      const fullMessage = status ? `${message} (status ${status})` : message

      return {
        user: null,
        token: null,
        error: fullMessage,
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