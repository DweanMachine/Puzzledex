const gameBoard = document.getElementById('gameBoard');
const statusEl = document.getElementById('status');
const sizeSelect = document.getElementById('sizeSelect');

const COLORS = [
  'hsl(0, 80%, 70%)', 'hsl(30, 100%, 70%)', 'hsl(50, 85%, 65%)', 'hsl(80, 70%, 60%)',
  'hsl(140, 60%, 60%)', 'hsl(180, 60%, 60%)', 'hsl(220, 90%, 75%)', 'hsl(270, 90%, 75%)',
  'hsl(300, 80%, 75%)', 'hsl(335, 100%, 80%)'
];

let size = 0;
let clues = [];        // clues[row][col] = number, or 0 when the cell has no clue
let rects = [];        // player rectangles: { r1, c1, r2, c2, color }
let cells = [];        // cells[row][col] = DOM element
let colorCount = 0;
let dragStart = null;  // { row, col } where the drag began
let dragEnd = null;
let solved = false;

// ---------- Puzzle generation ----------
// Recursively split the grid into rectangles, then put one clue (the area) in each.
function generatePuzzle(n) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  const maxArea = Math.max(4, Math.round(n * n / 5));

  function split(r1, c1, r2, c2) {
    const h = r2 - r1 + 1, w = c2 - c1 + 1, area = h * w;
    const stop = area <= 3 || (area <= maxArea && Math.random() < 0.3);
    if (stop) {
      const r = r1 + Math.floor(Math.random() * h);
      const c = c1 + Math.floor(Math.random() * w);
      grid[r][c] = area;
      return;
    }
    const splitRows = h > w || (h === w && Math.random() < 0.5);
    if (splitRows) {
      const cut = r1 + 1 + Math.floor(Math.random() * (h - 1)); // first row of the second half
      split(r1, c1, cut - 1, c2);
      split(cut, c1, r2, c2);
    } else {
      const cut = c1 + 1 + Math.floor(Math.random() * (w - 1));
      split(r1, c1, r2, cut - 1);
      split(r1, cut, r2, c2);
    }
  }
  split(0, 0, n - 1, n - 1);
  return grid;
}

// ---------- Board ----------
function newPuzzle() {
  size = parseInt(sizeSelect.value, 10);
  clues = generatePuzzle(size);
  buildBoard();
}

function buildBoard() {
  rects = [];
  colorCount = 0;
  solved = false;
  dragStart = dragEnd = null;
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 41px)`;
  gameBoard.classList.toggle('big', size > 10);
  if (size > 10) {
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 21px)`;
  }
  cells = [];
  for (let row = 0; row < size; row++) {
    cells.push([]);
    for (let col = 0; col < size; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = clues[row][col] || '';
      gameBoard.append(cell);
      cells[row].push(cell);
    }
  }
  render();
}

function clearGrid() {
  rects = [];
  solved = false;
  render();
}

function rectAt(row, col) {
  return rects.find(r => row >= r.r1 && row <= r.r2 && col >= r.c1 && col <= r.c2);
}

function render() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const rect = rectAt(row, col);
      cells[row][col].style.backgroundColor = rect ? rect.color : '';
      cells[row][col].classList.remove('preview');
    }
  }
  if (dragStart && dragEnd) {
    const box = normalize(dragStart.row, dragStart.col, dragEnd.row, dragEnd.col);
    for (let row = box.r1; row <= box.r2; row++)
      for (let col = box.c1; col <= box.c2; col++)
        cells[row][col].classList.add('preview');
  }
  solved = checkSolved();
  statusEl.textContent = solved ? 'Solved! Nice work.' : '';
}

function normalize(row1, col1, row2, col2) {
  return {
    r1: Math.min(row1, row2), c1: Math.min(col1, col2),
    r2: Math.max(row1, row2), c2: Math.max(col1, col2)
  };
}

// Solved when the rectangles tile the grid and each holds exactly one clue equal to its area.
function checkSolved() {
  let covered = 0;
  for (const r of rects) {
    const area = (r.r2 - r.r1 + 1) * (r.c2 - r.c1 + 1);
    let clueCount = 0, clueValue = 0;
    for (let row = r.r1; row <= r.r2; row++)
      for (let col = r.c1; col <= r.c2; col++)
        if (clues[row][col]) { clueCount++; clueValue = clues[row][col]; }
    if (clueCount !== 1 || clueValue !== area) return false;
    covered += area;
  }
  return covered === size * size; // rectangles never overlap, so this means full coverage
}

// ---------- Input ----------
function cellFromEvent(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el.dataset.row === undefined) return null;
  return { row: +el.dataset.row, col: +el.dataset.col };
}

gameBoard.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  const pos = cellFromEvent(e);
  if (!pos) return;
  dragStart = dragEnd = pos;
  render();
});

gameBoard.addEventListener('pointermove', (e) => {
  if (!dragStart) return;
  const pos = cellFromEvent(e);
  if (!pos || (pos.row === dragEnd.row && pos.col === dragEnd.col)) return;
  dragEnd = pos;
  render();
});

document.addEventListener('pointerup', (e) => {
  if (!dragStart) return;
  const end = cellFromEvent(e) || dragEnd;
  commitRect(dragStart, end);
  dragStart = dragEnd = null;
  render();
});

document.addEventListener('pointercancel', () => {
  dragStart = dragEnd = null;
  render();
});

gameBoard.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const pos = cellFromEvent(e);
  if (!pos) return;
  rects = rects.filter(r => r !== rectAt(pos.row, pos.col));
  render();
});

function commitRect(start, end) {
  const box = normalize(start.row, start.col, end.row, end.col);
  const isClick = start.row === end.row && start.col === end.col;

  // A plain click on an existing rectangle removes it.
  if (isClick) {
    const existing = rectAt(start.row, start.col);
    if (existing) {
      rects = rects.filter(r => r !== existing);
      return;
    }
  }

  // A new rectangle replaces any rectangle it overlaps.
  rects = rects.filter(r =>
    r.r2 < box.r1 || r.r1 > box.r2 || r.c2 < box.c1 || r.c1 > box.c2);
  rects.push({ ...box, color: COLORS[colorCount++ % COLORS.length] });
}

document.getElementById('newButton').addEventListener('click', newPuzzle);
document.getElementById('clearButton').addEventListener('click', clearGrid);
sizeSelect.addEventListener('change', newPuzzle);

newPuzzle();
