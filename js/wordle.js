const gridContainer = document.getElementById("gridContainer");
let guessCount = 0;
let words = [];


async function fetchJSONData() {
  try {
    const response = await fetch('../wordlists/five-letter-words.json');

    // Check if the request was successful
    if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

    //Parse the response body as JSON
    words = await response.json(); 
    console.log("# of Words:", words.length);

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}


for (let i = 0; i < 6; i++) {
  const row = document.createElement('div');
  row.classList.add('row');
  for (let j = 0; j < 5; j++) {
    const letter = document.createElement('button');
    letter.dataset.row = i;
    letter.dataset.col = j;
    letter.classList.add('letter');
    letter.textContent = ' ';
    row.appendChild(letter);
  }
  gridContainer.appendChild(row);
}

fetchJSONData().then(() => {
  let randomIndex = Math.floor(Math.random() * words.length);
  let chosenWord = words[randomIndex];
  console.log(chosenWord);
});

function fillWordBoard() {

}