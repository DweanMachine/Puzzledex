let wordList = [];
let wordSquares = [];

async function fetchJSONData() {
  try {
    const response = await fetch('../wordlists/three-letter-words.json');

    // Check if the request was successful
    if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

    //Parse the response body as JSON
    wordList = await response.json(); 
    createWordSquare();

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

//Call the function
fetchJSONData();

class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return true;
  }
}

function createWordSquare() {
  const trie = new Trie();
  for (let word of wordList) {
    trie.insert(word);
  }

  const board = Array(3).fill().map(() => Array(3).fill(''));

  function backtrack(row) { 
    if (row === 3) {
      wordSquares.push(board.map(r => r.join('')));
      return;
    }

    for (let word of wordList) {
      board[row] = word.split('');
      let validWordSquare = true;

      for (let col = 0; col < 3; col++) {
        let prefix = '';
        for (let r = 0; r <= row; r++) {
          prefix += board[r][col];
        }
        if (!trie.startsWith(prefix)) {
          validWordSquare = false;
          break;
        }
      }

      if (validWordSquare) {
        backtrack(row + 1);
      }
    }
  }
  backtrack(0); //Start backtracking from the first row
}

const outputspan = document.getElementById('output');

const cells = document.querySelectorAll('.cell');
var currentSquare = [];

//Function to generate a random word square and display it
document.getElementById('generateButton').addEventListener('click', () => {
  console.log("Possible word squares:", wordSquares.length);
  const randomIndex = Math.floor(Math.random() * wordSquares.length);
  
  currentSquare = wordSquares[randomIndex];
  currentSquare = currentSquare.map(line => line.replace(/\s/g, '').split('')); //Remove spaces and 
  
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
  const words = pullWords(square);
  console.log("Current words:", words, words.length);
  clearColors(); //Reset colors before determining new colors
  for (let i = 0; i < words.length; i++) {
    if (solutionWords[i] === words[i]) {
      assignColors(i, '#93c47d'); //Green for correct words in the correct position
    } else if (solutionWords.includes(words[i])) {
      assignColors(i, '#ffd966'); //Yellow for correct words in the wrong position
    } else if (wordList.includes(words[i])) {
      assignColors(i, '#e06666'); //Red for valid words not present in the puzzle
    }
  };
}

function assignColors(index, color) {
  for (let j = 0; j < 3; j++) {    
    if (index % 2 === 1) {
      var cellCol = j; 
      var cellRow = Math.floor(index / 2); 
    } else {
      var cellCol = Math.floor(index / 2); 
      var cellRow = j;
    }
    
    const cellIndex = cellRow * 3 + cellCol; //Calculate the cell index based on row & column

    //Color priority Green > Yellow > Red. A cell will only change color if the new color has higher priority than the current color.
    if (cells[cellIndex].style.backgroundColor === '#93c47d') {
      continue; //Skip if the cell is already green
    } else if (color === '#ffd966' && cells[cellIndex].style.backgroundColor !== '#93c47d') {
      cells[cellIndex].style.backgroundColor = color; //Assign yellow if not already green
    } else if (color === '#e06666' && cells[cellIndex].style.backgroundColor === 'white') {
      cells[cellIndex].style.backgroundColor = color; //Assign red if not already green or yellow
    } else if (color === '#93c47d') {
      cells[cellIndex].style.backgroundColor = color; //Assign green regardless of current color
    }
  }
}

function clearColors() {
  cells.forEach(cell => {
    cell.style.backgroundColor = 'white';
  });
}

function pullWords(square) {
  var words = []; 
  //Combine each column or row into a word
  for (let col = 0; col < 3; col++) {
    let columnWord = '', rowWord = '';
    for (let row = 0; row < 3; row++) {
      columnWord += square[row][col];
      rowWord += square[col][row];
    }
    words.push(columnWord);
    words.push(rowWord);
  }
  return words;
}