const SIZE = 3;
const GREEN = '#93c47d', YELLOW = '#ffd966', RED = '#e06666', WHITE = 'white';
const RANK = { [WHITE]: 0, [RED]: 1, [YELLOW]: 2, [GREEN]: 3 };

let wordList = [];
let wordSet = new Set();
let wordSquares = [];
let workerReady = false;
let currentSquare = [];
let solutionWords = null;

const cells = document.querySelectorAll('.cell');
const generateButton = document.getElementById('generateButton');
const statusEl = document.getElementById('status');

function setStatus(text) { statusEl.textContent = text; }

async function init() {
  generateButton.disabled = true;
  setStatus('Loading word list...');
  try {
    const response = await fetch('../wordlists/three-letter-words.json');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    wordList = await response.json();
    wordSet = new Set(wordList);
  } catch (error) {
    console.error('Error fetching JSON:', error);
    setStatus('Could not load the word list. Serve the site over http (not file://).');
    return;
  }

  setStatus('Building word squares...');
  const worker = new Worker('../js/crisscross/worker.js');
  worker.onmessage = ({ data: squares }) => {
    wordSquares = squares;
    workerReady = true;
    generateButton.disabled = false;
    newPuzzle();
  };
  worker.onerror = (e) => {
    console.error(e);
    setStatus('Could not build word squares. Serve the site over http (not file://).');
  };
  worker.postMessage(wordList);
}

function newPuzzle() {
  if (!workerReady) return;
  const picked = wordSquares[Math.floor(Math.random() * wordSquares.length)];
  const solution = picked.map(word => word.split(''));
  solutionWords = pullWords(solution);
  console.log('Solution:', solutionWords);

  // Reshuffle until the puzzle doesn't start out already solved.
  do {
    currentSquare = shuffleWordSquare(solution);
  } while (currentSquare.every((row, r) => row.every((ch, c) => ch === solution[r][c])));

  render();
}

generateButton.addEventListener('click', newPuzzle);

function render() {
  cells.forEach((cell, index) => {
    cell.textContent = currentSquare[Math.floor(index / SIZE)][index % SIZE];
  });
  const solved = updateColors();
  setStatus(solved ? 'Solved! Every row and column is a word.' : '');
}

// Rotate a row or column by one step.
function shift(square, index, direction) {
  const line = [];
  for (let i = 0; i < SIZE; i++) {
    line.push(direction === 'left' || direction === 'right' ? square[index][i] : square[i][index]);
  }
  if (direction === 'left' || direction === 'up') line.push(line.shift());
  else line.unshift(line.pop());
  for (let i = 0; i < SIZE; i++) {
    if (direction === 'left' || direction === 'right') square[index][i] = line[i];
    else square[i][index] = line[i];
  }
}

document.querySelectorAll('.shift').forEach(button => {
  button.addEventListener('click', () => {
    if (!currentSquare.length) return;
    const [index, direction] = button.id.split('-');
    shift(currentSquare, parseInt(index, 10), direction);
    render();
  });
});

function shuffleWordSquare(square) {
  const shuffled = square.map(row => [...row]);
  const count = Math.floor(Math.random() * 5) + 10;
  const directions = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < count; i++) {
    shift(shuffled, Math.floor(Math.random() * SIZE), directions[Math.floor(Math.random() * 4)]);
  }
  return shuffled;
}

// Colors each cell by the best result among the words passing through it.
// Returns true when all six words are valid words (any valid arrangement counts as solved).
function updateColors() {
  const { rowWords, colWords } = pullWords(currentSquare);
  const allSolution = [...solutionWords.rowWords, ...solutionWords.colWords];
  const rank = Array(SIZE * SIZE).fill(WHITE);

  const apply = (word, isRow, i) => {
    const solutionWord = isRow ? solutionWords.rowWords[i] : solutionWords.colWords[i];
    const color = word === solutionWord ? GREEN
      : allSolution.includes(word) ? YELLOW
      : wordSet.has(word) ? RED
      : WHITE;
    for (let j = 0; j < SIZE; j++) {
      const cellIndex = isRow ? i * SIZE + j : j * SIZE + i;
      if (RANK[color] > RANK[rank[cellIndex]]) rank[cellIndex] = color;
    }
  };
  rowWords.forEach((w, i) => apply(w, true, i));
  colWords.forEach((w, i) => apply(w, false, i));

  cells.forEach((cell, i) => { cell.style.backgroundColor = rank[i]; });
  return [...rowWords, ...colWords].every(w => wordSet.has(w));
}

function pullWords(square) {
  const rowWords = [];
  const colWords = [];
  for (let i = 0; i < SIZE; i++) {
    rowWords.push(square[i].join(''));
    colWords.push(square.map(row => row[i]).join(''));
  }
  return { rowWords, colWords };
}

init();
