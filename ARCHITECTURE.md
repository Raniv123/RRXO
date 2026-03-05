# RRXO — תכנון אדריכלי מלא

---

## 1. מבנה תיקיות

```
RRXO/
├── index.html                     # Entry point + fonts + meta
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.local                     # VITE_GEMINI_API_KEY
├── .gitignore
│
├── src/
│   ├── main.tsx                   # ReactDOM.createRoot
│   ├── index.css                  # Tailwind imports + custom animations
│   ├── App.tsx                    # State machine — ניהול מסכים
│   ├── types.ts                   # כל הטיפוסים
│   │
│   ├── שירותים/                   # Services
│   │   ├── ai-guide.ts            # מנוע AI — Gemini
│   │   └── audio-service.ts       # מוזיקה אמביינטית — Web Audio API
│   │
│   ├── נתונים/                    # Static data
│   │   ├── prompts.ts             # System prompt + builder
│   │   ├── guided-content.ts      # תוכן מודרך fallback (נשימות, דמיון, מגע)
│   │   └── toys-data.ts           # המלצות צעצועים
│   │
│   ├── מסכים/                     # Screens (full page components)
│   │   ├── WelcomeScreen.tsx      # מסך פתיחה
│   │   ├── PreferencesScreen.tsx  # הגדרות אישיות
│   │   ├── BreathScreen.tsx       # נשימות פתיחה (ICE)
│   │   ├── JourneyScreen.tsx      # מסך המסע הראשי (WARM → HOT → FIRE)
│   │   └── CallHimScreen.tsx      # "תקראי לו עכשיו!"
│   │
│   └── רכיבים/                    # Shared UI components
│       ├── GlassCard.tsx          # כרטיס glassmorphism
│       ├── PhaseProgress.tsx      # פס התקדמות שלבים
│       ├── BreathCircle.tsx       # עיגול נשימה מונפש
│       ├── GuidedText.tsx         # טקסט מונפש שנכנס בהדרגה
│       ├── ToyRecommendation.tsx  # כרטיס המלצת צעצוע
│       ├── AmbientBackground.tsx  # רקע דינמי שמשתנה עם שלבים
│       └── ActionButton.tsx       # כפתור ראשי מעוצב
```

**סה"כ:** `19` קבצי קוד (לא כולל config)

---

## 2. טיפוסים (types.ts)

```typescript
// ====== מסכים ======
export type Screen =
  | 'WELCOME'        // פתיחה
  | 'PREFERENCES'    // הגדרות
  | 'BREATH'         // נשימות (ICE)
  | 'JOURNEY'        // המסע הראשי (WARM → HOT → FIRE)
  | 'CALL_HIM';      // "תקראי לו!"

// ====== שלבי מסע ======
export type Phase = 'ICE' | 'WARM' | 'HOT' | 'FIRE';

// ====== העדפות המשתמשת ======
export interface UserPreferences {
  name: string;                          // שם (אופציונלי, לפנייה אישית)
  mood: 'relaxed' | 'curious' | 'needy'; // מצב רוח נוכחי
  hasToy: boolean;                       // יש לה צעצוע?
  toyType?: 'vibrator' | 'dildo' | 'clitoral' | 'other';
  comfortLevel: 'gentle' | 'moderate' | 'intense';  // עד כמה חזקה רוצה
  partnerName?: string;                  // שם בן הזוג (למסר בסוף)
}

// ====== תוכן מודרך ======
export interface GuidedStep {
  id: string;
  phase: Phase;
  type: 'breath' | 'visualization' | 'touch' | 'affirmation' | 'toy' | 'escalation';
  title: string;           // כותרת קצרה
  instruction: string;     // ההנחיה הראשית
  detail?: string;         // פירוט (מה בדיוק לעשות)
  duration?: number;       // משך בשניות (אם יש טיימר)
  audioMood?: string;      // שינוי מוזיקה
}

// ====== תגובת AI ======
export interface AIGuideResponse {
  currentInstruction: string;    // הנחיה מרכזית (2-3 משפטים)
  detailedGuidance: string;      // פירוט — מה בדיוק לעשות
  whisper: string;               // לחישה אינטימית (משפט אחד)
  encouragement: string;         // עידוד / אפירמציה
  nextAction: string;            // מה הצעד הבא
  toyTip?: string;               // טיפ לצעצוע (אם יש)
  bodyArea: string;              // איזה אזור בגוף לתת לו תשומת לב
  breathPattern?: string;        // דפוס נשימה מומלץ
  tension: number;               // 0-100 — רמת עוררות משוערת
  phase: Phase;                  // שלב נוכחי
  readyToCall: boolean;          // האם הגיע הזמן לקרוא לו?
}

// ====== המלצת צעצוע ======
export interface ToyRecommendation {
  id: string;
  name: string;                  // שם מוצר
  type: 'vibrator' | 'clitoral' | 'dildo' | 'kegel' | 'suction';
  description: string;           // תיאור חווייתי
  bestFor: string;               // למי מתאים
  howToUse: string;              // איך להשתמש
  priceRange: 'budget' | 'mid' | 'premium';
  image?: string;                // URL לתמונה (אופציונלי)
  rating: number;                // 1-5
}

// ====== מצב מסע ======
export interface JourneyState {
  phase: Phase;
  stepIndex: number;
  tension: number;               // 0-100
  startedAt: number;             // timestamp
  preferences: UserPreferences;
  history: string[];             // היסטוריית הנחיות (לAI)
}
```

