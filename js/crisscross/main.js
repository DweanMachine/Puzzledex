let wordList = [];
let wordSquares = [];

async function fetchJSONData() {
  try {
    const response = await fetch('../wordlists/three-letter-words.json');

    // Check if the request was successful
    if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

    //Parse the response body as JSON
    wordList = await response.json(); 

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

//Call worker then call function
const worker = new Worker('../js/crisscross/worker2.js');
fetchJSONData().then(() => worker.postMessage(wordList));;

let workerReady = false;
worker.onmessage = ({ data: squares }) => {
  wordSquares = squares; 
  workerReady = true;
};

const outputspan = document.getElementById('output');

const cells = document.querySelectorAll('.cell');
var currentSquare = [];

//Function to generate a random word square and display it
document.getElementById('generateButton').addEventListener('click', () => {
  if (!workerReady) {
    console.warn("Still computing, please wait.");
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * wordSquares.length);

  currentSquare = wordSquares[randomIndex];
  currentSquare = currentSquare.map(line => line.replace(/\s/g, '').split('')); //Remove spaces 
  
  solutionWords = pullWords(currentSquare);
  console.log("Solution:", solutionWords);

  currentSquare = shuffleWordSquare(currentSquare); //Shuffle the word square to create a new configuration

  cells.forEach((cell, index) => {
    const cellRow = Math.floor(index / 3); //Calculate the row index for the current cell
    const cellCol = index % 3; //Calculate the column index for the current cell
    cell.innerText = currentSquare[cellRow][cellCol];
  });
  determineColor(currentSquare); //Determine the colors of the cells based on the current configuration
});


const shifts = document.querySelectorAll('.shift');
shifts.forEach(button => {
  button.addEventListener('click', () => {
    const cellInfo = button.id.split('-'); //Extract the column index from the button ID 
    
    const indexVal = parseInt(cellInfo[0]);
    const direction = cellInfo[1];

    if (direction === 'up') {
      const temp = currentSquare[0][indexVal];
      currentSquare[0][indexVal] = currentSquare[1][indexVal];
      currentSquare[1][indexVal] = currentSquare[2][indexVal];
      currentSquare[2][indexVal] = temp;

    } else if (direction === 'down') {
      const temp = currentSquare[2][indexVal];
      currentSquare[2][indexVal] = currentSquare[1][indexVal];
      currentSquare[1][indexVal] = currentSquare[0][indexVal];
      currentSquare[0][indexVal] = temp;
    } else if (direction === 'left') {
      const temp = currentSquare[indexVal][0];
      currentSquare[indexVal][0] = currentSquare[indexVal][1];
      currentSquare[indexVal][1] = currentSquare[indexVal][2];
      currentSquare[indexVal][2] = temp;
    } else if (direction === 'right') {
      const temp = currentSquare[indexVal][2];
      currentSquare[indexVal][2] = currentSquare[indexVal][1];
      currentSquare[indexVal][1] = currentSquare[indexVal][0];
      currentSquare[indexVal][0] = temp;
    } else {
      console.error("Invalid direction:", direction);
      return;
    }
    cells.forEach((cell, index) => {
        const cellRow = Math.floor(index / 3);
        const cellCol = index % 3;
        cell.innerText = currentSquare[cellRow][cellCol];
    });
    determineColor(currentSquare);
  });
});

//Align arrows
const shiftButtons = document.querySelectorAll('.shift');

function shuffleWordSquare(square) {
  const shuffledSquare = JSON.parse(JSON.stringify(square)); //Deep copy of the square
  const shuffleCount = Math.floor(Math.random() * 5) + 10; //Random number of shuffles between 10 and 15

  for (let i = 0; i < shuffleCount; i++) {
    const index = Math.floor(Math.random() * 3); //Randomly select a row or column index

    if (Math.random() < 0.5) { //if < 0.5, shuffle a row; if >= 0.5, shuffle a column
      //Shuffle row
      const temp = shuffledSquare[index][0];
      shuffledSquare[index][0] = shuffledSquare[index][1];
      shuffledSquare[index][1] = shuffledSquare[index][2];
      shuffledSquare[index][2] = temp;
    } else {
      //Shuffle column
      const temp = shuffledSquare[0][index];
      shuffledSquare[0][index] = shuffledSquare[1][index];
      shuffledSquare[1][index] = shuffledSquare[2][index];
      shuffledSquare[2][index] = temp;
    }
  }
  return shuffledSquare;
}

function determineColor(square) {
  const {rowWords, colWords} = pullWords(square);
  const {rowWords: solutionRows, colWords: solutionCols} = solutionWords;
  const allSolution = [...solutionRows, ...solutionCols];

  clearColors();

  [...rowWords, ...colWords].forEach((word, i) => {
    const isRow = i < 3;
    const idx = i % 3;
    const color = word === (isRow ? solutionRows[idx] : solutionCols[idx])
      ? '#93c47d'
      : allSolution.includes(word) ? '#ffd966'
      : wordList.includes(word) ? '#e06666'
      : null;

    if (color) assignColors(idx, isRow, color);
  });
}

function assignColors(index, isRow, color) {
  for (let j = 0; j < 3; j++) {
    const cellRow = isRow ? index : j;
    const cellCol = isRow ? j : index;
    const cellIndex = cellRow * 3 + cellCol; // also fixes bug #3
    
    const cell = cells[cellIndex];
    if (cell.style.backgroundColor === '#93c47d') continue;
    if (color === '#93c47d') {
      cell.style.backgroundColor = color;
    } else if (color === '#ffd966' && cell.style.backgroundColor !== '#93c47d') {
      cell.style.backgroundColor = color;
    } else if (color === '#e06666' && cell.style.backgroundColor === 'white') {
      cell.style.backgroundColor = color;
    }
  }
}

function clearColors() {
  cells.forEach(cell => {
    cell.style.backgroundColor = 'white';
  });
}

function pullWords(square) {
  const rowWords = [];
  const colWords = [];

  for (let i = 0; i < 3; i++) {
    rowWords.push(square[i].join(''));

    let colWord = '';
    for (let row = 0; row < 3; row++) {
      colWord += square[row][i];
    }
    colWords.push(colWord);
  }

  return { rowWords, colWords };
}