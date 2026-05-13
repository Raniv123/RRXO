import { AIGuideResponse, Phase, UserPreferences } from '../types';
import { buildSystemPrompt, buildUserMessage } from '../נתונים/prompts';
import { getFallbackStep } from '../נתונים/guided-content';

const OPENAI_MODEL = 'gpt-5';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function getOpenAIKey(): string | null {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return (typeof key === 'string' && key.length > 0) ? key : null;
}

function getPhaseFromTension(t: number): Phase {
  if (t >= 75) return 'FIRE';
  if (t >= 50) return 'HOT';
  if (t >= 25) return 'WARM';
  return 'ICE';
}

function fallbackResponse(_phase: Phase, tension: number, stepIndex: number, prefs: UserPreferences): AIGuideResponse {
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

/** Extract JSON from a model response, even if wrapped in markdown */
function extractJson(text: string): string {
  const trimmed = text.trim();
  // strip ```json … ``` or ``` … ``` fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // grab first { ... last }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

export async function getNextGuidance(
  preferences: UserPreferences,
  phase: Phase,
  tension: number,
  stepIndex: number,
  history: string[]
): Promise<AIGuideResponse> {
  const key = getOpenAIKey();
  if (!key) {
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }

  try {
    const systemPrompt = buildSystemPrompt(preferences);
    const userMessage = buildUserMessage(phase, tension, stepIndex, history);

    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 1.0,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', response.status, errText);
      return fallbackResponse(phase, tension, stepIndex, preferences);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error('OpenAI returned no content');
      return fallbackResponse(phase, tension, stepIndex, preferences);
    }

    const parsed = JSON.parse(extractJson(content)) as AIGuideResponse;

    // Validate and clamp tension
    parsed.tension = Math.max(0, Math.min(100, parsed.tension ?? tension + 6));
    if (!parsed.phase) parsed.phase = phase;
    if (parsed.tension >= 95) parsed.readyToCall = true;

    return parsed;
  } catch (err) {
    console.error('AI Guide error (GPT):', err);
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }
}
