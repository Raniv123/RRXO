# RRXO — ממצאים ומחקר

## Context References מ-RRX3

### Patterns לעקוב אחריהם
- `RRX3/src/App.tsx` — SPA עם useState לניהול מסכים
- `RRX3/src/types.ts` — Phase type: ICE | WARM | HOT | FIRE
- `RRX3/src/services/ai-engine.ts` — GoogleGenAI SDK, structured JSON output
- `RRX3/src/services/audio-service.ts` — Web Audio API, phase configs, fade transitions
- `RRX3/src/data/prompts.ts` — system prompt + buildAIPrompt pattern
- `RRX3/src/components/BreathSyncScreen.tsx` — breath animation + glassmorphism

### מה לא צריך מ-RRX3
- SyncService (ntfy.sh) — אין סנכרון
- ConnectScreen — אין חיבור שני מכשירים
- Gender selection — תמיד אשה
- Scenarios/Roles — אין תפקידי רולפליי

### Tech Stack (זהה ל-RRX3)
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3.4
- @google/genai (Gemini 2.5 Flash)
- Web Audio API
- Heebo font

## החלטות עיצוב

### צבעים
- רקע: שחור כהה → סגול עמוק → בורדו (משתנה עם שלבים)
- ICE: כחול-סגול (#0d0820 → #1a0530)
- WARM: סגול-בורדו (#1a0530 → #2a0520)
- HOT: בורדו-אדום (#2a0520 → #3a0818)
- FIRE: אדום-זהב (#3a0818 → #4a1010)

### פונטים
- Heebo (עברית) — כמו RRX3
- Inter/System — למספרים

### Glassmorphism
- backdrop-blur-xl
- bg-white/5 borders
- rgba shadows עם צבע השלב
