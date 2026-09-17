const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.querySelector('#start-button');
const status = document.querySelector('#status');
const playerScore = document.querySelector('#player-score');
const computerScore = document.querySelector('#computer-score');

const paddle = { width: 14, height: 96, speed: 8 };
const player = { x: 28, y: canvas.height / 2 - paddle.height / 2 };
const computer = { x: canvas.width - 42, y: canvas.height / 2 - paddle.height / 2 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 9, speed: 6, vx: 6, vy: 3 };
let scores = { player: 0, computer: 0 };
let running = false;
let animationId;
let keys = {};

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6;
  ball.vx = direction * ball.speed;
  ball.vy = (Math.random() * 2 - 1) * 3.5;
}

function setStatus(message, visible = true) {
  status.textContent = message;
  status.classList.toggle('hidden', !visible);
}

function startGame() {
  if (running) return;
  running = true;
  startButton.textContent = 'Restart game';
  setStatus('', false);
  resetBall();
  animationId = requestAnimationFrame(gameLoop);
}

function restartGame() {
  cancelAnimationFrame(animationId);
  scores = { player: 0, computer: 0 };
  playerScore.textContent = '0';
  computerScore.textContent = '0';
  player.y = computer.y = canvas.height / 2 - paddle.height / 2;
  running = false;
  startButton.textContent = 'Start game';
  setStatus('Press Start to play');
}

function movePlayer() {
  if (keys.ArrowUp) player.y -= paddle.speed;
  if (keys.ArrowDown) player.y += paddle.speed;
  player.y = Math.max(0, Math.min(canvas.height - paddle.height, player.y));
}

function moveComputer() {
  // The computer follows the ball, with a small speed limit so it remains beatable.
  const target = ball.y - paddle.height / 2;
  const distance = target - computer.y;
  computer.y += Math.sign(distance) * Math.min(Math.abs(distance), 5.2);
  computer.y = Math.max(0, Math.min(canvas.height - paddle.height, computer.y));
}

function intersects(paddleObject) {
  return ball.x - ball.radius < paddleObject.x + paddle.width &&
    ball.x + ball.radius > paddleObject.x &&
    ball.y - ball.radius < paddleObject.y + paddle.height &&
    ball.y + ball.radius > paddleObject.y;
}

function update() {
  movePlayer();
  moveComputer();
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
  }

  if (intersects(player) && ball.vx < 0) {
    ball.x = player.x + paddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) * 1.04;
    ball.vy += (ball.y - (player.y + paddle.height / 2)) * 0.08;
  }
  if (intersects(computer) && ball.vx > 0) {
    ball.x = computer.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 1.04;
    ball.vy += (ball.y - (computer.y + paddle.height / 2)) * 0.08;
  }

  if (ball.x < -ball.radius) score('computer');
  if (ball.x > canvas.width + ball.radius) score('player');
}

function score(winner) {
  scores[winner]++;
  playerScore.textContent = scores.player;
  computerScore.textContent = scores.computer;
  if (scores[winner] >= 7) {
    running = false;
    setStatus(`${winner === 'player' ? 'You win!' : 'Computer wins!'} Press Restart game`, true);
    startButton.textContent = 'Restart game';
    return;
  }
  resetBall(winner === 'player' ? 1 : -1);
}

function draw() {
  ctx.fillStyle = '#0e1430';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setLineDash([10, 16]);
  ctx.strokeStyle = '#394568';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#78f3cb';
  ctx.shadowColor = '#78f3cb'; ctx.shadowBlur = 16;
  ctx.fillRect(player.x, player.y, paddle.width, paddle.height);
  ctx.fillStyle = '#8d9cff';
  ctx.shadowColor = '#8d9cff';
  ctx.fillRect(computer.x, computer.y, paddle.width, paddle.height);
  ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
}

function gameLoop() {
  if (!running) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const bounds = canvas.getBoundingClientRect();
  const scale = canvas.height / bounds.height;
  player.y = (event.clientY - bounds.top) * scale - paddle.height / 2;
  player.y = Math.max(0, Math.min(canvas.height - paddle.height, player.y));
});
document.addEventListener('keydown', (event) => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); keys[event.key] = true; } });
document.addEventListener('keyup', (event) => { keys[event.key] = false; });
startButton.addEventListener('click', () => { if (scores.player >= 7 || scores.computer >= 7) restartGame(); else startGame(); });

draw();