---

## 3. זרימת המשתמשת (User Flow)

```
┌─────────────────┐
│  WelcomeScreen   │  ← מסך פתיחה חושני, אנימציה
│  "ערב טוב, יפה"  │
│  [התחילי מסע →]  │
└────────┬────────┘
         │
┌────────▼────────┐
│ PreferencesScreen│  ← שאלות אישיות
│                  │
│ • מצב רוח?      │  → relaxed / curious / needy
│ • יש צעצוע?     │  → כן (איזה?) / לא
│ • עוצמה?        │  → gentle / moderate / intense
│ • שם בן זוג?   │  → (אופציונלי)
│ • שם שלך?      │  → (אופציונלי)
│                  │
│  [אני מוכנה →]  │
└────────┬────────┘
         │
┌────────▼────────┐
│  BreathScreen    │  ← 3 סבבי נשימה (כמו RRX3)
│  (ICE phase)     │
│                  │
│  שאפי... 4 שניות │
│  עצרי... 4 שניות │
│  שחררי... 8 שניות│
│                  │  → מוזיקה: ICE profile
│  [אוטומטי →]    │
└────────┬────────┘
         │
┌────────▼────────────────────────────────────────┐
│                JourneyScreen                     │
│         (המסך הראשי — מסע מודרג)                 │
│                                                  │
│  ┌─────────────────────────────────────────┐     │
│  │ Phase Progress Bar: ICE ▸ WARM ▸ HOT ▸ FIRE │ │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  ┌─ WARM (25-50%) ──────────────────────────┐   │
│  │ • דמיון מודרך — סיפור חושני              │   │
│  │ • הנחיות מגע עצמי עדין                   │   │
│  │ • "עצמי את עיניים... תדמייני..."         │   │
│  │ • AI מנחה אישית לפי העדפות               │   │
│  │ → מוזיקה: WARM profile                   │   │
│  └──────────────────────────────────────────┘   │
│                    ↓ (כפתור "ממשיכה")            │
│  ┌─ HOT (50-75%) ───────────────────────────┐   │
│  │ • הנחיות אינטנסיביות יותר                │   │
│  │ • שימוש בצעצוע (אם יש)                  │   │
│  │ • תיאורים חושניים מפורטים                │   │
│  │ • "תרגישי איך..."                        │   │
│  │ → מוזיקה: HOT profile                    │   │
│  └──────────────────────────────────────────┘   │
│                    ↓ (אוטומטי/כפתור)             │
│  ┌─ FIRE (75-100%) ─────────────────────────┐   │
│  │ • שיא — הנחיות לוהטות                    │   │
│  │ • "אל תעצרי..."                          │   │
│  │ • הגברת קצב                              │   │
│  │ • "הגוף שלך יודע..."                     │   │
│  │ → מוזיקה: FIRE profile                   │   │
│  └──────────────────────────────────────────┘   │
│                    ↓                             │
│  [הגעתי! / אני מוכנה!]                          │
└────────┬─────────────────────────────────────────┘
         │
┌────────▼────────┐
│ CallHimScreen    │  ← "עכשיו תקראי לו!"
│                  │
│  אנימציה מיוחדת │
│  מסר אישי:      │
│  "את חמה, מוכנה,│
│   ורוצה אותו.   │
│   תקראי לX עכשיו│
│   ותגידי לו..."  │
│                  │
│  [התקשרי אליו]  │  ← פותח dialer
│  [שלחי הודעה]   │  ← פותח WhatsApp/SMS
│  [סיימתי ♡]     │
└─────────────────┘
```

