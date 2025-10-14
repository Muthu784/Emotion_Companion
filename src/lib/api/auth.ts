import axios from 'axios';

export interface User {
  id: number;
  email: string;
  username?: string;
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
      console.log('Sending login request with:', { email, password: '[HIDDEN]' });
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
      console.error('auth.login error:', error?.response?.data || error);
      
      const status = error?.response?.status;
      const message = error?.response?.data?.message || 'An error occurred during login';

      return {
        user: null,
        token: null,
        error: status ? `${message} (status ${status})` : message,
      };
    }
  },

  async register(email: string, password: string, username?: string): Promise<AuthResponse> {
    try {
      // Use username instead of name to match backend
      const payload = {
        email: email,
        user: {
          username: username || email.split('@')[0], // Use username or derive from email
          password: password,
        }
      };

      console.debug('auth.register payload:', { ...payload, user: { ...payload.user, password: '[HIDDEN]' } });
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
      console.error('auth.register error:', error?.response?.data || error);

      const status = error?.response?.status;
      const serverData = error?.response?.data;
      const messageFromServer = serverData?.message || serverData?.error || serverData?.errors || (typeof serverData === 'string' ? serverData : undefined);
      
      let friendlyMessage = messageFromServer;
      if (typeof messageFromServer === 'string') {
        const lower = messageFromServer.toLowerCase();
        if (lower.includes('user already') || lower.includes('already exist') || lower.includes('email already')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (lower.includes('please provide user') || lower.includes('please provide user and email')) {
          friendlyMessage = 'Registration failed: server requires a user object and email field in the request body.';
        } else if (lower.includes('username')) {
          friendlyMessage = 'Please provide a username.';
        }
      }
      const message = messageFromServer || 'An error occurred during registration';

      const fullMessage = status ? `${friendlyMessage || message} (status ${status})` : (friendlyMessage || message);

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
      if (!token) {
        console.log('getCurrentUser: no token found');
        return null;
      }
      
      console.log('getCurrentUser: token found, attempting to fetch user...');
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      console.log('getCurrentUser: success', response.data);
      return response.data.user;
      
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      // If unauthorized, clear stale token so we don't keep retrying with invalid creds
      if (status === 401) {
        console.debug('getCurrentUser: unauthorized (401) - clearing token')
        try { localStorage.removeItem('token') } catch (e) { /* ignore */ }
        return null
      }

      // Server error — keep as error for visibility. Other statuses we log as debug.
      if (status === 500) {
        console.error('getCurrentUser: server error (500):', data || err.message)
      } else {
        console.debug('getCurrentUser: failed:', { status, data, message: err.message })
      }

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