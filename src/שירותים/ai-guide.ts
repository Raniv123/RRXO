import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGuideResponse, Phase, UserPreferences } from '../types';
import { buildSystemPrompt, buildUserMessage } from '../נתונים/prompts';
import { getFallbackStep } from '../נתונים/guided-content';

let genAI: GoogleGenerativeAI | null = null;

function getAI(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return null;
  genAI = new GoogleGenerativeAI(key);
  return genAI;
}

function getPhaseFromTension(t: number): Phase {
  if (t >= 75) return 'FIRE';
  if (t >= 50) return 'HOT';
  if (t >= 25) return 'WARM';
  return 'ICE';
}

function fallbackResponse(_phase: Phase, tension: number, stepIndex: number, prefs: UserPreferences): AIGuideResponse {
  // Content phase is determined by current tension — smooth progression
  const contentPhase = getPhaseFromTension(tension);
  const content = getFallbackStep(contentPhase, stepIndex, prefs.hasToy);
  const newTension = Math.min(100, tension + 4);

  return {
    currentInstruction: content.instruction,
    task: content.task,
    whisper: content.whisper,
    bodyArea: content.bodyArea,
    tension: newTension,
    phase: contentPhase,
    readyToCall: newTension >= 95
  };
}

export async function getNextGuidance(
  preferences: UserPreferences,
  phase: Phase,
  tension: number,
  stepIndex: number,
  history: string[]
): Promise<AIGuideResponse> {
  const ai = getAI();
  if (!ai) {
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    });

    const systemPrompt = buildSystemPrompt(preferences);
    const userMessage = buildUserMessage(phase, tension, stepIndex, history);

    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: 'הבנתי את התפקיד שלי. אני מוכנה להנחות.' }] },
               { role: 'model', parts: [{ text: '{"currentInstruction":"אני כאן בשבילך. נתחיל.","whisper":"","bodyArea":"","tension":0,"phase":"ICE","readyToCall":false}' }] }],
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();
    const parsed = JSON.parse(text) as AIGuideResponse;

    // Validate and clamp tension
    parsed.tension = Math.max(0, Math.min(100, parsed.tension));
    if (!parsed.phase) parsed.phase = phase;
    if (parsed.tension >= 95) parsed.readyToCall = true;

    return parsed;
  } catch (err) {
    console.error('AI Guide error:', err);
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }
}
