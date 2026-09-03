//This worker finds all 3x3 word squares from a given list of words.
function buildPrefixMap(wordList) {
  const map = new Map();
  for (const word of wordList) {
    for (let i = 0; i <= word.length; i++) {
      const prefix = word.slice(0, i);
      if (!map.has(prefix)) map.set(prefix, []);
      map.get(prefix).push(word);
    }
  }
  return map;
}

function findWordSquares(wordList) {
  const prefixMap = buildPrefixMap(wordList);
  const wordSet = new Set(wordList);
  const size = 3;
  const results = [];
  const board = [];

  function getCandidates(row) {
    // Build the current prefix for each column given rows placed so far
    const prefixes = Array.from({ length: size }, (_, col) =>
      board.map(w => w[col]).join('')
    );

    // Get candidate sets per column and find the smallest
    const sets = prefixes.map(p => new Set(prefixMap.get(p) ?? []));
    let smallestIdx = 0;
    for (let i = 0; i < size; i++) {
      if (sets[i].size < sets[smallestIdx].size) smallestIdx = i;
    }

    //Start from the smallest set and filter against ALL column constraints
    //A candidate word is valid if:
    // - For each column col, the prefix so far + word[col] exists in the prefix map
    return [...sets[smallestIdx]].filter(word => {
      for (let col = 0; col < size; col++) {
          const nextPrefix = prefixes[col] + word[col];
          if (!prefixMap.has(nextPrefix)) return false;
      }
      return true;
    });
  }

  function backtrack(row) {
    if (row === size) {
      const colWords = [];
      for (let col = 0; col < size; col++) {
        const colWord = board.map(w => w[col]).join('');
        if (!wordSet.has(colWord)) return;
        colWords.push(colWord);
      }

      // Require all 6 words (3 rows + 3 columns) to be fully unique
      const allWords = [...board, ...colWords];
      if (new Set(allWords).size !== allWords.length) return;

      results.push([...board]);
      return;
    }

    const candidates = row === 0 ? wordList : getCandidates(row);

    for (const word of candidates) {
      board.push(word);
      backtrack(row + 1);
      board.pop();
    }
  }

  backtrack(0);
  console.log(`Found ${results.length} word squares`);
  return results;
}

self.onmessage = ({ data: wordList }) => {
  const squares = findWordSquares(wordList);
  self.postMessage(squares);
};