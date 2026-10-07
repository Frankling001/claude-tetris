'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Paleta activa: se reasigna al cambiar de skin (por defecto, retro)
let COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#90caf9', // J - pale blue
  '#ffb74d', // L - orange
  '#b0bec5', // N - tuerca (gris metálico)
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // N (tuerca)
];

// ---- Skins visuales ----
// Cada skin: colors[9] (0 = null), background/grid (null = variable CSS del tema),
// drawBlock y drawNutHole con la misma firma que usa el resto del juego.
function roundRectPath(context, x, y, w, h, r) {
  context.beginPath();
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, w, h, r);
    return;
  }
  // fallback con arcTo
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function strokeNutCircle(context, x, y, size, color, width) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.arc(x * size + size / 2, y * size + size / 2, size * 0.3, 0, Math.PI * 2);
  context.stroke();
}

const SKINS = {
  retro: {
    colors: COLORS,
    background: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = COLORS[colorIndex];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // highlight
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
    drawNutHole(context, x, y, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      strokeNutCircle(context, x, y, size, COLORS[8], 3);
      context.globalAlpha = 1;
    },
  },
  neon: {
    colors: [null, '#00e5ff', '#ffee00', '#d500f9', '#00ff6a', '#ff1744', '#448aff', '#ff9100', '#cfd8dc'],
    background: '#000000',
    grid: '#1a1a24',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const color = COLORS[colorIndex];
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = color + '40';
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
      context.globalAlpha = 1;
    },
    drawNutHole(context, x, y, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = COLORS[8];
      context.shadowBlur = 10;
      strokeNutCircle(context, x, y, size, COLORS[8], 2);
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
      context.globalAlpha = 1;
    },
  },
  pastel: {
    colors: [null, '#a8e6f0', '#fff0a8', '#d9b8f0', '#b8ecc0', '#f7b5b5', '#b5d3f7', '#fbd0a0', '#a9b8c0'],
    background: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      roundRectPath(context, x * size + 2, y * size + 2, size - 4, size - 4, 7);
      context.fillStyle = COLORS[colorIndex];
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,0.7)';
      context.lineWidth = 1.5;
      context.stroke();
      context.globalAlpha = 1;
    },
    drawNutHole(context, x, y, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      strokeNutCircle(context, x, y, size, COLORS[8], 3);
      context.globalAlpha = 1;
    },
  },
  pixel: {
    colors: [null, '#29b6d6', '#f2c100', '#9c4dcc', '#43a047', '#d84040', '#3f7fd8', '#ef8a17', '#90a4ae'],
    background: null,
    grid: null,
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const px = x * size + 1, py = y * size + 1;
      const n = 4, cell = (size - 2) / n;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = COLORS[colorIndex];
      context.fillRect(px, py, size - 2, size - 2);
      // textura 4x4 subpíxeles: luces arriba/izquierda, sombras abajo/derecha
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          let tint = null;
          if (r === 0 || c === 0) tint = 'rgba(255,255,255,0.4)';
          else if (r === n - 1 || c === n - 1) tint = 'rgba(0,0,0,0.35)';
          else if ((r + c) % 2 === 0) tint = 'rgba(255,255,255,0.12)';
          if (!tint) continue;
          context.fillStyle = tint;
          context.fillRect(px + c * cell, py + r * cell, cell, cell);
        }
      }
      context.globalAlpha = 1;
    },
    drawNutHole(context, x, y, size, alpha) {
      // hueco hecho de píxeles
      const cell = size / 5;
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = COLORS[8];
      for (const [dx, dy] of [[1,1],[2,1],[3,1],[1,2],[3,2],[1,3],[2,3],[3,3]])
        context.fillRect(x * size + dx * cell, y * size + dy * cell, cell, cell);
      context.globalAlpha = 1;
    },
  },
};

const LINE_SCORES = [0, 100, 300, 500, 800];

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeBtn = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const skinSelect = document.getElementById('skin-select');
let currentSkin = SKINS.retro;

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * (PIECES.length - 1)) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  currentSkin.drawBlock(context, x, y, colorIndex, size, alpha);
}

// Círculo decorativo en el hueco de la tuerca (sólo mientras la pieza se mueve)
function drawNutHole(context, x, y, size, alpha) {
  currentSkin.drawNutHole(context, x, y, size, alpha);
}

// Fondo propio de la skin (si no tiene, se ve el fondo CSS del tema)
function drawBackground(context, cw, ch) {
  context.clearRect(0, 0, cw, ch);
  if (currentSkin.background) {
    context.fillStyle = currentSkin.background;
    context.fillRect(0, 0, cw, ch);
  }
}

function drawGrid() {
  ctx.strokeStyle = currentSkin.grid || getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  drawBackground(ctx, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);
  if (current.type === 8) drawNutHole(ctx, current.x + 1, gy + 1, BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
  if (current.type === 8) drawNutHole(ctx, current.x + 1, current.y + 1, BLOCK);
}

function drawNext() {
  const NB = 30;
  drawBackground(nextCtx, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
  if (next.type === 8) drawNutHole(nextCtx, offX + 1, offY + 1, NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'PAUSA';
    overlayScore.textContent = '';
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isLight = theme === 'light';
  themeBtn.setAttribute('aria-pressed', String(isLight));
  themeLabel.textContent = isLight ? 'Modo claro' : 'Modo oscuro';
}

themeBtn.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(theme);
  try { localStorage.setItem('theme', theme); } catch (e) { /* almacenamiento no disponible */ }
  themeBtn.blur(); // evita que Space/flechas activen el botón
  // el loop está detenido en pausa y game over, así que se repinta a mano
  draw();
  drawNext();
});

let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (e) { /* ignorar */ }
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

function applySkin(name) {
  if (!SKINS[name]) name = 'retro';
  currentSkin = SKINS[name];
  COLORS = currentSkin.colors;
  skinSelect.value = name;
}

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  try { localStorage.setItem('skin', skinSelect.value); } catch (e) { /* almacenamiento no disponible */ }
  skinSelect.blur(); // evita que Space/flechas manipulen el select
  // el loop está detenido en pausa y game over, así que se repinta a mano
  draw();
  drawNext();
});

let savedSkin = null;
try { savedSkin = localStorage.getItem('skin'); } catch (e) { /* ignorar */ }
applySkin(savedSkin);

init();
