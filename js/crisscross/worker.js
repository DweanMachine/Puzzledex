// Finds all 3x3 word squares (3 rows + 3 columns, all valid and all distinct) from a word list.
function findWordSquares(wordList) {
  const size = 3;
  const wordSet = new Set(wordList);

  // Every prefix of every word (including the empty prefix), used to prune partial columns.
  const prefixes = new Set();
  for (const word of wordList) {
    for (let i = 0; i <= word.length; i++) prefixes.add(word.slice(0, i));
  }

  const results = [];
  const board = [];

  function fits(word) {
    // Each column built so far, plus this word's letter, must still be a prefix of some word.
    for (let col = 0; col < size; col++) {
      const column = board.map(w => w[col]).join('') + word[col];
      if (!prefixes.has(column)) return false;
    }
    return true;
  }

  function backtrack() {
    if (board.length === size) {
      const colWords = [];
      for (let col = 0; col < size; col++) {
        const colWord = board.map(w => w[col]).join('');
        if (!wordSet.has(colWord)) return;
        colWords.push(colWord);
      }
      const all = [...board, ...colWords];
      if (new Set(all).size === all.length) results.push([...board]);
      return;
    }
    for (const word of wordList) {
      if (!fits(word)) continue;
      board.push(word);
      backtrack();
      board.pop();
    }
  }

  backtrack();
  return results;
}

self.onmessage = ({ data: wordList }) => {
  self.postMessage(findWordSquares(wordList));
};
