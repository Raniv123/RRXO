export type Screen = 'GIFT_BOX' | 'PASSWORD' | 'WELCOME' | 'BREATH' | 'JOURNEY' | 'CALL_HIM';

export type Phase = 'ICE' | 'WARM' | 'HOT' | 'FIRE';

export interface UserPreferences {
  hasToy: boolean;
}

export interface GuidedStep {
  id: string;
  phase: Phase;
  type: 'breath' | 'visualization' | 'touch' | 'affirmation' | 'toy' | 'escalation';
  title: string;
  instruction: string;
  detail?: string;
  duration?: number;
  audioMood?: string;
}

export interface AIGuideResponse {
  currentInstruction: string;
  task: string;
  whisper: string;
  bodyArea: string;
  tension: number;
  phase: Phase;
  readyToCall: boolean;
}

export interface ToyRecommendation {
  id: string;
  name: string;
  type: 'vibrator' | 'clitoral' | 'dildo' | 'kegel' | 'suction';
  description: string;
  bestFor: string;
  howToUse: string;
  priceRange: 'budget' | 'mid' | 'premium';
  rating: number;
}

export interface JourneyState {
  phase: Phase;
  stepIndex: number;
  tension: number;
  startedAt: number;
  preferences: UserPreferences;
  history: string[];
}
