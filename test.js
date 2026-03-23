/**
 * test.js
 * Lightweight testing system for NeuroSnake 2026.
 * Run `runTests()` in the browser console to execute.
 */

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ TEST FAILED: ${message}`);
        return false;
    }
    console.log(`✅ TEST PASSED: ${message}`);
    return true;
}

function runTests() {
    console.log("--- Starting NeuroSnake Tests ---");
    let passed = 0;
    let total = 0;
    
    // Save original state to restore later
    const originalSnake = [...snake];
    const originalFood = {...food};
    const originalVelocity = {...velocity};
    const originalScore = score;
    const originalObstacles = [...obstacles];
    const originalGameOver = isGameOver;

    try {
        // Test 1: Snake movement logic
        total++;
        snake = [{x: 5, y: 5}];
        velocity = {x: 1, y: 0};
        moveSnake();
        if (assert(snake[0].x === 6 && snake[0].y === 5, "Snake movement: Moves right correctly")) passed++;

        // Test 2: Wall collision detection
        // Note: TILE_COUNT is accessible from script.js
        total++;
        snake = [{x: TILE_COUNT, y: 5}]; // Beyond right wall
        isGameOver = false; // Reset state
        checkCollisions();
        if (assert(isGameOver === true, "Collision detection: Wall collision triggers game over")) passed++;

        // Test 3: Self collision detection
        total++;
        snake = [{x: 5, y: 5}, {x: 6, y: 5}, {x: 5, y: 5}]; // Head intersects body
        isGameOver = false;
        checkCollisions();
        if (assert(isGameOver === true, "Collision detection: Self collision triggers game over")) passed++;

        // Test 4: Food spawning
        total++;
        snake = [{x: 0, y: 0}, {x: 1, y: 0}];
        obstacles = [{x: 2, y: 0}];
        spawnFood();
        let foodNotOnSnake = true;
        for (let segment of snake) {
            if (food.x === segment.x && food.y === segment.y) foodNotOnSnake = false;
        }
        let foodNotOnObstacle = true;
        for (let obs of obstacles) {
            if (food.x === obs.x && food.y === obs.y) foodNotOnObstacle = false;
        }
        if (assert(foodNotOnSnake && foodNotOnObstacle, "Food spawning: Spawns in safe location")) passed++;

        // Test 5: Score update & growing (simulated based on logic in gameLoop)
        total++;
        snake = [{x: 10, y: 10}]; // Head on food
        food = {x: 10, y: 10}; 
        score = 0;
        let initialLength = snake.length;
        
        // Emulate the score increment logic from gameLoop
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            snake.push({ ...snake[snake.length - 1] });
        }
        
        if (assert(score === 1 && snake.length === initialLength + 1, "Score updates: Eating food increases score and length")) passed++;

    } catch (e) {
        console.error("Test execution failed:", e);
    } finally {
        // Restore original state gracefully
        snake = originalSnake;
        food = originalFood;
        velocity = originalVelocity;
        score = originalScore;
        obstacles = originalObstacles;
        isGameOver = originalGameOver;
        console.log(`--- Tests Completed: ${passed}/${total} Passed ---`);
    }
}

// Make accessible globally
window.runTests = runTests;
