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
      try {
        const response = await axios.post(
          `${API_URL}/analyze`,
          { text },
          { 
            headers: getAuthHeaders(),
            timeout: 30000 // Increased timeout for AI processing
          }
        );
        return response.data;
      } catch (error: any) {
        console.error('Failed to analyze emotion:', error);
        if (error.response?.status === 404) {
          throw new Error('Emotion analysis service unavailable');
        }
        throw error;
      }
    },

    async getHistory(): Promise<EmotionData[]> {
      try {
        const response = await axios.get(
          `${API_URL}/history`,
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data.data || response.data; // Handle both response formats
      } catch (error) {
        console.error('Failed to fetch emotion history:', error);
        return [];
      }
    },

    async addEmotion(data: Omit<EmotionData, 'id' | 'userId' | 'timestamp'>): Promise<EmotionData | null> {
      try {
        const response = await axios.post(
          `${API_URL}/AddEmotion`,
          data,
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data.data || response.data; // Handle both response formats
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
    async getRecommendations(emotion: string): Promise<Recommendation[]> {
      try {
        const response = await axios.get(
          `${API_URL}/getRecommendations?emotion=${emotion}`,
          { 
            headers: getAuthHeaders(),
            timeout: 10000
          }
        );
        return response.data;
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    },
  },
};