# הקשר הפרויקט — RRXO

## מה הפרויקט עושה
אפליקציית ווב לאשה בלבד — מסע חושני אישי מודרך שמחמם אותה בהדרגה עד שהיא מוכנה לקרוא לבן הזוג.
פנטזיות אנונימיות + הנחיות פיזיות מבוססות מחקר. הכל client-side, פרטיות מלאה.

## טכנולוגיות
- **שפה:** TypeScript
- **Framework:** React 19 + Vite 6
- **עיצוב:** Tailwind CSS 3.4
- **AI:** Google Gemini (gemini-2.0-flash) + Fallback סטטי
- **Deploy:** GitHub Pages (`https://raniv123.github.io/RRXO/`)
- **כיוון:** RTL מלא, עברית, פונט Heebo

## זרימה
PASSWORD (1900) → WELCOME → BREATH (דלגי אפשרי) → JOURNEY (popup צעצוע באמצע WARM + סיום הדרגתי) → CALL_HIM

## מה בנינו
- כל הזרימה עובדת מקצה לקצה ✅
- 5 פנטזיות מוכנות (hotel-stranger, neighbor, art-studio, rain-alley + עוד) ✅
- הנחיות פיזיות מבוססות מחקר (OMGYes, Betty Dodson, Nagoski) ✅
- פרסונליזציה עם שם + שם בן זוג ✅
- Fade-out אנימציה חלקה בין צעדים ✅
- כפתור דלגי במסך נשימות ✅
- מובייל responsive ✅
- Deploy אוטומטי ל-GitHub Pages ✅

## עדכונים אחרונים (שיחה 5 — 2026-05-13)

### שדרוג עיצוב + UX עם 3 מוחות (Claude + Codex + Gemini 3.1 Pro)
- **Glass card משודרג**: `saturate(160%)` + inset shadow → "milled premium glass" ✅
- **חשיפת טקסט מעושנת**: `blur(8px)` במקום fade שטוח ✅
- **כפתורים עם spring physics**: `cubic-bezier(0.16, 1, 0.3, 1)` + scale active ✅
- **לחישות בעיצוב כפול**: serif + neon drop-shadow ✅
- **Film grain SVG**: שכבת רעש מעל הרקעים ✅
- **צורות אורגניות**: morph border-radius לעיגול שלב פעיל ✅
- **PhaseProgress**: פחות תחרותי, יותר זורם, ללא אחוזים ✅
- **WelcomeScreen**: `text-4xl font-extralight` במקום `text-2xl` ✅
- **PasswordScreen**: microcopy אישית ("רגע שלך בלבד") + haptic vibration ✅
- **Screen transitions**: fade+blur בין מסכים מותקנים ✅
- **ActionButton**: haptic ב-12ms בכל לחיצה ✅
- **AmbientBackground**: פחות חלקיקים (7 במקום 12), drifting glow לפי phase ✅

### Deploy
- Commit `fe1a264` ב-main ✅
- gh-pages עודכן בהצלחה ✅
- URL: https://raniv123.github.io/RRXO/

## עדכונים קודמים (שיחה 4 — 2026-03-11)

### שדרוג חוויה מלא
- הוסרו שמות (name + partnerName) — לא צריך ✅
- PreferencesScreen נמחק ✅
- זרימה חדשה: PASSWORD → WELCOME → BREATH → JOURNEY → CALL_HIM ✅
- בחירת צעצוע הועברה לאמצע WARM — popup מפתה וחושני ✅
- סיום הדרגתי: צעד אחרון מיוחד + טקסטים מתחלפים לפני מסך קריאה ✅
- כפתור "ממשיכה" הופך ל"קראי לו..." בשלב האחרון ✅

### מהשיחות הקודמות (עדיין תקף)
- 8 פנטזיות (hotel-stranger, neighbor, art-studio, private-spa, beach-sunset, dance-lesson, intimate-dinner, rain-alley) ✅
- הנחיות פיזיות מבוססות מחקר (OMGYes, Betty Dodson, Nagoski) ✅
- כפתור דלגי במסך נשימות ✅
- מובייל responsive ✅

## קבצים חשובים
- `src/נתונים/guided-content.ts` — פנטזיות + הנחיות פיזיות (הקובץ המרכזי!)
- `src/שירותים/ai-guide.ts` — AI + fallback
- `src/מסכים/JourneyScreen.tsx` — מסך המסע + popup צעצוע + סיום הדרגתי
- `src/מסכים/BreathScreen.tsx` — נשימות + דלגי

## צעדים הבאים
1. לבדוק ידנית את הזרימה המלאה (Playwright לא עובד כרגע)
2. לוודא popup צעצוע מופיע באמצע WARM
3. לוודא סיום הדרגתי עובד

---
📅 עדכון אחרון: 2026-05-13 17:35
💬 שיחה אחרונה: שדרוג עיצוב + UX עם סקירת 3 מוחות (Claude + Codex + Gemini 3.1 Pro)
