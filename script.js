/**
 * script.js
 * Core Game Logic for NeuroSnake 2026.
 */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game State
let snake = [];
let velocity = { x: 0, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let obstacles = [];

// Timing and loop
let gameLoopTimeout;
let baseSpeedMs = 150;
let currentSpeedMs = baseSpeedMs;
let isGameOver = true;
let gameStarted = false;

// AI Integration tracking
let aiHintInterval;

// DOM Elements
const scoreDisplay = document.getElementById("scoreDisplay");
const speedDisplay = document.getElementById("speedDisplay");
const themeDisplay = document.getElementById("themeDisplay");
const finalScore = document.getElementById("finalScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const startScreen = document.getElementById("startScreen");
const aiAnalysis = document.getElementById("aiAnalysis");
const hintLog = document.getElementById("hintLog");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

/**
 * Initializes the game state, resetting the score, snake, and AI metrics.
 */
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    velocity = { x: 0, y: -1 };
    score = 0;
    obstacles = [];
    currentSpeedMs = baseSpeedMs;
    aiEngine.playerProfile = { turnsThisGame: 0, nearMisses: 0, foodCollected: 0 };
    
    updateDisplay();
    spawnFood();
    
    hintLog.replaceChildren(); // Safely clear feedback
    addLog('> Neural link established. Good luck.', 'sys-msg');
    document.body.className = ''; // Reset theme
    
    isGameOver = false;
    gameStarted = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    
    clearTimeout(gameLoopTimeout);
    clearInterval(aiHintInterval);
    
    if (document.getElementById("aiCoachToggle").checked) {
        aiHintInterval = setInterval(triggerAIHint, 8000); // Try to get a hint every 8s
    }
    
    gameLoop();
}

/**
 * Main game loop: controls the logic update tick safely.
 * Called recursively via setTimeout.
 */
function gameLoop() {
    if (isGameOver) return;
    
    moveSnake();
    checkCollisions();
    
    // Check if food eaten
    if (!isGameOver && snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        aiEngine.updatePlayerProfile({type: 'food'});
        
        // Grow snake
        snake.push({ ...snake[snake.length - 1] });
        
        spawnFood();
        updateDifficulty();
        updateDisplay();
        triggerThemeCheck();
    }
    
    if (!isGameOver) {
        drawGame();
        gameLoopTimeout = setTimeout(gameLoop, currentSpeedMs);
    }
}

/**
 * Calculates the next head position vector and updates the snake array.
 */
function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    
    snake.unshift(head);
    snake.pop(); // Remove tail
}

/**
 * Determines if the snake has hit a wall, an obstacle, or itself.
 * Triggers game over logic on lethal collisions.
 */
function checkCollisions() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        triggerGameOver();
        return;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            triggerGameOver();
            return;
        }
    }
    
    // Obstacle collision
    for (let obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            triggerGameOver();
            return;
        }
    }
    
    // Near Miss check (simplistic: if adjacent to wall but moving parallel to it)
    if (head.x === 0 || head.x === TILE_COUNT-1 || head.y === 0 || head.y === TILE_COUNT-1) {
        if (Math.random() < 0.1) aiEngine.updatePlayerProfile({type: 'near_miss'});
    }
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        
        valid = true;
        
        // Ensure not on snake
        for (let segment of snake) {
            if (food.x === segment.x && food.y === segment.y) valid = false;
        }
        
        // Ensure not on obstacle
        for (let obs of obstacles) {
            if (food.x === obs.x && food.y === obs.y) valid = false;
        }
    }
}

function updateDifficulty() {
    // Speed increases slightly per score
    currentSpeedMs = Math.max(50, baseSpeedMs - (score * 3));
    
    // Every 5 points, spawn an AI generated obstacle pattern
    if (score > 0 && score % 5 === 0) {
        generateObstacle();
    }
}

// Procedural obstacle generation 
function generateObstacle() {
    let obsX, obsY;
    let valid = false;
    while (!valid) {
        obsX = Math.floor(Math.random() * TILE_COUNT);
        obsY = Math.floor(Math.random() * TILE_COUNT);
        
        // Don't spawn near head
        let dist = Math.abs(obsX - snake[0].x) + Math.abs(obsY - snake[0].y);
        if (dist > 5) valid = true;
    }
    obstacles.push({ x: obsX, y: obsY });
    addLog(`> AI modified environment: New obstacle injected.`);
}

