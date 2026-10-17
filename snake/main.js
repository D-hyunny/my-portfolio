const GRID_SIZE = 20;
const CELL_SIZE = 20;
const FOOD_SCORE = 10;
const LEVEL_UP_SCORE = 50;
const LEVEL_SPEED_UP_MS = 10;
const MIN_TICK_MS = 30;
const HIGH_SCORE_KEY = 'snake-high-score';

const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const gameOverEl = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');
const levelEl = document.getElementById('level');
const difficultySelect = document.getElementById('difficulty');

let baseTickMs = Number(difficultySelect.value);
let level = 1;
let isPlaying = false;
let isPaused = false;
let snake = [];
let direction = DIRECTIONS.ArrowRight;
let pendingDirections = [];
let food = null;
let score = 0;
let highScore = loadHighScore();
let timerId = null;

function loadHighScore() {
    try {
        return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch (error) {
        return 0;
    }
}

function saveHighScore() {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    } catch (error) {
        console.error(error);
    }
}

function placeFood() {
    const emptyCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!snake.some((part) => part.x === x && part.y === y)) {
                emptyCells.push({ x, y });
            }
        }
    }
    food = emptyCells.length > 0
        ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
        : null;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (food) {
        ctx.fillStyle = '#f56565';
        ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    }

    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#667eea' : '#a3b1f5';
        ctx.fillRect(part.x * CELL_SIZE + 1, part.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
}

function updateScore() {
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;
}

function startTimer() {
    const tickMs = Math.max(MIN_TICK_MS, baseTickMs - (level - 1) * LEVEL_SPEED_UP_MS);
    clearInterval(timerId);
    timerId = setInterval(tick, tickMs);
}

function togglePause() {
    if (!isPlaying) {
        return;
    }

    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerId);
        timerId = null;
    } else {
        startTimer();
    }
    pauseBtn.textContent = isPaused ? '계속하기' : '일시정지';
}

function startGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    direction = DIRECTIONS.ArrowRight;
    pendingDirections = [];
    score = 0;
    level = 1;
    baseTickMs = Number(difficultySelect.value);
    isPlaying = true;
    isPaused = false;
    placeFood();
    updateScore();
    draw();

    gameOverEl.hidden = true;
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = '일시정지';

    startTimer();
}

function endGame() {
    clearInterval(timerId);
    timerId = null;
    isPlaying = false;
    isPaused = false;
    difficultySelect.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '일시정지';

    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    updateScore();

    finalScoreEl.textContent = score;
    gameOverEl.hidden = false;
    startBtn.disabled = false;
}

function tick() {
    if (pendingDirections.length > 0) {
        direction = pendingDirections.shift();
    }

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
    const ateFood = food !== null && head.x === food.x && head.y === food.y;
    // 먹이를 먹지 않으면 꼬리가 한 칸 빠지므로 꼬리 자리는 충돌로 보지 않는다
    const body = ateFood ? snake : snake.slice(0, -1);
    const hitSelf = body.some((part) => part.x === head.x && part.y === head.y);

    if (hitWall || hitSelf) {
        endGame();
        return;
    }

    snake.unshift(head);
    if (ateFood) {
        score += FOOD_SCORE;
        const nextLevel = Math.floor(score / LEVEL_UP_SCORE) + 1;
        const leveledUp = nextLevel > level;
        level = nextLevel;
        updateScore();
        placeFood();
        if (food === null) {
            draw();
            endGame();
            return;
        }
        if (leveledUp) {
            startTimer();
        }
    } else {
        snake.pop();
    }

    draw();
}

document.addEventListener('keydown', (event) => {
    const next = DIRECTIONS[event.key];
    if (!next) {
        return;
    }
    event.preventDefault();

    if (!isPlaying || isPaused) {
        return;
    }

    const last = pendingDirections.length > 0
        ? pendingDirections[pendingDirections.length - 1]
        : direction;
    const isSameAxis = last.x === next.x || last.y === next.y;
    if (!isSameAxis && pendingDirections.length < 2) {
        pendingDirections.push(next);
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

updateScore();
draw();