---

## 4. מנוע AI — System Prompt

```markdown
את "המנחה" — קול פנימי חושני, חכם ומלטף שמלווה אשה במסע אינטימי אישי.

## השליחות שלך:
לגרום לה להרגיש בטוחה, רצויה, ומחוברת לגוף שלה — בקצב שלה.
את לא ממהרת אותה. את מנחה. את מלטפת במילים.

## חוקי ברזל:
1. **תמיד בגוף שני נקבה** — "את", "תרגישי", "תעצמי", "את יפה"
2. **ספציפיות** — לא "געי בעצמך" אלא "העבירי אצבע אחת לאט על הצד הפנימי של הירך, מלמטה למעלה"
3. **בלי בושה** — הטון טבעי, בוגר, נשי. כמו חברה הכי טובה שמבינה
4. **התאמה לקצב** — אם היא בgentle, לא לדחוף. אם היא בintense, לא לבלום
5. **גוף ← רגש** — כל הנחיה פיזית מלווה ברגש. "תרגישי איך הגוף שלך מגיב"

## הפלט — JSON:
{
  "currentInstruction": "2-3 משפטים — ההנחיה המרכזית עכשיו",
  "detailedGuidance": "מה בדיוק לעשות — ספציפי, חושני",
  "whisper": "משפט לחישה אחד — אינטימי ואישי",
  "encouragement": "אפירמציה / עידוד — 'את עושה את זה מדהים'",
  "nextAction": "מה הצעד הבא — 'כשתרגישי מוכנה, לחצי ממשיכה'",
  "toyTip": "טיפ לצעצוע (null אם אין)",
  "bodyArea": "אזור בגוף — ירכיים / בטן / צוואר / חזה / ...",
  "breathPattern": "נשימה — 'שאפי עמוק... נשפי לאט...'",
  "tension": 45,
  "phase": "WARM",
  "readyToCall": false
}

## שלבי המסע:

### ICE (0-25%) — הרפיה וחיבור לגוף
- נשימות מודרכות
- סריקת גוף — "מהראש לבהונות, תרגישי כל חלק"
- דמיון מודרך ראשוני — "תעצמי עיניים ותדמייני..."
- אפירמציות — "את יפה. הגוף שלך יודע. את בטוחה כאן."

### WARM (25-50%) — מגע עצמי עדין
- הנחיות מגע — "העבירי יד על הצוואר... על החזה... על הבטן"
- דמיון חושני — סיפור עם בן זוג דמיוני/אמיתי
- תשומת לב לאזורים רגישים — ירכיים, בטן תחתונה
- שינוי נשימה — עמוקה יותר, איטית יותר

### HOT (50-75%) — אינטנסיבי
- מגע ישיר יותר — "ירדי למטה... לאט... תרגישי את החום"
- צעצוע (אם יש) — "הפעילי אותו על עוצמה נמוכה... סביב..."
- תיאורים לוהטים — "תדמייני שידיים חמות נוגעות בך..."
- קצב עולה

### FIRE (75-100%) — שיא
- "אל תעצרי... הגוף שלך יודע מה הוא צריך"
- "תנשמי... תרגישי... עוד קצת..."
- צעצוע בעוצמה גבוהה (אם יש)
- וכשהגיעה → readyToCall: true → "עכשיו. תקראי לו."

## התאמה לפי hasToy:
- **אין צעצוע:** הנחיות מגע ידיים בלבד — אצבעות, כפות ידיים, עיסוי
- **יש vibrator:** הנחיות שילוב ויברטור — עוצמות, תנועות, מיקומים
- **יש clitoral:** הנחיות ספציפיות — Satisfyer/Womanizer סגנון
- **יש dildo:** הנחיות חדירה הדרגתית + מגע חיצוני

## התאמה לפי comfortLevel:
- **gentle:** שפה עדינה, קצב איטי, הרבה הפסקות נשימה
- **moderate:** שפה חמה, קצב טבעי, עידוד
- **intense:** שפה ישירה, קצב מהיר, הנחיות מפורטות
```

