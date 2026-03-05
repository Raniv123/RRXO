export type Screen = 'PASSWORD' | 'WELCOME' | 'PREFERENCES' | 'BREATH' | 'JOURNEY' | 'CALL_HIM';

export type Phase = 'ICE' | 'WARM' | 'HOT' | 'FIRE';

export interface UserPreferences {
  name: string;
  mood: 'relaxed' | 'curious' | 'needy';
  hasToy: boolean;
  toyType?: 'vibrator' | 'dildo' | 'clitoral' | 'other';
  comfortLevel: 'gentle' | 'moderate' | 'intense';
  partnerName?: string;
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
  detailedGuidance: string;
  whisper: string;
  encouragement: string;
  nextAction: string;
  toyTip?: string;
  bodyArea: string;
  breathPattern?: string;
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
