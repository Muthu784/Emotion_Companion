import axios from 'axios';
import { User } from './auth';

const API_URL = import.meta.env.API_URL || 'http://localhost:5000/api';

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
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
    async analyze(text: string): Promise<{ emotion: string; confidence: number; scores: Array<{ label: string; score: number }> }> {
      if (!text?.trim()) {
        throw new Error('Please enter some text to analyze.');
      }

      try {
        const response = await axios.post(
          `${API_URL}/emotions/analyze`,
          { text },
          { 
            headers: getAuthHeaders(),
            timeout: 30000 // Increased timeout for AI processing
          }
        );
        
        if (!response.data || !response.data.emotion || typeof response.data.confidence !== 'number') {
          throw new Error('Invalid response format from emotion analysis service');
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Failed to analyze emotion:', error);
        
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        
        switch (error.response.status) {
          case 400:
            throw new Error('Invalid input. Please try again with different text.');
          case 401:
            throw new Error('Authentication required. Please log in again.');
          case 404:
            throw new Error('Emotion analysis service not found.');
          case 500:
            throw new Error('The emotion analysis service is currently experiencing issues. Please try again later.');
          default:
            throw new Error('An unexpected error occurred. Please try again later.');
        }
      }
    },

    async getHistory(params?: { startDate?: string; endDate?: string }): Promise<EmotionData[]> {
      try {
        const response = await axios.get(
          `${API_URL}/emotions/history`,
          { 
            headers: getAuthHeaders(),
            params,
            timeout: 10000
          }
        );
        
        const data = response.data.data || response.data;
        
        // Check if we have valid history data
        if (Array.isArray(data) && data.length > 0 && data[0]?.emotion) {
          return data;
        }
        
        return [];
      } catch (error) {
        // Don't log error if it's just a 404 (no history found)
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error('Failed to fetch emotion history:', error);
        }
        return [];
      }
    },

    async addEmotion(data: Omit<EmotionData, 'id' | 'userId' | 'timestamp'>): Promise<EmotionData | null> {
      try {
        const response = await axios.post(
          `${API_URL}/emotions/add`,
          data,
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Failed to add emotion:', error);
        return null;
      }
    },
  },

  // Chat related endpoints
  chat: {
    async getMessages(): Promise<ChatMessage[]> {
      try {
        const response = await axios.get(
          `${API_URL}/messages`,
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data;
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        return [];
      }
    },

    async sendMessage(content: string): Promise<ChatMessage | null> {
      try {
        const response = await axios.post(
          `${API_URL}/send`,
          { content },
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data;
      } catch (error) {
        console.error('Failed to send message:', error);
        return null;
      }
    },
  },

  // Recommendations related endpoints
  recommendations: {
    async getRecommendations(emotion: string, types?: Array<'movie' | 'book' | 'music' | 'activity'>): Promise<Recommendation[]> {
      try {
        const response = await axios.get(
          `${API_URL}/recommendations`,
          { 
            headers: getAuthHeaders(),
            params: {
              emotion,
              types: types?.join(',')
            },
            timeout: 10000
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    },

    async getRandom(count: number = 5): Promise<Recommendation[]> {
      try {
        const response = await axios.get(
          `${API_URL}/recommendations/random`,
          { 
            headers: getAuthHeaders(),
            params: { count },
            timeout: 10000
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Failed to fetch random recommendations:', error);
        return [];
      }
    },
  },
};