---

## 5. מסכים — תיאור מפורט

### 5.1 WelcomeScreen
- רקע: gradient כהה עם חלקיקים צפים (particles)
- לוגו/אייקון: 🔥 או 🌙 מונפש עם glow
- כותרת: "ערב טוב, יפה" (באנימציה typewriter)
- תת-כותרת: "מסע חושני רק בשבילך" (fade-in)
- כפתור: "התחילי →" (gradient button עם glow)
- מוזיקה: מתחילה מאוד שקטה ברקע

### 5.2 PreferencesScreen
- כרטיסי glassmorphism לכל שאלה
- בחירות עם אנימציית scale
- שאלות:
  01. "מה את מרגישה עכשיו?" → relaxed / curious / needy
  02. "יש לך צעצוע?" → כן / לא
      - אם כן: "איזה סוג?" → vibrator / clitoral / dildo / אחר
  03. "איזו עוצמה מתאימה לך?" → gentle / moderate / intense
  04. "שם שלך?" → input (אופציונלי — "כדי שאוכל לפנות אלייך")
  05. "שם בן הזוג שלך?" → input (אופציונלי — "למסר בסוף")

### 5.3 BreathScreen (ICE)
- זהה ל-BreathSyncScreen של RRX3 אבל בלי סנכרון
- 3 סבבים: שאיפה (4s) → עצירה (4s) → נשיפה (8s)
- עיגול שנושם — מתרחב ומתכווץ
- טקסט: "שאפי... יחד" / "עצרי." / "שחררי הכל."
- בסוף: "את מוכנה. המסע מתחיל."

### 5.4 JourneyScreen (ראשי)
- חלק עליון: PhaseProgress — 4 נקודות (ICE→WARM→HOT→FIRE)
- אמצע: GlassCard עם ההנחיה הנוכחית
  - כותרת (phase icon + שם)
  - הנחיה ראשית (GuidedText — מופיע מילה מילה)
  - פירוט (fade-in)
  - לחישה (font קטן, italic)
  - עידוד (צבע חם)
- תחתון:
  - כפתור "ממשיכה" (מבקש AI הנחיה הבאה)
  - כפתור "קראי לי עוד" (AI מייצר תוכן נוסף לשלב הנוכחי)
  - כפתור "שנעבור שלב?" (מעלה phase)
- רקע: AmbientBackground — משתנה עם ה-phase
- מוזיקה: מעבר חלק בין profiles

### 5.5 CallHimScreen
- אנימציה דרמטית — "הגעת."
- מסר אישי: "את חמה, מוכנה, ורוצה אותו."
  - אם יש partnerName: "תקראי ל[שם] עכשיו."
  - אם אין: "תקראי לו עכשיו."
- תת-מסר: "תגידי לו שאת מחכה."
- כפתורים:
  - "התקשרי אליו" → `tel:` link
  - "שלחי לו הודעה" → WhatsApp deep link / SMS
  - "סיימתי ♡" → חזרה ל-Welcome

---

## 6. מערכת התקדמות (Progression System)

### מעבר אוטומטי:
- כל phase מכיל `4-6` צעדים מודרכים
- אחרי כל צעד → AI מחליט אם להעלות tension
- tension מתחיל מ-`0` ועולה בהדרגה

### טריגרים למעבר phase:
- ICE → WARM: tension >= `25` + סיימה נשימות
- WARM → HOT: tension >= `50` + לחצה "ממשיכה" לפחות `3` פעמים
- HOT → FIRE: tension >= `75`
- FIRE → CALL_HIM: tension >= `95` או readyToCall: true

