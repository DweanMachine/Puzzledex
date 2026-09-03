const gameBoard = document.getElementById('gameBoard');
const colors = {
  "red"     : "hsl(0, 80%, 60%)", 
  "orange"  : "hsl(30, 100%, 60%)",
  "yellow"  : "hsl(45, 75%, 60%)",
  "lime"    : "hsl(75, 100%, 40%)",
  "green"   : "hsl(140, 100%, 30%)",
  "cyan"    : "hsl(180, 100%, 30%)",
  "indigo"  : "hsl(230, 100%, 60%)",
  "purple"  : "hsl(270, 100%, 60%)",
  "pink"    : "hsl(290, 100%, 60%)",
  "magenta" : "hsl(335, 100%, 76%)"
}
const colorValues = Object.values(colors); //Colors as an array

let gridSize = 0;
let startButton = null;   // The button where the drag began
let isDragging = false;
let colorCount = 0;
let lastHoveredButton = null;
let previewButtons = [];  // Buttons currently highlighted in preview

function createGrid(size) {
  colorCount = 0;
  gridSize = size;
  gameBoard.innerHTML = null;
  for (let row = 0; row < size; row++) {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row');
    gameBoard.append(rowElement);
    for (let col = 0; col < size; col++) {
      const button = document.createElement('button');
      button.dataset.row = row;   // Store row/col on each button
      button.dataset.col = col;
      button.textContent = '';

      button.addEventListener('mousedown', onMouseDown);
      button.addEventListener('mouseover', onMouseOver);

      rowElement.append(button);
    }
  }
}

document.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  onMouseUp(e);
  isDragging = false;
});

// Helper: get a button by row/col
function getButton(row, col) {
  return gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// Helper: get all buttons within a rectangular region
function getButtonsInRect(row1, col1, row2, col2) {
  const minRow = Math.min(row1, row2), maxRow = Math.max(row1, row2);
  const minCol = Math.min(col1, col2), maxCol = Math.max(col1, col2);
  const buttons = [];
  for (let row = minRow; row <= maxRow; row++)
    for (let col = minCol; col <= maxCol; col++)
      buttons.push(getButton(row, col));
  return buttons;
}

function onMouseDown(event) {
  isDragging = true;
  startButton = event.currentTarget;
  previewRect(startButton); // Highlight just the one cell
}

function onMouseOver(e) {
  if (!isDragging) return;
  lastHoveredButton = e.currentTarget;
  previewRect(e.currentTarget);
}

function onMouseUp(event) {
  // Use the actual button target, or fall back to the last hovered button
  const endButton = event.target.dataset?.row !== undefined
    ? event.target
    : lastHoveredButton;

  if (!endButton) return; // Safety check in case drag never moved
  commitRect(endButton);
  startButton = null;
  previewButtons = [];
  lastHoveredButton = null;
}

function previewRect(endButton) {
  // Clear previous preview by restoring each button's saved original color
  previewButtons.forEach(button => {
    if (!button.dataset.committed) {
      button.style.backgroundColor = button.dataset.originalColor || '';
      //delete button.dataset.originalColor;
    }
  });

  const row1 =+ startButton.dataset.row, col1 =+ startButton.dataset.col;
  const row2 =+ endButton.dataset.row,   col2 =+ endButton.dataset.col;
  previewButtons = getButtonsInRect(row1, col1, row2, col2);

  // Show a translucent preview
  let previewColor = colorValues[colorCount % colorValues.length];
  previewColor = previewColor.replace(')', ', 0.65)');
  previewButtons.forEach(button => {
      button.dataset.originalColor = button.style.backgroundColor || ''; //Save before overwriting
      console.log(button.style.backgroundColor, button.dataset.originalColor );
      button.style.backgroundColor = previewColor;
  });
}

function commitRect(endButton) {
  const row1 = +startButton.dataset.row, col1 = +startButton.dataset.col;
  const row2 = +endButton.dataset.row,   col2 = +endButton.dataset.col;
  console.log(col2, row2);

  // Pick the next color
  const color = colorValues[colorCount % colorValues.length];
  colorCount++;

  const buttons = getButtonsInRect(row1, col1, row2, col2);
  buttons.forEach(b => {
    b.style.backgroundColor = color;
    b.dataset.committed = 'true'; 
    delete b.dataset.originalColor;
    delete b.dataset.previewActive;
  });

}

function clearGrid() {
  const buttons = gameBoard.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.backgroundColor = '';
    delete button.dataset.committed;
    delete button.dataset.originalColor;
  });
}

createGrid(5);