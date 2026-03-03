let wordList = [];
let wordSquares = [];

async function fetchJSONData() {
  try {
    const response = await fetch('./three-letter-words.json');

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
    this.children = {}; //Maps letter -> TrieNode
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
      let validWS = true;

      for (let col = 0; col < 3; col++) {
        let prefix = '';
        for (let r = 0; r <= row; r++) {
          prefix += board[r][col];
        }
        if (!trie.startsWith(prefix)) {
          validWS = false;
          break;
        }
      }

      if (validWS) {
        backtrack(row + 1);
      }
    }
  }
  backtrack(0); //Start backtracking from the first row
}

//Function to generate a random word square and display it
document.getElementById('generateButton').addEventListener('click', () => {
  console.log("Possible word squares:", wordSquares.length);
  const outputspan = document.getElementById('output');
  const randomIndex = Math.floor(Math.random() * wordSquares.length);
  const randomSquare = wordSquares[randomIndex][0].split('').join(' ') + '\n' +
                       wordSquares[randomIndex][1].split('').join(' ') + '\n' +
                       wordSquares[randomIndex][2].split('').join(' ');
  outputspan.innerHTML = randomSquare.replace(/\n/g, '<br>');
  console.log(randomSquare);
});