export class EmotionAnalysisError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'EmotionAnalysisError';
  }
}

export const ErrorCodes = {
  MODEL_LOADING: 'MODEL_LOADING',
  MODEL_NOT_INITIALIZED: 'MODEL_NOT_INITIALIZED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
} as const;