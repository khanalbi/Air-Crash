const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');

let GAME_WIDTH, GAME_HEIGHT, BIRD_SIZE, PIPE_WIDTH, PIPE_GAP;

function setGameDimensions() {
    GAME_WIDTH = gameContainer.clientWidth;
    GAME_HEIGHT = gameContainer.clientHeight;
    BIRD_SIZE = Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.07;
    PIPE_WIDTH = GAME_WIDTH * 0.15;
    PIPE_GAP = GAME_HEIGHT * 0.25;

    bird.style.width = `${BIRD_SIZE}px`;
    bird.style.height = `${BIRD_SIZE}px`;
}

const FALL_SPEED = 2; // Pixels per frame
const JUMP_HEIGHT = 60; // Pixels per jump

let birdBottom;
let isGameOver = false;
let score = 0;
let gameTimerId;

let gameOverMessage;

// Add this line near the top of the file with other audio-related code
const scoreSound = document.getElementById('score-sound');

// Add this line near the top of the file with other audio-related constants
const crashSound = document.getElementById('crash-sound');

function startGame() {
    console.log("Game starting...");
    setGameDimensions();
    // Clear existing pipes
    const pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => pipe.remove());

    // Remove existing game over message if present
    if (gameOverMessage) {
        gameContainer.removeChild(gameOverMessage);
        gameOverMessage = null;
    }

    birdBottom = GAME_HEIGHT / 2;
    bird.style.bottom = `${birdBottom}px`;
    bird.style.left = `${GAME_WIDTH * 0.1}px`;
    score = 0;
    scoreElement.innerHTML = score;
    isGameOver = false;
    startButton.style.display = 'none';
    gameTimerId = setInterval(gameLoop, 20); // 50 FPS
    document.addEventListener('keydown', control);
    gameContainer.addEventListener('touchstart', handleTouch);
    gameContainer.addEventListener('mousedown', handleClick);
    generatePipe();
}

function gameLoop() {
    if (isGameOver) return;

    birdBottom -= FALL_SPEED;
    if (birdBottom < 0) {
        birdBottom = 0;
    }

    bird.style.bottom = `${birdBottom}px`;
    checkCollision();
}

