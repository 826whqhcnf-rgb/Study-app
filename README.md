# Gist — an AI study app like Gizmo

Gist is a Gizmo-style flashcard study app. It runs entirely in the browser, stores your data locally, and uses a heuristic on-device generator to turn pasted notes into flashcards — no API keys or backend required.

## Features

- **Decks & cards.** Create decks, edit cards, search and organize.
- **AI-style card generation.** Paste notes or `term: definition` lines and Gist produces Q&A cards (explicit pairs + cloze + concept questions).
- **Spaced repetition.** SM-2 inspired scheduler with four-button grading (Again / Hard / Good / Easy) and keyboard shortcuts (Space to flip, 1–4 to grade).
- **Quiz mode.** Multiple-choice quizzes with distractors drawn from your own cards.
- **Progress dashboard.** Streaks, 30-day activity bar chart, deck-by-deck stats, due counts, mature card counts.
- **Local-first.** All data stays in `localStorage` on your device.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal.

## Tech

- Vite + React + TypeScript
- Tailwind CSS
- LocalStorage persistence
- SM-2-inspired spaced repetition (`src/sm2.ts`)
- Heuristic card generator (`src/generator.ts`)