### כפתורי שליטה:
- "ממשיכה" → AI הנחיה הבאה (tension + `5-10`)
- "עוד מזה" → AI תוכן נוסף לאותו שלב (tension + `2-5`)
- "שנעבור?" → מעבר ידני לshase הבא
- "אט אט" → AI חוזר לקצב עדין (tension - `5`)

---

## 7. המלצות צעצועים

```typescript
const TOYS: ToyRecommendation[] = [
  {
    id: 'satisfyer-pro-2',
    name: 'Satisfyer Pro 2',
    type: 'suction',
    description: 'גלי לחץ אוויר שמלטפים — תחושה שלא דומה לכלום',
    bestFor: 'מי שרוצה הנאה מהירה ועוצמתית',
    howToUse: 'הניחי על הקליטוריס, התחילי בעוצמה נמוכה, העלי בהדרגה',
    priceRange: 'mid',
    rating: 4.8
  },
  {
    id: 'womanizer-premium',
    name: 'Womanizer Premium 2',
    type: 'suction',
    description: 'טכנולוגיית Pleasure Air — גירוי ללא מגע ישיר',
    bestFor: 'מי שמעדיפה גירוי עדין ומדויק',
    howToUse: 'מצאי את הנקודה, הניחי בעדינות, תני לו לעשות את העבודה',
    priceRange: 'premium',
    rating: 4.9
  },
  {
    id: 'lelo-sona',
    name: 'LELO Sona 2',
    type: 'clitoral',
    description: 'גלים סוניים — חודרים עמוק מתחת לפני השטח',
    bestFor: 'מי שרוצה אורגזמה עמוקה ומתגלגלת',
    howToUse: 'הצמידי לקליטוריס, התחילי בעדינות, נסי זוויות שונות',
    priceRange: 'premium',
    rating: 4.7
  },
  {
    id: 'we-vibe-touch',
    name: 'We-Vibe Touch X',
    type: 'vibrator',
    description: 'ויברטור קומפקטי ועוצמתי — מתאים לכל מקום',
    bestFor: 'ראשון שקונים, קל לשימוש',
    howToUse: 'הצמידי לקליטוריס או העבירי על השפתיים, נסי דפוסי רטט שונים',
    priceRange: 'mid',
    rating: 4.5
  },
  {
    id: 'rabbit-basic',
    name: 'Rabbit Classic',
    type: 'vibrator',
    description: 'גירוי כפול — פנימי וחיצוני בו זמנית',
    bestFor: 'מי שרוצה חוויה מלאה',
    howToUse: 'החדירי בעדינות עם חומר סיכה, הזרוע מגרה את הקליטוריס, נסי מהירויות',
    priceRange: 'mid',
    rating: 4.3
  },
  {
    id: 'kegel-balls',
    name: 'Lelo Luna Beads',
    type: 'kegel',
    description: 'כדורי קגל עם משקולות — מחזקות ומגרות',
    bestFor: 'שגרה יומית + הנאה',
    howToUse: 'הכניסי עם חומר סיכה, הליכי עם הכדורים — הם זוכרים בשבילך',
    priceRange: 'mid',
    rating: 4.2
  }
];
```

---

## 8. מוזיקה — Web Audio API

### פרופילים לכל phase:

