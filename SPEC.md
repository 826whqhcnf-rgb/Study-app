# QuestLog — Build Brief / Kickoff Prompt for Claude Code

> **How to use this:** Save this file as `SPEC.md` in an empty project folder, open Claude Code there, and start with:
> *"Read SPEC.md. Ask me any clarifying questions, then scaffold the project and propose a build order before writing feature code."*
> You also have a working web prototype (`questlog.html`) — hand it over as a **visual + mechanics reference**, not code to port line-by-line.

---

## 1. What we're building

A mobile app that turns daily self-improvement into an RPG. The user earns XP for healthy actions, levels up a character, unlocks titles, and keeps a daily streak alive. Working name: **QuestLog**.

Five tracked areas: **workouts, food, study/focus time, screen time, and custom daily habits.**

This is a solo project being built from a finished web prototype. The prototype proves out the game loop and the visual style; this app re-implements that natively and adds the OS-level features a web page cannot do.

---

## 2. Recommended stack

- **Expo (React Native)** with TypeScript. One codebase for iOS + Android, with the ability to write/native modules for the OS-restricted features.
- **Important:** the screen-time and app-blocking features require **custom native modules**, so this needs an Expo **development build / config plugins (prebuild)** — they will NOT run in Expo Go.
- Local persistence: start with **MMKV** or **SQLite** (via `expo-sqlite`). No backend required for v1; design the data layer so a sync backend can be added later.
- If you (Claude Code) believe Flutter or bare React Native is a materially better fit given the native requirements, say so before scaffolding.

> Before implementing the native modules, verify the current Apple and Android documentation — these platform APIs and their entitlement/permission rules change over time.

---

## 3. Core game mechanics (port these EXACTLY from the prototype)

These rules are the heart of the app. Implement them as a small, well-tested, UI-independent module (e.g. `lib/game.ts`).

**Leveling**

- XP needed to go from level `L` to `L+1`: `xpReq(L) = 100 + (L - 1) * 60`.
- Current level is derived from cumulative total XP (subtract `xpReq` for each level until remainder is below the next requirement).

**Titles by level** (use the highest threshold reached):
`1 Novice · 3 Apprentice · 5 Adventurer · 8 Trailblazer · 11 Knight · 14 Champion · 18 Hero · 22 Legend · 27 Mythic · 33 Ascended`

**Streaks**

- A "completion" = clearing any main quest OR checking any habit, the **first time it happens on a given day**.
- On first completion of the day: if the last completion date was *yesterday*, `streak += 1`; otherwise `streak = 1`.
- On app open / day rollover: if the last completion date is older than yesterday, `streak = 0`.
- Track `bestStreak`.

**XP values**

| Action                           | XP                                                     |
| -------------------------------- | ------------------------------------------------------ |
| Finish a workout                 | 50 base + 5 per logged set (set portion capped at +30) |
| Log a food item                  | +8 each, for the first 6 items/day                     |
| Reach 3 food items (quest clear) | +20 bonus (once/day)                                   |
| Complete a focus session         | +1 XP per minute focused                               |
| Reach daily study-minute goal    | +30 bonus (once/day)                                   |
| Stay under screen-time limit     | +50 (once/day)                                         |
| Check off a habit                | +15 each (subtract if unchecked)                       |
| **Perfect Day**                  | +40 bonus                                              |

**Perfect Day** = all four main quests done (workout, food, study, screen) AND every habit checked.

---

## 4. Screens

A bottom tab bar with four tabs (matches the prototype):

1. **Home** — character header (level "coin", XP progress bar, streak flame), the four quest status chips, the screen-time check-in card, and the editable habit checklist.
2. **Train** — add named exercises; per exercise, log sets as **weight (kg) × reps**; add/remove sets; "Finish Workout" computes total volume, records per-exercise PRs, and pre-fills last-used weight next time the same lift is logged.
3. **Eat** — log foods with an **optional calorie** field; running daily total; delete items.
4. **Focus** — pick any session length (presets + custom), optional **Strict Mode**, a countdown ring; completing a session banks minutes toward the daily study goal.

