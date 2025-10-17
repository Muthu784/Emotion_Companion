import { api } from './api'

export interface EmotionAPIResponse {
  emotion: EmotionType
  confidence: number
  scores: Array<{ label: string; score: number }>
}

export const emotionLabels = {
  joy: 'joy',
  sadness: 'sadness', 
  anger: 'anger',
  fear: 'fear',
  love: 'love',
  surprise: 'surprise'
} as const

export type EmotionType = keyof typeof emotionLabels

export interface EmotionResult {
  emotion: EmotionType
  confidence: number
  allScores: Array<{ label: string; score: number }>
}

export async function detectEmotion(text: string): Promise<EmotionResult> {
  try {
    // Input Validation
    if (!text || text.trim().length === 0) {
      throw new Error('Please enter some text to analyze.');
    }

    if (text.length > 3000) {
      throw new Error('Text is too long. Please limit to 3000 characters.');
    }

    const response = await api.emotions.analyze(text);

    // Validate Response - FIXED: removed incorrect validation
    if (!response.emotion || !response.confidence) {
      throw new Error('Invalid response from emotion analysis service.');
    }

    return {
      emotion: response.emotion as EmotionType,
      confidence: response.confidence,
      allScores: response.scores || []
    };
  } catch (error: any) {
    console.error('Error detecting emotion:', error);

    if (error.message.includes('service unavailable') || error.message.includes('Network Error')) {
      throw new Error('Emotion analysis service is currently unavailable. Please try again later.');
    }

    throw new Error(error.message || 'Failed to analyze emotion. Please try again.');
  }
}

export function getEmotionColor(emotion: EmotionType): string {
  const colorMap: Record<EmotionType, string> = {
    joy: 'emotion-joy',
    love: 'emotion-love', 
    surprise: 'emotion-excited',
    anger: 'emotion-angry',
    fear: 'emotion-fear',
    sadness: 'emotion-sad'
  }
  
  return colorMap[emotion] || 'emotion-neutral'
}

export function getEmotionRecommendations(emotion: EmotionType) {
  const recommendations = {
    joy: {
      songs: ['Happy - Pharrell Williams', 'Good as Hell - Lizzo', 'Uptown Funk - Mark Ronson'],
      books: ['The Alchemist - Paulo Coelho', 'Big Magic - Elizabeth Gilbert'],  
      movies: ['The Pursuit of Happyness', 'Inside Out', 'Paddington']
    },
    love: {
      songs: ['Perfect - Ed Sheeran', 'All of Me - John Legend', 'Thinking Out Loud - Ed Sheeran'],
      books: ['Pride and Prejudice - Jane Austen', 'The Notebook - Nicholas Sparks'],
      movies: ['The Notebook', 'Titanic', 'When Harry Met Sally']
    },
    sadness: {
      songs: ['Fix You - Coldplay', 'The Sound of Silence - Simon & Garfunkel', 'Mad World - Gary Jules'],
      books: ['The Midnight Library - Matt Haig', 'It\'s OK That You\'re Not OK - Megan Devine'],
      movies: ['Inside Out', 'Good Will Hunting', 'The Shawshank Redemption']
    },
    anger: {
      songs: ['Break Stuff - Limp Bizkit', 'Bodies - Drowning Pool', 'Killing in the Name - RATM'],
      books: ['The Art of Not Being Governed - James C. Scott', 'Anger - Thich Nhat Hanh'],
      movies: ['Fight Club', 'The Matrix', 'V for Vendetta']
    },
    fear: {
      songs: ['Brave - Sara Bareilles', 'Stronger - Kelly Clarkson', 'Fight Song - Rachel Platten'],
      books: ['Feel the Fear and Do It Anyway - Susan Jeffers', 'The Gift of Fear - Gavin de Becker'],
      movies: ['Finding Nemo', 'The Lion King', 'Brave']
    },
    surprise: {
      songs: ['Uptown Funk - Mark Ronson', 'Can\'t Stop the Feeling - Justin Timberlake'],
      books: ['The Magic of Thinking Big - David J. Schwartz', 'Big Magic - Elizabeth Gilbert'],
      movies: ['The Greatest Showman', 'Inception', 'Interstellar']
    }
  }
  
  return recommendations[emotion] || recommendations.joy
}