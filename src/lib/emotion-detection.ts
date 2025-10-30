// Types for emotion-related data
export const emotionLabels = {
  joy: 'joy',
  sadness: 'sadness', 
  anger: 'anger',
  fear: 'fear',
  love: 'love',
  surprise: 'surprise',
  neutral: 'neutral'
} as const

export type EmotionType = keyof typeof emotionLabels

export interface EmotionAPIResponse {
  emotion: EmotionType
  confidence: number
  scores: Array<{ label: string; score: number }>
}

export interface EmotionResult {
  emotion: EmotionType
  confidence: number
  allScores: Array<{ label: string; score: number }>
}

// UI helper for emotion colors
export function getEmotionColor(emotion: EmotionType): string {
  const colorMap: Record<EmotionType, string> = {
    joy: 'emotion-joy',
    love: 'emotion-love', 
    surprise: 'emotion-excited',
    anger: 'emotion-angry',
    fear: 'emotion-fear',
    sadness: 'emotion-sad',
    neutral: 'emotion-neutral'
  }
  
  return colorMap[emotion] || 'emotion-neutral'
}