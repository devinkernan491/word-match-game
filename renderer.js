// Game State
const gameState = {
  isRunning: false,
  isPaused: false,
  score: 0,
  level: 1,
  selectedWord: null,
  startTime: null,
  elapsedTime: 0,
  timeInterval: null,
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const startScreen = document.getElementById('startScreen');

let wordPairs = [];
let activeWords = [];
let confetti = [];
let audioContext = null;

function unlockAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playWrongAnswerSound() {
  unlockAudio();
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(180, now);
  oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.18);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load words
async function loadWords() {
  try {
    const response = await fetch('words.json');
    const data = await response.json();
    wordPairs = data.words.slice(0, 800); // Use top 800 words
    return true;
  } catch (error) {
    console.error('Error loading words:', error);
    // Fallback words if load fails
    wordPairs = [
      { english: 'hello', spanish: 'hola' },
      { english: 'goodbye', spanish: 'adiós' },
      { english: 'thank you', spanish: 'gracias' },
      { english: 'please', spanish: 'por favor' },
      { english: 'sorry', spanish: 'lo siento' },
    ];
    return false;
  }
}

class WordBox {
  constructor(text, isEnglish, x, y) {
    this.text = text;
    this.isEnglish = isEnglish;
    this.x = x;
    this.y = y;
    this.width = 120;
    this.height = 50;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.matched = false;
    this.selected = false;
    this.id = Math.random();
    this.matchId = null;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  update() {
    if (this.matched) return;

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    // Bounce off walls
    if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > canvas.width) {
      this.vx *= -1;
      this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
    }
    if (this.y - this.height / 2 < 0 || this.y + this.height / 2 > canvas.height) {
      this.vy *= -1;
      this.y = Math.max(this.height / 2, Math.min(canvas.height - this.height / 2, this.y));
    }

    // Gradual friction
    this.vx *= 0.995;
    this.vy *= 0.995;
  }

  draw(ctx) {
    if (this.matched) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Background
    ctx.fillStyle = this.selected ? '#FFD700' : (this.isEnglish ? '#FF6B6B' : '#4ECDC4');
    ctx.borderRadius = 8;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Border
    ctx.strokeStyle = this.selected ? '#FFA500' : '#fff';
    ctx.lineWidth = this.selected ? 3 : 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, 0, 0);

    ctx.restore();
  }

  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const padding = 10;

    return Math.abs(localX) < (this.width / 2) + padding && Math.abs(localY) < (this.height / 2) + padding;
  }
}

function createNewLevel() {
  const pairsCount = Math.min(5 + Math.floor(gameState.level / 2), 15);
  const selectedPairs = [];

  // Get random unique pairs
  for (let i = 0; i < pairsCount; i++) {
    selectedPairs.push(wordPairs[Math.floor(Math.random() * wordPairs.length)]);
  }

  activeWords = [];

  selectedPairs.forEach((pair) => {
    // Create English word
    const engWord = new WordBox(pair.english, true, Math.random() * (canvas.width - 200) + 100, Math.random() * (canvas.height - 200) + 100);

    // Create Spanish word
    const spWord = new WordBox(pair.spanish, false, Math.random() * (canvas.width - 200) + 100, Math.random() * (canvas.height - 200) + 100);

    // Link them
    engWord.matchId = spWord.id;
    spWord.matchId = engWord.id;

    // Increase speed and rotation with difficulty
    const speedMultiplier = 1 + (gameState.level - 1) * 0.2;
    engWord.vx *= speedMultiplier;
    engWord.vy *= speedMultiplier;
    engWord.rotationSpeed *= speedMultiplier;
    spWord.vx *= speedMultiplier;
    spWord.vy *= speedMultiplier;
    spWord.rotationSpeed *= speedMultiplier;

    activeWords.push(engWord, spWord);
  });
}

function startGame() {
  unlockAudio();
  gameState.isRunning = true;
  gameState.score = 0;
  gameState.level = 1;
  gameState.selectedWord = null;
  gameState.startTime = Date.now();

  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  document.getElementById('gameOver').classList.add('hidden');

  createNewLevel();
  updateUI();
  gameLoop();

  // Update timer
  gameState.timeInterval = setInterval(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
      updateUI();
    }
  }, 1000);
}

function updateUI() {
  document.getElementById('score').textContent = `Score: ${gameState.score}`;
  document.getElementById('level').textContent = `Level: ${gameState.level}`;
  document.getElementById('timer').textContent = `Time: ${gameState.elapsedTime}s`;
}

function createConfettiBurst(x, y) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#7B68EE', '#00F5D4', '#F15BB5'];

  for (let i = 0; i < 40; i++) {
    confetti.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7 - 1.5,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      gravity: 0.08,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.25,
    });
  }
}

function updateConfetti() {
  confetti = confetti.filter(piece => piece.alpha > 0.05);

  for (const piece of confetti) {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += piece.gravity;
    piece.rotation += piece.spin;
    piece.alpha -= 0.01;
  }
}

function drawConfetti() {
  for (const piece of confetti) {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = piece.alpha;
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
    ctx.restore();
  }
}

function handleCanvasClick(e) {
  if (!gameState.isRunning) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let word of activeWords) {
    if (word.contains(x, y) && !word.matched) {
      if (!gameState.selectedWord) {
        gameState.selectedWord = word;
        word.selected = true;
      } else if (gameState.selectedWord.matchId === word.id) {
        // Match found!
        gameState.selectedWord.matched = true;
        word.matched = true;
        gameState.score += 10;
        createConfettiBurst((gameState.selectedWord.x + word.x) / 2, (gameState.selectedWord.y + word.y) / 2);

        gameState.selectedWord = null;
        updateUI();

        // Check if all matched
        if (activeWords.every(w => w.matched)) {
          gameState.level++;
          createNewLevel();
        }
      } else if (gameState.selectedWord.id !== word.id) {
        // Wrong match - deselect
        gameState.selectedWord.selected = false;
        gameState.selectedWord = null;
        playWrongAnswerSound();
      }
      return;
    }
  }

  // Deselect if clicking empty space
  if (gameState.selectedWord) {
    gameState.selectedWord.selected = false;
    gameState.selectedWord = null;
  }
}

function gameLoop() {
  // Clear canvas with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw words
  for (let word of activeWords) {
    word.update();
    word.draw(ctx);
  }

  updateConfetti();
  drawConfetti();

  // Draw selection indicator
  if (gameState.selectedWord) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gameState.selectedWord.x, gameState.selectedWord.y, 70, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (gameState.isRunning) {
    requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameState.isRunning = false;
  clearInterval(gameState.timeInterval);

  document.getElementById('finalScore').textContent = `Final Score: ${gameState.score}`;
  document.getElementById('finalLevel').textContent = `Level Reached: ${gameState.level}`;
  document.getElementById('finalTime').textContent = `Time Played: ${gameState.elapsedTime}s`;
  document.getElementById('gameOver').classList.remove('hidden');
}

// Event listeners
document.getElementById('startButton').addEventListener('click', startGame);
canvas.addEventListener('click', handleCanvasClick);

// Load words on page load
loadWords().then(() => {
  console.log(`Loaded ${wordPairs.length} word pairs`);
});

// Allow ESC to end game
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && gameState.isRunning) {
    endGame();
  }
});

// Optional: Add game timer (game over after 2 minutes)
setInterval(() => {
  if (gameState.isRunning && gameState.elapsedTime > 120) {
    endGame();
  }
}, 1000);
