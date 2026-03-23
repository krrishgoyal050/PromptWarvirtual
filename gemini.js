/**
 * gemini.js
 * Handles AI interactions using either the Gemini API or a smart local mockup.
 * 
 * HOW GEMINI IMPROVES GAMEPLAY:
 * Gemini analyzes real-time player data (score, speed, near-misses) to provide
 * contextual hints. Post-game, it evaluates the playstyle to give actionable feedback
 * based on selected AI personality.
 * 
 * DATA SENT TO AI:
 * - Current Game State: Score, Snake Length, Current Speed Multiplier.
 * - Player Profile: Turns taken, food collected, near-misses with walls.
 */

// Simulated Firebase Usage (Optional Goal)
const mockFirebaseConfig = {
    apiKey: "AIzaSyMockKeyForFirebaseSimulation",
    authDomain: "neurosnake-2026.firebaseapp.com",
    projectId: "neurosnake-2026",
    storageBucket: "neurosnake-2026.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:123:web:abc"
};

// Mock analytics/logging function
function logAnalyticsEvent(eventName, eventData) {
    console.log(`[Firebase Analytics Mock] Event: ${eventName}`, eventData);
}

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

class AIEngine {
    constructor() {
        this.personalities = {
            analytical: "You are an analytical, professional AI coach. Provide concise, logical advice based on the player's snake game performance.",
            competitive: "You are a highly competitive, trash-talking but motivational AI coach. You roast the player for mistakes but push them to be faster in snake.",
            sarcastic: "You are a sarcastic, passive-aggressive AI coach playing snake. Give backhanded compliments and humorous commentary on their gameplay."
        };
        // Player tracking
        this.playerProfile = {
            turnsThisGame: 0,
            nearMisses: 0,
            foodCollected: 0,
            averageReactionTime: 0, 
            playstyle: "unknown"
        };
    }

    getApiKey() {
        return document.getElementById("geminiApiKey").value.trim();
    }

    getStylePrompt() {
        const style = document.getElementById("aiPersonality").value;
        return this.personalities[style] || this.personalities.analytical;
    }

    /**
     * Updates the player profile based on actions in-game.
     * Logs the data to mock analytics.
     */
    updatePlayerProfile(event) {
        if(event.type === 'turn') this.playerProfile.turnsThisGame++;
        if(event.type === 'food') this.playerProfile.foodCollected++;
        if(event.type === 'near_miss') this.playerProfile.nearMisses++;
        
        // Log telemetry
        if(event.type === 'food' || event.type === 'near_miss') {
            logAnalyticsEvent("player_action", { type: event.type, profile: this.playerProfile });
        }
    }

    /**
     * STRUCTURED PROMPT: generateHint
     * Generates a contextually aware hint based on current state.
     */
    async generateHint(gameState) {
        const apiKey = this.getApiKey();
        const promptText = `${this.getStylePrompt()} 
The player is currently playing Snake.
Current score: ${gameState.score}. Length: ${gameState.snakeLength}. Speed: ${gameState.speed.toFixed(2)}x.
Playstyle tracked: ${this.playerProfile.foodCollected} food eaten so far, ${this.playerProfile.nearMisses} near-misses with walls.
Give a ONE SENTENCE piece of advice or commentary right now. Keep it under 15 words.`;

        if (apiKey) {
            try {
                return await this._callGeminiAPI(apiKey, promptText);
            } catch (err) {
                console.warn("API Error, falling back to mock hint", err);
                return this._getMockHint(gameState, document.getElementById("aiPersonality").value);
            }
        } else {
            return this._getMockHint(gameState, document.getElementById("aiPersonality").value);
        }
    }

    /**
     * STRUCTURED PROMPT: analyzeGameplay
     * Generates a post-game analysis on death.
     */
    async analyzeGameplay(finalScore, history) {
        logAnalyticsEvent("game_over", { finalScore, turns: this.playerProfile.turnsThisGame, nearMisses: this.playerProfile.nearMisses });
        
        const apiKey = this.getApiKey();
        const promptText = `${this.getStylePrompt()}
The player just died in Snake.
Final Score: ${finalScore}. Total food eaten: ${this.playerProfile.foodCollected}.
Total turns made: ${this.playerProfile.turnsThisGame}. Near misses (narrow escapes): ${this.playerProfile.nearMisses}.
Provide a brief (2-3 sentences) end-of-game analysis of their playstyle, why they might have failed, and what to focus on next time.`;

        if (apiKey) {
            try {
                return await this._callGeminiAPI(apiKey, promptText);
            } catch (err) {
                console.warn("API Error, falling back to mock analysis", err);
                return this._getMockAnalysis(finalScore, document.getElementById("aiPersonality").value);
            }
        } else {
            return this._getMockAnalysis(finalScore, document.getElementById("aiPersonality").value);
        }
    }

    /**
     * STRUCTURED PROMPT: adjustDifficulty
     * Asks AI to choose an environment theme based on score/metrics.
     */
    async adjustDifficulty(metrics) {
        const score = metrics.score;
        const apiKey = this.getApiKey();
        const promptText = `Return exactly ONE word representing a visual theme for a Snake game based on a score of ${score}: if under 7 return 'cyberpunk', if 8-15 return 'jungle', if over 15 return 'space'. Reply with just the word in lowercase, nothing else.`;
        
        if (apiKey) {
            try {
                const theme = await this._callGeminiAPI(apiKey, promptText);
                return theme.toLowerCase().trim();
            } catch (err) {
                console.warn("API Error, falling back to mock theme", err);
                return this._getMockTheme(score);
            }
        } else {
            return this._getMockTheme(score);
        }
    }

    async _callGeminiAPI(apiKey, prompt) {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.replace(/\n'/g, "").trim();
    }

    // --- FALLBACK MOCK RESPONSES ---

    _getMockHint(gameState, personality) {
        const hints = {
            analytical: [
                "Maintain center control.",
                "Avoid edges to maximize options.",
                "Your path is clear, proceed.",
                "Plan 3 moves ahead.",
                "Sub-optimal spacing detected."
            ],
            competitive: [
                "Too slow! Move your fingers!",
                "Is that all you got? Eat faster!",
                "Stop hugging the wall, coward!",
                "My grandma slithers faster than you.",
                "Go for the food! Don't stall!"
            ],
            sarcastic: [
                "Oh look, moving in circles. Innovative.",
                "Wow, so close to the wall. Brave.",
                "Do you always take the longest route?",
                "Fascinating strategy: trapping yourself.",
                "I bet you think you're doing great."
            ]
        };
        const pool = hints[personality] || hints.analytical;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _getMockAnalysis(score, personality) {
        if (score === 0) {
            return personality === 'competitive' ? "0 score?! Weak. Try actually playing." : "Analysis: Player failed instantly.";
        }
        
        if (personality === 'analytical') {
            return `Analysis complete. Final score: ${score}. With ${this.playerProfile.turnsThisGame} directional changes, your path mapping was average. To improve, prioritize spatial awareness over immediate food targeting.`;
        } else if (personality === 'competitive') {
            return `You hit a wall with a pathetic score of ${score}. Stop choking under pressure! Next time, stay sharp and stop playing so defensively!`;
        } else {
            return `A score of ${score}... Truly groundbreaking gameplay. The way you effortlessly ran into your own tail (or a wall) shows a complete lack of foresight. Better luck next time?`;
        }
    }

    _getMockTheme(score) {
        if (score > 15) return "space";
        if (score > 7) return "jungle";
        return "cyberpunk";
    }
}

// Expose the global engine
const aiEngine = new AIEngine();
window.aiEngine = aiEngine;