// Cache CSS colors for performance (prevents reflow operations each frame)
let computedColors = {};
function updateCachedColors() {
    const style = getComputedStyle(document.body);
    computedColors.snakeHead = style.getPropertyValue('--snake-head').trim() || '#66fcf1';
    computedColors.snakeBody = style.getPropertyValue('--snake-body').trim() || '#45a29e';
    computedColors.food = style.getPropertyValue('--food-color').trim() || '#ff0055';
    computedColors.obs = style.getPropertyValue('--obstacle-color').trim() || '#bbbbbb';
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw obstacles
    ctx.fillStyle = computedColors.obs;
    for (let obs of obstacles) {
        ctx.fillRect(obs.x * GRID_SIZE, obs.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
    
    // Draw food
    ctx.fillStyle = computedColors.food;
    ctx.shadowBlur = 10;
    ctx.shadowColor = computedColors.food;
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0; // reset
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? computedColors.snakeHead : computedColors.snakeBody;
        ctx.fillRect(snake[i].x * GRID_SIZE, snake[i].y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
}

function updateDisplay() {
    scoreDisplay.innerText = score;
    let speedMult = (baseSpeedMs / currentSpeedMs).toFixed(1);
    speedDisplay.innerText = speedMult + "x";
}

/**
 * Asks the AI Engine to provide a visual theme based on score/metrics.
 */
async function triggerThemeCheck() {
    try {
        const newThemeName = await aiEngine.adjustDifficulty({ score: score });
        const currentTheme = document.body.className;
        const targetClass = newThemeName === "cyberpunk" ? "" : `theme-${newThemeName}`;
        
        if (currentTheme !== targetClass && targetClass !== undefined) {
            document.body.className = targetClass;
            updateCachedColors(); // Efficiency: Refresh color cache on theme change
            themeDisplay.innerText = newThemeName.toUpperCase();
            addLog(`> AI mapped new environment: ${newThemeName.toUpperCase()}`);
        }
    } catch (e) {
        GCPLogger.error("Error during theme check", { error: e.message });
    }
}

/**
 * Triggers an AI coaching hint asynchronously to avoid blocking the main thread.
 */
async function triggerAIHint() {
    if (isGameOver || !gameStarted) return;
    
    const gameState = {
        score: score,
        snakeLength: snake.length,
        speed: (baseSpeedMs / currentSpeedMs)
    };
    
    try {
        const hint = await aiEngine.generateHint(gameState);
        if(hint) {
            addLog(`[AI Coach]: ${hint}`, 'hint-msg');
        }
    } catch (e) {
        GCPLogger.error("Hint extraction error", { err: e.message });
    }
}

/**
 * Handles end of game state and asynchronous post-game AI analysis.
 */
async function triggerGameOver() {
    isGameOver = true;
    clearInterval(aiHintInterval);
    
    finalScore.innerText = score;
    aiAnalysis.innerText = "Analyzing neural performance...";
    gameOverScreen.classList.remove("hidden");
    restartBtn.focus(); // Accessibility: Focus on restart
    
    // Google Calendar API Integration (URL creation)
    const calendarBtn = document.getElementById("calendarBtn");
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=NeuroSnake+Training+Session&details=Score+to+beat:+${score}&dates=20261231T180000Z/20261231T190000Z`;
    calendarBtn.href = calendarUrl;
    
    try {
        const analysis = await aiEngine.analyzeGameplay(score, null);
        aiAnalysis.innerText = analysis;
    } catch(e) {
        GCPLogger.error("Analysis Error", { msg: "System error during analysis generation" });
    }
}

function addLog(msg, cssClass = 'sys-msg') {
    const p = document.createElement("p");
    p.className = cssClass;
    p.textContent = msg; // Security: sanitize using textContent instead of innerText
    hintLog.appendChild(p);
    hintLog.scrollTop = hintLog.scrollHeight;
}

// Controls
window.addEventListener("keydown", (e) => {
    // Prevent overriding keyboard behavior strictly for specific keys
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") {
        return;
    }

    if (isGameOver) {
        if (e.key === "Enter" || e.key === "r" || e.key === "R" || e.key === " ") {
            initGame();
        }
        return;
    }
    
    // Prevent reverse gear
    const { x, y } = velocity;
    
    switch(e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            if (y === 1) break;
            velocity = { x: 0, y: -1 };
            aiEngine.updatePlayerProfile({type: 'turn'});
            break;
        case "ArrowDown":
        case "s":
        case "S":
            if (y === -1) break;
            velocity = { x: 0, y: 1 };
            aiEngine.updatePlayerProfile({type: 'turn'});
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (x === 1) break;
            velocity = { x: -1, y: 0 };
            aiEngine.updatePlayerProfile({type: 'turn'});
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (x === -1) break;
            velocity = { x: 1, y: 0 };
            aiEngine.updatePlayerProfile({type: 'turn'});
            break;
    }
});

startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);

// Initial cache and draw
updateCachedColors();
drawGame();