Plus a **Settings** sheet: screen-time limit, daily study-minute goal, reset-today, and erase-all (new game).

---

## 5. Data model (starting point)

```ts
type State = {
  xp: number;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;        // YYYY-MM-DD
  config: { screenLimitMin: number; studyGoalMin: number };
  habits: { id: string; name: string }[];
  prs: Record<string, number>;             // exerciseName -> best weight
  lastWeight: Record<string, number>;       // exerciseName -> last weight
  today: DayState;
  history: Record<string, { xp: number; volume?: number; studyMin?: number }>;
};

type DayState = {
  date: string;
  workout: { exercises: Exercise[]; done: boolean; volume?: number; sets?: number };
  food: { items: { id: string; name: string; kcal: number | null }[]; done: boolean };
  study: { minutes: number; sessions: number; done: boolean };
  screen: { used: number | null; done: boolean };
  habitsDone: Record<string, boolean>;
  earned: number;
  perfect: boolean;
};

type Exercise = { id: string; name: string; sets: { w: number | ''; r: number | '' }[] };
```

Daily rollover: on launch, if `today.date` differs from the real date, archive the day into `history` and start a fresh `DayState` (carry over the habit list, PRs, last weights, XP, and streak).

---

## 6. Native features (the hard part — phase these in last)

These replace the prototype's manual entry and "honest Strict Mode."

**A) Real screen-time tracking + app blocking**

- **iOS** — Apple's Screen Time API:
  - `FamilyControls` to request authorization.
  - `DeviceActivity` to read usage and schedule monitoring.
  - `ManagedSettings` to shield/block selected apps (e.g. during a focus session or when over budget).
  - Note: this requires the **Family Controls entitlement**, and distributing on the App Store requires requesting that entitlement from Apple. Flag this early.
- **Android**:
  - `UsageStatsManager` for usage (requires the `PACKAGE_USAGE_STATS` special-access permission the user grants in system settings).
  - App blocking is typically done with an **Accessibility Service** (detect foreground app, overlay/redirect) or device-admin. Google Play has strict policies on accessibility-service use — verify the current rules before relying on it.

**B) Focus-session enforcement**

- During a focus session (especially "Strict Mode"), use the blocking APIs above to actually restrict distracting apps, and `expo-keep-awake` to hold the screen on.
- Keep the existing in-app fallback (detect app backgrounding) for platforms/permissions where full blocking isn't granted.

---

## 7. Design direction (match the prototype)

Cozy "tavern quest log" RPG aesthetic — **not** a generic productivity app.

- **Theme:** warm dark background (deep browns/charcoal), gold as the primary accent.
- **Per-area accent colors:** workout = ember orange, food = jade green, study = sky blue, screen = violet.
- **Type:** a characterful display serif (the prototype uses *Fraunces*), a clean body sans (*Manrope*), and a pixel font (*Silkscreen*) for small "game" labels like the level badge.
- **Feel:** XP-bar fills, a flickering streak flame, floating "+XP" popups, and a celebratory level-up moment. Subtle, not noisy.

---

## 8. Suggested build order

1. Scaffold the Expo + TypeScript project with a dev build; set up navigation (4 tabs + settings) and the persistence layer.
2. Implement and unit-test the pure game module (XP, levels, titles, streaks, Perfect Day).
3. Build the four screens against local state, matching the design direction. (At this stage the app is fully usable with manual entry — same as the web prototype.)
4. Add daily rollover, history, and the level-up / XP animations.
5. **Then** layer in native screen-time reading and app-blocking, platform by platform, behind permission checks with graceful fallbacks.

Build it so steps 1–4 ship as a complete app on their own; the native features in step 5 are an enhancement, not a blocker.

---

## 9. How I'd like you (Claude Code) to work

- Ask clarifying questions before scaffolding if anything here is ambiguous.
- Propose the project structure and build order, and let me approve it before generating lots of code.
- Keep the game-rules module UI-independent and covered by tests.
- For each native feature, explain the permissions/entitlements I'll need to set up on my side, and verify against current platform docs.