function control(e) {
    if (!isGameOver && e.code === 'ArrowUp') {
        jump();
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (!isGameOver) {
        jump();
    }
}

function handleClick(e) {
    if (!isGameOver) {
        jump();
    }
}

const jumpSound = document.getElementById('jump-sound');

function jump() {
    if (!isGameOver) {
        if (birdBottom < GAME_HEIGHT - BIRD_SIZE) {
            birdBottom += JUMP_HEIGHT;
            if (birdBottom > GAME_HEIGHT - BIRD_SIZE) {
                birdBottom = GAME_HEIGHT - BIRD_SIZE;
            }
            bird.style.bottom = `${birdBottom}px`;
            
            // Play the jump sound
            jumpSound.currentTime = 0; // Reset the audio to the beginning
            jumpSound.play().catch(error => console.log("Audio play failed:", error));
        }
    }
}

function generatePipe() {
    if (isGameOver) return;
    
    let pipeBottom = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;

    const bottomPipe = document.createElement('div');
    const topPipe = document.createElement('div');

    bottomPipe.classList.add('pipe');
    topPipe.classList.add('pipe', 'top'); // Add 'top' class to the top pipe

    gameContainer.appendChild(bottomPipe);
    gameContainer.appendChild(topPipe);

    bottomPipe.style.left = `${GAME_WIDTH}px`;
    topPipe.style.left = `${GAME_WIDTH}px`;
    bottomPipe.style.bottom = '0px';
    topPipe.style.bottom = `${pipeBottom + PIPE_GAP}px`;
    bottomPipe.style.height = `${pipeBottom}px`;
    topPipe.style.height = `${GAME_HEIGHT - pipeBottom - PIPE_GAP}px`;
    bottomPipe.style.width = `${PIPE_WIDTH}px`;
    topPipe.style.width = `${PIPE_WIDTH}px`;

    function movePipe() {
        if (isGameOver) return;
        let pipeLeft = parseFloat(bottomPipe.style.left);
        pipeLeft -= 2 * (GAME_WIDTH / 400);
        bottomPipe.style.left = `${pipeLeft}px`;
        topPipe.style.left = `${pipeLeft}px`;

        if (pipeLeft <= -PIPE_WIDTH) {
            gameContainer.removeChild(bottomPipe);
            gameContainer.removeChild(topPipe);
            score++;
            scoreElement.innerHTML = score;
            
            // Play the score sound
            scoreSound.currentTime = 0; // Reset the audio to the beginning
            scoreSound.play().catch(error => console.log("Score audio play failed:", error));
        }

        if (pipeLeft === GAME_WIDTH / 2 - PIPE_WIDTH) {
            generatePipe();
        }

        if (!isGameOver) {
            requestAnimationFrame(movePipe);
        }
    }

    requestAnimationFrame(movePipe);
}

function checkCollision() {
    const pipes = document.querySelectorAll('.pipe');
    const birdRect = bird.getBoundingClientRect();

    // Check collision with floor
    if (birdRect.bottom >= GAME_HEIGHT) {
        console.log("Collision with floor");
        gameOver();
        return;
    }

    // Check collision with pipes
    for (let pipe of pipes) {
        const pipeRect = pipe.getBoundingClientRect();
        if (
            birdRect.right > pipeRect.left &&
            birdRect.left < pipeRect.right &&
            birdRect.bottom > pipeRect.top &&
            birdRect.top < pipeRect.bottom
        ) {
            console.log("Collision with pipe");
            gameOver(true);
            return;
        }
    }
}

function gameOver(crashedOnPipe = false) {
    if (isGameOver) return; // Prevent multiple calls to gameOver
    
    console.log("Game over function called");
    clearInterval(gameTimerId);
    isGameOver = true;
    document.removeEventListener('keydown', control);
    gameContainer.removeEventListener('touchstart', handleTouch);
    gameContainer.removeEventListener('mousedown', handleClick);
    
    // Play crash sound if the bird crashed on a pipe
    if (crashedOnPipe) {
        crashSound.currentTime = 0; // Reset the audio to the beginning
        crashSound.play().catch(error => console.log("Crash audio play failed:", error));
    }
    
    // Create and display game over message
    gameOverMessage = document.createElement('div');
    gameOverMessage.innerHTML = `Game Over!<br>Your score: ${score}`;
    gameOverMessage.style.position = 'absolute';
    gameOverMessage.style.top = '40%'; // Moved up slightly to make room for the button
    gameOverMessage.style.left = '50%';
    gameOverMessage.style.transform = 'translate(-50%, -50%)';
    gameOverMessage.style.fontSize = '24px';
    gameOverMessage.style.fontWeight = 'bold';
    gameOverMessage.style.textAlign = 'center';
    gameOverMessage.style.color = 'white';
    gameOverMessage.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    gameContainer.appendChild(gameOverMessage);

    // Update Play Again button
    startButton.style.display = 'block';
    startButton.innerHTML = 'Play Again';
    startButton.style.position = 'absolute';
    startButton.style.top = '60%'; // Positioned below the game over message
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.fontSize = '18px';
    startButton.style.padding = '10px 20px';
}

// Add this function to visualize hitboxes (for debugging)
function drawHitboxes() {
    const pipes = document.querySelectorAll('.pipe');
    const birdLeft = parseFloat(bird.style.left) || GAME_WIDTH * 0.1;
    const birdTop = GAME_HEIGHT - birdBottom - BIRD_SIZE;

    // Draw bird hitbox
    const birdHitbox = document.createElement('div');
    birdHitbox.style.position = 'absolute';
    birdHitbox.style.left = `${birdLeft}px`;
    birdHitbox.style.top = `${birdTop}px`;
    birdHitbox.style.width = `${BIRD_SIZE}px`;
    birdHitbox.style.height = `${BIRD_SIZE}px`;
    birdHitbox.style.border = '1px solid red';
    birdHitbox.style.pointerEvents = 'none';
    gameContainer.appendChild(birdHitbox);

    // Draw pipe hitboxes
    pipes.forEach(pipe => {
        const pipeHitbox = document.createElement('div');
        pipeHitbox.style.position = 'absolute';
        pipeHitbox.style.left = pipe.style.left;
        pipeHitbox.style.bottom = pipe.style.bottom;
        pipeHitbox.style.width = pipe.style.width;
        pipeHitbox.style.height = pipe.style.height;
        pipeHitbox.style.border = '1px solid blue';
        pipeHitbox.style.pointerEvents = 'none';
        gameContainer.appendChild(pipeHitbox);
    });
}

// Make sure this line is present and not commented out
startButton.addEventListener('click', startGame);

window.addEventListener('resize', setGameDimensions);
setGameDimensions();

// Add this line to log any errors
window.addEventListener('error', (e) => console.error('Error:', e.error));
