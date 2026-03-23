# NeuroSnake 2026

## Overview
NeuroSnake 2026 is a modern reimagining of the classic "Snake" game, built dynamically entirely with HTML, CSS, and Vanilla JS constraint-driven (total size < 1MB). It uses the generative power of Gemini API to deliver AI-driven features like: real-time gameplay coaching, post-game analysis of performance, procedural obstacle difficulty generation, and environment themes based on player competence.

## Features
- **Core Classic Gameplay:** Fully featured snake with collisions, speed progression, and fluid mechanics.
- **Dynamic AI Coach:** Analyzes in real time based on near-misses, turn stats, and general strategy. You can pick between Analytical, Competitive, or Sarcastic AI personalities.
- **Gemini API Integration:** Hook up your API Key seamlessly from the UI to unleash dynamic prompting over player state.
- **Smart Adaptations:**
  - AI procedurally injects obstacles into your path as you score points.
  - The arena actively morphs into Cyberpunk, Jungle, or Space environments depending on how effectively you string together scores.
- **Lightweight & Accessible:** 0 dependencies. Pure HTML Grid and CSS custom properties logic with full keyboard navigation and screen reader support (ARIA tags, color contrast).

## Setup Instructions
1. Clone or download this project.
2. Open `index.html` in any modern web browser.
3. Once open, to unlock the true AI-coached experience, paste your Google Gemini API key securely in the "AI Oracle Settings" box (optional).
4. If without internet or no API key, NeuroSnake will gracefully fall back to a built-in mock AI engine mimicking the features seamlessly.
5. Hit BEGIN. Use Arrow Keys or W-A-S-D to dictate the neural-snake's path. Keyboard users can hit ENTER, SPACE or R to restart on game over.
6. **Testing:** Open your Browser Console and type `runTests()` to test core logic (movement, collision, spawning).

## How AI Enhances the Experience
Traditional snake is deterministic. In NeuroSnake, your playstyle is actively monitored. If you stick mainly to edges, if you nearly scrape a wall (tracked as near-miss), and what difficulty you are on – are all packaged into prompt variables. The AI feeds localized commentary through the terminal UI. On death, instead of a boring "Game Over", the model actually looks at your game stats to tell you *why* you failed based on its persona.

Structured Prompts are clearly separated:
- `generateHint`: gives short advice based on state.
- `analyzeGameplay`: gives post-game roast or compliment.
- `adjustDifficulty`: maps points to dynamic theme names ('cyberpunk', 'jungle', 'space').

## Firebase Analytics Simulation
Though lacking a true backend to stay local under 1MB, lightweight mock Firebase logger functions are included and hooked to gameplay events (e.g. food eaten, near-misses) logging locally to the browser console.

## Assumptions Made
- The game will run mostly on modern browsers supporting ES6 classes and Fetch API.
- Since it acts purely horizontally and doesn't rely on Node.js/backends per requirement for < 1MB plain web app, API key is entered at runtime purely locally without storage to avoid key exfiltration in a public repo.
