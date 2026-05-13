import { AIGuideResponse, Phase, UserPreferences } from '../types';
import { buildSystemPrompt, buildUserMessage } from '../נתונים/prompts';
import { getFallbackStep } from '../נתונים/guided-content';

// FAL acts as a proxy to OpenAI — keeps the OpenAI key out of the client bundle.
// Using any-llm which routes to GPT-5 / GPT-4o through FAL's infra.
const FAL_ENDPOINT = 'https://fal.run/fal-ai/any-llm';
const MODEL = 'anthropic/claude-haiku-4.5';

function getFalKey(): string | null {
  const key = import.meta.env.VITE_FAL_KEY;
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
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
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
  const key = getFalKey();
  if (!key) {
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }

  try {
    const systemPrompt = buildSystemPrompt(preferences);
    const userMessage = buildUserMessage(phase, tension, stepIndex, history);

    const response = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        system_prompt: systemPrompt,
        prompt: userMessage,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('FAL API error:', response.status, errText);
      return fallbackResponse(phase, tension, stepIndex, preferences);
    }

    const data = await response.json();
    const content = data?.output ?? data?.text ?? data?.response ?? '';
    if (!content) {
      console.error('FAL returned no content:', data);
      return fallbackResponse(phase, tension, stepIndex, preferences);
    }

    const jsonCandidate = extractJson(content);
    // Sanity check — the response must start with { (a JSON object)
    if (!jsonCandidate.trim().startsWith('{')) {
      console.warn('AI returned non-JSON (likely refusal):', content.slice(0, 200));
      return fallbackResponse(phase, tension, stepIndex, preferences);
    }

    const parsed = JSON.parse(jsonCandidate) as AIGuideResponse;

    // 🔒 Monotonic guarantee — tension can never go backwards or stagnate.
    // Even if the model returns weird values, we force a steady advance.
    const aiTension = typeof parsed.tension === 'number' ? parsed.tension : tension + 6;
    const minNext = tension + 4;
    const maxJump = tension + 12;
    parsed.tension = Math.max(0, Math.min(100, Math.max(minNext, Math.min(aiTension, maxJump))));

    // 🔒 Always derive phase from tension (consistency: tension and phase MUST agree).
    parsed.phase = getPhaseFromTension(parsed.tension);

    if (parsed.tension >= 95) parsed.readyToCall = true;

    return parsed;
  } catch (err) {
    console.error('AI Guide error (FAL):', err);
    return fallbackResponse(phase, tension, stepIndex, preferences);
  }
}
