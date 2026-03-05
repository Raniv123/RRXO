# הקשר הפרויקט — RRXO

## מה הפרויקט עושה
אפליקציית ווב לאשה בלבד — מסע חושני אישי מודרך שמחמם אותה בהדרגה עד שהיא מוכנה לקרוא לבן הזוג.
בסגנון RRX3 אבל ללא סנכרון — רק היא לבד עם מנחה AI.

## טכנולוגיות ותלויות
- **שפה:** TypeScript
- **Framework:** React 19 + Vite 6
- **עיצוב:** Tailwind CSS 3.4
- **AI:** Google Gemini (gemini-2.0-flash) + Fallback סטטי
- **אודיו:** Web Audio API (מוזיקה אמביינטית)
- **כיוון:** RTL מלא, עברית, פונט Heebo

## מבנה הפרויקט
```
src/
├── מסכים/          5 מסכים (Welcome, Preferences, Breath, Journey, CallHim)
├── רכיבים/         7 קומפוננטות (GlassCard, ActionButton, AmbientBackground, etc.)
├── שירותים/        2 שירותים (ai-guide, audio-service)
├── נתונים/         3 קבצי נתונים (prompts, guided-content, toys-data)
├── App.tsx         State machine
├── types.ts        טיפוסים
└── index.css       Tailwind + אנימציות
```

## מה בנינו עד כה
- מסך פתיחה חושני עם אנימציות ✅
- מסך העדפות (מצב רוח, צעצוע, עוצמה, שמות) ✅
- מסך נשימות (3 סבבים מונפשים) ✅
- מסך מסע ראשי עם 4 שלבים (ICE→WARM→HOT→FIRE) ✅
- מערכת התקדמות (tension 0-100) ✅
- Fallback content (24 הנחיות מוכנות מראש) ✅
- מוזיקה אמביינטית Web Audio ✅
- מסך קריאה עם טלפון/WhatsApp ✅
- עיצוב Glassmorphism חושני ✅
- תמיכה במובייל מלאה ✅

## החלטות חשובות
- **Gemini Flash ולא Pro:** מהיר וזול, מספיק טוב עם system prompt מפורט
- **Fallback סטטי:** AI לא עובד מהדפדפן (CORS) — ה-Fallback מכסה מצוין
- **ללא סנכרון:** בניגוד ל-RRX3, אין ntfy.sh — אפליקציה לבד
- **ללא DB:** הכל client-side, פרטיות מלאה

## מצב נוכחי
### עובד ✅
- כל הזרימה מתחילה ועד סוף
- כל 5 המסכים
- מעברי שלבים (ממשיכה, דילוג, אט אט)
- Fallback content איכותי
- עיצוב חושני ויפה
- מובייל responsive

### צריך שיפור 🔧
- Gemini AI לא עובד מהדפדפן (CORS) — צריך proxy או backend
- אין favicon

## עדכונים אחרונים (שיחה 2)
- תוכן HOT שוכתב — 12 צעדים, דגש דגדגן, טכניקת V, ברדס, Edging כפול
- משחק אצבעות (G-spot + דגדגן) רק בשלב מתקדם
- הוסר Web Audio API — המשתמשת שמה מוזיקה בעצמה
- נוסף כפתור צף "קראי לו" שמופיע מ-tension 30
- עיצוב קולנועי: נקודות צבע במקום אמוג'ים, מינימליסטי
- System prompt עודכן: 3 חוקי ברזל חדשים (דגדגן, הפתעות, Edging)

## צעדים הבאים
1. להוסיף proxy server ל-Gemini (אופציונלי — Fallback עובד טוב)
2. להוסיף favicon
3. לפרוס לשרת

## קבצים חשובים
- `src/מסכים/JourneyScreen.tsx` — המסך הראשי
- `src/נתונים/guided-content.ts` — תוכן Fallback
- `src/נתונים/prompts.ts` — System prompt ל-AI
- `src/שירותים/audio-service.ts` — מוזיקה
- `.env.local` — Gemini API key

## פקודות נפוצות
```bash
npm run dev     # להפעלה
npm run build   # לבנייה
npm run preview # תצוגה מקדימה
```

---
📅 עדכון אחרון: 2026-03-05 21:45
💬 שיחה אחרונה: עדכון תוכן — דגדגן, Edging, כפתור צף, עיצוב קולנועי
