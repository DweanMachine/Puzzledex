const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '+zxcvbnm-']; // + = Enter, - = Backspace

const gridContainer = document.getElementById('gridContainer');
const keyboardEl = document.getElementById('keyboard');
const statusEl = document.getElementById('status');

let words = [];
let wordSet = new Set();
let answer = '';
let currentGuess = '';
let guessCount = 0;
let gameOver = false;
let rows = [];          // rows[i] = array of tile elements
const keyButtons = {};  // letter -> key element

function setStatus(text) { statusEl.textContent = text; }

async function loadWords() {
  try {
    const response = await fetch('../wordlists/five-letter-words.json');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    words = (await response.json()).map(w => w.toLowerCase());
    wordSet = new Set(words);
  } catch (error) {
    console.error('Error fetching JSON:', error);
    setStatus('Could not load the word list. Serve the site over http (not file://).');
    return false;
  }
  return true;
}

function buildBoard() {
  gridContainer.innerHTML = '';
  rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    const tiles = [];
    for (let j = 0; j < WORD_LENGTH; j++) {
      const tile = document.createElement('div');
      tile.className = 'letter';
      row.append(tile);
      tiles.push(tile);
    }
    gridContainer.append(row);
    rows.push(tiles);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = '';
  for (const rowKeys of KEY_ROWS) {
    const row = document.createElement('div');
    row.className = 'key-row';
    for (const ch of rowKeys) {
      const key = document.createElement('button');
      key.className = 'key';
      if (ch === '+') { key.textContent = 'Enter'; key.dataset.key = 'Enter'; key.classList.add('wide'); }
      else if (ch === '-') { key.textContent = '⌫'; key.dataset.key = 'Backspace'; key.classList.add('wide'); }
      else { key.textContent = ch; key.dataset.key = ch; keyButtons[ch] = key; }
      row.append(key);
    }
    keyboardEl.append(row);
  }
}

keyboardEl.addEventListener('click', (e) => {
  const key = e.target.closest('.key');
  if (!key) return;
  key.blur(); // keep Enter on the keyboard from re-pressing the last clicked key
  handleKey(key.dataset.key);
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter' && document.activeElement === document.getElementById('newButton')) return;
  if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
    handleKey(e.key);
  }
});

function handleKey(key) {
  if (gameOver || !words.length) return;
  if (key === 'Enter') submitGuess();
  else if (key === 'Backspace') {
    currentGuess = currentGuess.slice(0, -1);
    renderCurrentRow();
  } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
    currentGuess += key.toLowerCase();
    renderCurrentRow();
  }
}

function renderCurrentRow() {
  setStatus('');
  rows[guessCount].forEach((tile, i) => {
    tile.textContent = currentGuess[i] || '';
    tile.classList.toggle('filled', i < currentGuess.length);
  });
}

// Two passes so repeated letters are scored correctly:
// greens first, then yellows only while unmatched copies of that letter remain in the answer.
function scoreGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill('absent');
  const remaining = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) result[i] = 'correct';
    else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    if (remaining[guess[i]] > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }
  return result;
}

function submitGuess() {
  if (currentGuess.length < WORD_LENGTH) return reject('Not enough letters');
  if (!wordSet.has(currentGuess)) return reject('Not in word list');

  const result = scoreGuess(currentGuess, answer);
  rows[guessCount].forEach((tile, i) => tile.classList.add(result[i]));
  colorKeys(currentGuess, result);

  guessCount++;
  if (currentGuess === answer) {
    gameOver = true;
    setStatus('You got it!');
  } else if (guessCount === MAX_GUESSES) {
    gameOver = true;
    setStatus(`Out of guesses. The word was "${answer.toUpperCase()}".`);
  }
  currentGuess = '';
}

function reject(message) {
  setStatus(message);
  const rowEl = gridContainer.children[guessCount];
  rowEl.classList.remove('shake');
  void rowEl.offsetWidth; // restart the animation
  rowEl.classList.add('shake');
}

// A key keeps its best color: correct > present > absent.
const KEY_RANK = { absent: 1, present: 2, correct: 3 };
function colorKeys(guess, result) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    const key = keyButtons[guess[i]];
    const current = ['correct', 'present', 'absent'].find(c => key.classList.contains(c));
    if (!current || KEY_RANK[result[i]] > KEY_RANK[current]) {
      key.classList.remove('correct', 'present', 'absent');
      key.classList.add(result[i]);
    }
  }
}

function newGame() {
  if (!words.length) return;
  answer = words[Math.floor(Math.random() * words.length)];
  console.log('Answer:', answer);
  currentGuess = '';
  guessCount = 0;
  gameOver = false;
  setStatus('');
  buildBoard();
  buildKeyboard();
}

document.getElementById('newButton').addEventListener('click', (e) => {
  e.currentTarget.blur();
  newGame();
});

loadWords().then(ok => { if (ok) newGame(); });
