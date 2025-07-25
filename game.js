const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game Constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;

const PADDLE_SPEED = 7;
const BALL_SPEED = 6;

// Game State
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;


let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

// Score State
let player1Score = 0;
let player2Score = 0;

// Timer State
let startTime = null;
let gameDuration = 60; // seconds, default 1 min
let timerInterval = null;
let gameActive = false;

function updateTimer() {
    if (!gameActive) return;
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer-value').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (elapsed >= gameDuration) {
        endGame();
    }
}

function startGame() {
    // Reset state
    player1Score = 0;
    player2Score = 0;
    updateScoreboard();
    document.getElementById('winner-announcement').textContent = '';
    startTime = Date.now();
    gameActive = true;
    // Get duration from input
    const mins = parseInt(document.getElementById('game-minutes').value, 10) || 1;
    gameDuration = mins * 60;
    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    // Enable canvas
    canvas.style.pointerEvents = '';
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    // Disable canvas
    canvas.style.pointerEvents = 'none';
    // Announce winner
    let msg = `${Math.floor(gameDuration/60)} minute${gameDuration/60 > 1 ? 's' : ''} is over, the winner is `;
    if (player1Score > player2Score) {
        msg += 'the Visitor!';
    } else if (player2Score > player1Score) {
        msg += 'Ntuthuko (Computer)!';
    } else {
        msg = `It's a draw after ${Math.floor(gameDuration/60)} minute${gameDuration/60 > 1 ? 's' : ''}!`;
    }
    document.getElementById('winner-announcement').textContent = msg;
}

document.getElementById('start-game-btn').addEventListener('click', startGame);

function updateScoreboard() {
    document.getElementById('player1-score').textContent = player1Score;
    document.getElementById('player2-score').textContent = player2Score;
    let face1 = document.getElementById('player1-face');
    let face2 = document.getElementById('player2-face');
    if (player1Score > player2Score) {
        face1.textContent = '😃 Winning';
        face2.textContent = '😢 Oh no!';
    } else if (player2Score > player1Score) {
        face1.textContent = '😢 Oh no!';
        face2.textContent = '😃 Winning';
    } else {
        face1.textContent = '😊 Tie';
        face2.textContent = '😊 Tie';
    }
}

// Mouse Control
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Draw Functions
function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
}

function drawNet() {
    for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width / 2 - 2, y, 4, 20, '#666');
    }
}

function resetBall() {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Collision Detection
function checkCollision(paddleX, paddleY) {
    return (
        ballX < paddleX + PADDLE_WIDTH &&
        ballX + BALL_SIZE > paddleX &&
        ballY < paddleY + PADDLE_HEIGHT &&
        ballY + BALL_SIZE > paddleY
    );
}

// Game Loop
function update() {
    if (!gameActive) return;
    // Move Ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Ball collision with top/bottom
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballVelY = -ballVelY;
    }

    // Ball collision with player paddle
    if (checkCollision(PLAYER_X, playerY)) {
        ballX = PLAYER_X + PADDLE_WIDTH; // Prevent sticking
        ballVelX = -ballVelX;
        // Add some variation to ball's Y velocity
        let collidePoint = (ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
        collidePoint = collidePoint / (PADDLE_HEIGHT/2);
        ballVelY = BALL_SPEED * collidePoint;
    }

    // Ball collision with AI paddle
    if (checkCollision(AI_X, aiY)) {
        ballX = AI_X - BALL_SIZE; // Prevent sticking
        ballVelX = -ballVelX;
        let collidePoint = (ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
        collidePoint = collidePoint / (PADDLE_HEIGHT/2);
        ballVelY = BALL_SPEED * collidePoint;
    }

    // Ball out of bounds (left/right) — reset and update score
    if (ballX < 0) {
        // AI scores
        player2Score++;
        updateScoreboard();
        resetBall();
    } else if (ballX + BALL_SIZE > canvas.width) {
        // Player scores
        player1Score++;
        updateScoreboard();
        resetBall();
    }

    // Simple AI: Follow the ball, but not perfectly
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
        aiY += PADDLE_SPEED * 0.7;
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
        aiY -= PADDLE_SPEED * 0.7;
    }
    // Clamp AI paddle within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#0ff');
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#f00');

    // Draw ball
    drawBall(ballX, ballY, BALL_SIZE, '#fff');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
updateScoreboard();
document.getElementById('timer-value').textContent = '0:00';
document.getElementById('winner-announcement').textContent = '';
canvas.style.pointerEvents = 'none';
// gameLoop will keep running, but update() will do nothing if not active
gameLoop();