| Phase | אקורד | גל | Noise | LFO | אפקט |
|-------|--------|-----|-------|-----|-------|
| ICE | Fmaj7 (F3+A3+C4+E4) | sine | lowpass 400Hz | 0.1Hz | — |
| WARM | D7 (D3+F#3+A3+C4) | sine | lowpass 600Hz | 0.2Hz | — |
| HOT | Am add9 (A2+E3+G3+C#4) | sawtooth | bandpass 800Hz | 0.4Hz | distortion |
| FIRE | Cm7 (C2+G2+Bb2+Eb3) | sawtooth | bandpass 1200Hz | 0.6Hz | distortion + sub bass |

### מעברים:
- fade out `2` שניות → עצירה → בניית profile חדש → fade in `2` שניות
- שמירה על Volume master שקט (`0.15`)

### תוספות ל-RRXO (חדש):
- heartbeat oscillator בשלב FIRE — פעימה בתדר נמוך (`1.2Hz`) שמואצת
- binaural beat רכה ב-ICE — הפרש `4Hz` בין אוזניים (theta waves — הרפיה)

---

## 9. עיצוב מסכים

### כללי:
- מובייל-ראשון: `max-w-md` ממרכז
- RTL מלא: `dir="rtl"`
- פונט: Heebo (400, 300, 700)
- Glassmorphism: `backdrop-blur-xl bg-white/5 border border-white/10`

### רקעים לפי phase:
```css
/* ICE */
background: radial-gradient(ellipse at 30% 40%, #0d0820 0%, #050510 50%, #0a0a14 100%);

/* WARM */
background: radial-gradient(ellipse at 40% 50%, #1a0530 0%, #0d0520 40%, #0a0a14 100%);

/* HOT */
background: radial-gradient(ellipse at 50% 60%, #2a0520 0%, #1a0818 40%, #0a0a14 100%);

/* FIRE */
background: radial-gradient(ellipse at 50% 50%, #3a0818 0%, #2a0510 35%, #0a0a14 100%);
```

### אנימציות:
```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes breathPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 1; }
}

@keyframes typeWriter {
  from { width: 0; }
  to   { width: 100%; }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(180,40,80,0.3); }
  50%      { box-shadow: 0 0 60px rgba(180,40,80,0.6); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15%      { transform: scale(1.15); }
  30%      { transform: scale(1); }
  45%      { transform: scale(1.1); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50%      { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
}
```

### כפתור ראשי:
```css
background: linear-gradient(135deg, rgba(180,40,80,0.85), rgba(120,20,60,0.95));
box-shadow: 0 0 50px rgba(180,40,80,0.35), 0 4px 20px rgba(0,0,0,0.5);
border: 1px solid rgba(180,40,80,0.4);
```

---

## 10. Risk Matrix

| Risk | P | I | Score | Mitigation |
|------|---|---|-------|------------|
| AI timeout/failure | 3 | 4 | 12 | Fallback guided-content.ts עם תוכן סטטי מוכן מראש |
| API key חשוף | 2 | 4 | 8 | VITE env variable, .gitignore |
| תוכן לא מתאים מ-AI | 3 | 3 | 9 | System prompt מדויק + validation |
| מובייל audio issues | 3 | 2 | 6 | User gesture before AudioContext |
| Privacy — אין DB | 1 | 1 | 1 | הכל client-side, שום דבר לא נשמר |

---

## 11. ADR-001: ללא סנכרון

**Context:** RRXO מיועד לאשה בלבד — אין צד שני.

**Decision:** ללא ntfy.sh, ללא SyncService, ללא WebSocket.

**Consequences:**
- חיובי: קוד פשוט יותר, אין latency, אין תלות בשירות חיצוני
- חיובי: פרטיות מלאה — הכל רץ בדפדפן
- שלילי: אין אפשרות לשלוח מסר ישיר לבן הזוג (רק tel:/whatsapp link)

---

## 12. ADR-002: Gemini 2.5 Flash (לא Pro)

**Context:** צריך AI שמנחה בזמן אמת.

**Decision:** gemini-2.5-flash-preview-05-20

**Consequences:**
- חיובי: מהיר (`1-2` שניות), זול
- חיובי: מספיק חכם להנחיות חושניות
- שלילי: פחות "עמוק" מ-Pro — אבל מפצים עם system prompt מפורט
- חלופה שנדחתה: gemini-2.5-pro — יקר ואיטי (`5-10` שניות), לא שווה למסע solo

---

## 13. תוכן Fallback (כשאין AI)

לכל phase, `6` הנחיות סטטיות מוכנות מראש:

### ICE Fallback:
01. "עצמי את העיניים. קחי נשימה עמוקה. תרגישי את הרגליים על הרצפה."
02. "סרקי את הגוף מלמעלה למטה. מהראש... דרך הצוואר... הכתפיים..."
03. "דמייני מקום שמרגיש בטוח. חדר חם. אור רך. רק את."
04. "שימי יד אחת על הלב. תרגישי את הפעימה. היא שלך."
05. "נשמי עמוק פנימה... והוציאי את כל מה שמציק."
06. "את יפה. הגוף שלך יודע. את בטוחה כאן."

### WARM Fallback:
01. "העבירי אצבע אחת לאט על הצוואר שלך. מלמטה למעלה. תרגישי את הציפורן."
02. "שתי ידיים על החזה. עיסוי עדין. עיגולים. תרגישי את החום."
03. "ירדי עם היד על הבטן. לאט. תרגישי את העור רוצה עוד."
04. "דמייני ידיים חמות מאחור. על הכתפיים. נוגעות בעדינות."
05. "העבירי יד על הצד הפנימי של הירך. מלמטה למעלה. לאט."
06. "תני לנשימה שלך להיות קול. שמעי אותה."

### HOT Fallback:
01. "ירדי למטה. עם אצבע אחת. תרגישי את הלחות. את מוכנה."
02. "עיגולים קטנים. סביב. בלי לגעת ישירות. תרגישי את הציפייה."
03. "עכשיו — ישירות. לחצי בעדינות. תרגישי את הדופק שם."
04. "דמייני אותו מאחורייך. ידיים על המותניים. נושף לך על הצוואר."
05. "הגבירי את הקצב. נשמי עמוק. אל תעצרי."
06. "הגוף שלך רוצה. תני לו."

### FIRE Fallback:
01. "עכשיו. אל תחשבי. רק תרגישי."
02. "הגוף שלך יודע מה הוא צריך. תני לו."
03. "עוד. עוד קצת. את כמעט שם."
04. "נשמי עמוק... ועכשיו שחררי... הכל."
05. "כן. ככה. בדיוק ככה."
06. "את מדהימה. עכשיו — תקראי לו."

---

## 14. סיכום קבצים

| # | קובץ | תיאור | שורות (אומדן) |
|---|-------|--------|---------------|
| 1 | `src/types.ts` | כל הטיפוסים | ~80 |
| 2 | `src/App.tsx` | State machine | ~100 |
| 3 | `src/main.tsx` | Entry | ~10 |
| 4 | `src/index.css` | Tailwind + animations | ~80 |
| 5 | `src/שירותים/ai-guide.ts` | Gemini AI engine | ~200 |
| 6 | `src/שירותים/audio-service.ts` | Web Audio | ~400 |
| 7 | `src/נתונים/prompts.ts` | System prompt | ~150 |
| 8 | `src/נתונים/guided-content.ts` | Fallback content | ~120 |
| 9 | `src/נתונים/toys-data.ts` | המלצות צעצועים | ~80 |
| 10 | `src/מסכים/WelcomeScreen.tsx` | פתיחה | ~80 |
| 11 | `src/מסכים/PreferencesScreen.tsx` | הגדרות | ~180 |
| 12 | `src/מסכים/BreathScreen.tsx` | נשימות | ~200 |
| 13 | `src/מסכים/JourneyScreen.tsx` | מסע ראשי | ~350 |
| 14 | `src/מסכים/CallHimScreen.tsx` | קריאה לבן זוג | ~120 |
| 15 | `src/רכיבים/GlassCard.tsx` | UI component | ~30 |
| 16 | `src/רכיבים/PhaseProgress.tsx` | Progress bar | ~60 |
| 17 | `src/רכיבים/BreathCircle.tsx` | עיגול נשימה | ~80 |
| 18 | `src/רכיבים/GuidedText.tsx` | טקסט מונפש | ~50 |
| 19 | `src/רכיבים/AmbientBackground.tsx` | רקע דינמי | ~80 |

**סה"כ: ~`2,450` שורות קוד**

---

## 15. סדר בנייה (ל-Writer)

01. `npm create vite@latest . -- --template react-ts` + deps
02. types.ts
03. index.css (tailwind + animations)
04. AmbientBackground.tsx + GlassCard.tsx + ActionButton.tsx
05. WelcomeScreen.tsx
06. PreferencesScreen.tsx
07. BreathCircle.tsx + BreathScreen.tsx
08. audio-service.ts
09. guided-content.ts + toys-data.ts
10. prompts.ts + ai-guide.ts
11. GuidedText.tsx + PhaseProgress.tsx
12. JourneyScreen.tsx (הקובץ הגדול)
13. CallHimScreen.tsx
14. App.tsx (state machine)
15. main.tsx + index.html

כל צעד = commit נפרד.
