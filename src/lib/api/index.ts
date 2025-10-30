import axios from 'axios';
import { User } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true, // Important for cookies
});

// Add request interceptor to automatically add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the request URL for debugging
    console.debug('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export interface EmotionData {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  timestamp: string;
  context?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  emotion?: string;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  type: 'movie' | 'book' | 'music' | 'activity' | 'exercise' | 'resource';
  title: string;
  description?: string;
  emotion: string;
  url?: string;
  tags?: string[];
}

export const api = {
  // Emotion related endpoints
  emotions: {
    async analyze(text: string): Promise<{ 
      emotion: string; 
      confidence: number; 
      scores: Array<{ label: string; score: number }> 
    }> {
      if (!text?.trim()) {
        throw new Error('Please enter some text to analyze.');
      }

      try {
        const response = await axiosInstance.post(
          '/analyze',
          { text },
          { 
            headers: getAuthHeaders(),
            validateStatus: (status) => status === 200
          }
        );

        const { emotion, confidence, scores } = response.data;
        
        if (!emotion || typeof confidence !== 'number' || !Array.isArray(scores)) {
          throw new Error('Invalid response format from emotion analysis service');
        }

        return {
          emotion: emotion.toLowerCase(),
          confidence,
          scores: scores.map(s => ({
            label: s.label.toLowerCase(),
            score: s.score
          }))
        };
      } catch (error: any) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error('Invalid input. Please try again with different text.');
            case 401:
              throw new Error('Your session has expired. Please log in again.');
            case 404:
              throw new Error('Emotion analysis service is not available.');
            case 429:
              throw new Error('Too many requests. Please wait a moment before trying again.');
            default:
              throw new Error('Failed to analyze emotion. Please try again later.');
          }
        }
        throw new Error('Network error. Please check your connection and try again.');
      }
    },

    async getHistory(params?: { startDate?: string; endDate?: string }): Promise<EmotionData[]> {
      try {
        const response = await axiosInstance.get('/emotions/history', {
          params,
          headers: getAuthHeaders(),
          withCredentials: true
        });
        
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Please log in to view your emotion history');
          }
          console.error('Failed to fetch emotion history:', error.response?.data);
        } else {
          console.error('Failed to fetch emotion history:', error);
        }
        return [];
      }
    },

    async addEmotion(data: Omit<EmotionData, 'id' | 'userId' | 'timestamp'>): Promise<EmotionData | null> {
      try {
        const response = await axiosInstance.post(
          '/AddEmotion',
          data,
          { headers: getAuthHeaders() }
        );
        return response.data;
      } catch (error) {
        console.error('Failed to add emotion:', error);
        return null;
      }
    },
  },

  // Chat related endpoints
  chat: {
    async sendMessage(message: string): Promise<{ 
      response: string; 
      emotion?: string; 
      timestamp: string 
    }> {
      try {
        const response = await axiosInstance.post(
          '/aiService/chat',
          { message },
          { 
            headers: getAuthHeaders(),
            validateStatus: (status) => status >= 200 && status < 300
          }
        );

        const responseData = response.data;
        
        return {
          response: responseData.response || responseData.message || '',
          emotion: responseData.emotion,
          timestamp: responseData.timestamp || new Date().toISOString()
        };
      } catch (error: any) {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || 'Failed to send message';
          
          if (status === 401) {
            throw new Error('Please log in to continue');
          } else if (status === 429) {
            throw new Error('Too many requests. Please wait a moment.');
          }
          throw new Error(message);
        }
        throw new Error('Network error. Please check your connection.');
      }
    },
  },

  // Recommendations related endpoints
  recommendations: {
    async getRecommendations(
      emotion: string, 
      types?: Array<'movie' | 'book' | 'music' | 'activity'>
    ): Promise<Recommendation[]> {
      try {
        const response = await axiosInstance.get('/recommendations/by-emotion', {
          params: {
            emotion,
            types: types?.join(',')
          },
          headers: getAuthHeaders(),
          withCredentials: true
        });
        
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Please log in to view recommendations');
          }
          console.error('Failed to fetch recommendations:', error.response?.data);
        } else {
          console.error('Failed to fetch recommendations:', error);
        }
        return [];
      }
    },

    async getRandom(count: number = 5): Promise<Recommendation[]> {
      try {
        const response = await axiosInstance.get('/recommendations/random', {
          params: { count },
          headers: getAuthHeaders()
        });
        return response.data.data || response.data || [];
      } catch (error) {
        console.error('Failed to fetch random recommendations:', error);
        return [];
      }
    },
  },
};