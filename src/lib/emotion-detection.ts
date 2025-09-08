import { pipeline } from '@huggingface/transformers'

let emotionClassifier: any = null

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

export async function initializeEmotionDetection() {
  if (!emotionClassifier) {
    try {
      emotionClassifier = await pipeline(
        'text-classification',
        'j-hartmann/emotion-english-distilroberta-base',
        { device: 'webgpu' }
      )
    } catch (error) {
      console.log('WebGPU not available, falling back to CPU')
      emotionClassifier = await pipeline(
        'text-classification', 
        'j-hartmann/emotion-english-distilroberta-base'
      )
    }
  }
  return emotionClassifier
}

export async function detectEmotion(text: string): Promise<EmotionResult> {
  const classifier = await initializeEmotionDetection()
  const results = await classifier(text)
  
  const topResult = results[0]
  const emotion = topResult.label.toLowerCase() as EmotionType
  
  return {
    emotion,
    confidence: topResult.score,
    allScores: results.map((result: any) => ({
      label: result.label.toLowerCase(),
      score: result.score
    }))
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