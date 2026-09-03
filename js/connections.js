const gridContainer = document.getElementById('gridContainer');
let categories = [];

async function fetchJSONData() {
  try {
    const response = await fetch('../wordlists/connection-categories.json');

    // Check if the request was successful
    if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

    //Parse the response body as JSON
    categories = await response.json(); 
    console.log("Categories:", categories.length);

  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

let selectedCategories = new Set();

fetchJSONData().then(() => {
  //Choose 4 random unique categories from the list of categories
  let randomIndex = null;
  let wordGroup = null;
  let difficulty = null;
  for (let i = 0; i < 4; i++) {
    randomIndex = Math.floor(Math.random() * categories.length);
    wordGroup = selectedCategories.has(categories[randomIndex]) ? null : categories[randomIndex];
    // Check if the difficulty of the selected category is already in the set
    difficulty = Array.from(selectedCategories).some(cat => cat.difficulty === categories[randomIndex].difficulty) ? null : categories[randomIndex].difficulty;
    
    if (wordGroup && difficulty) {
      selectedCategories.add(wordGroup);
    } else {
      if (!wordGroup) {
        console.log(`Duplicate category found: ${categories[randomIndex].category}. Selecting a new category.`);
      } else if (!difficulty) {
        console.log(`Duplicate difficulty found: ${categories[randomIndex].difficulty}. Selecting a new category.`);
      }
      i--;
      continue;
    }
  }
  console.log("Selected Categories:", Array.from(selectedCategories).map(cat => cat.category), "with difficulties:", Array.from(selectedCategories).map(cat => cat.difficulty));
  assignWords(); // Call the function to assign words to the grid after fetching data
});


//Generate game board
for (let i = 0; i < 4; i++) {
  const row = document.createElement('div');
  row.classList.add('row');
  for (let j = 0; j < 4; j++) {
    const button = document.createElement('button');
    button.dataset.row = i;
    button.dataset.col = j;
    button.classList.add('gameButton');
    button.addEventListener('click', () => {
      if (!button.classList.contains('found')) {
        button.classList.toggle('selected');
      } 
    });
    button.textContent = '';
    row.appendChild(button);
  }
  gridContainer.appendChild(row);
}

function assignWords() {
  //fill the grid with words from the selected categories
  for (let i = 0; i < 4; i++) {
    //const randomIndex = Math.floor(Math.random() * selectedCategories.size);
    const wordGroup = Array.from(selectedCategories)[i];
    const words = wordGroup.words;
    //Shuffle the words array to randomize the order
    for (let j = words.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [words[j], words[k]] = [words[k], words[j]];      
    }
    for (let j = 0; j < 4; j++) {
      let button = null;
      
      let randomRow = Math.floor(Math.random() * 4);
      let randomCol = Math.floor(Math.random() * 4);      
      button = gridContainer.querySelector(`[data-row="${randomRow}"][data-col="${randomCol}"]`);
      
      if (button.textContent === '') {
        button.textContent = words[j].toUpperCase();
      } else {
        //If the button is already filled, find another empty button
        j--;
        continue;
      }
    }
  }
}

function checkConnections() {
  let categoryFound = false;
  const selectedButtons = Array.from(document.querySelectorAll('.gameButton.selected'));
  if (selectedButtons.length === 0) { return 100;} 
  else if (selectedButtons.length > 4) { return 200; }
  else if (selectedButtons.length < 4) { return 300; }
  const selectedWords = selectedButtons.map(button => button.textContent);
  console.log("Selected Words:", selectedWords);
  
  Array.from(selectedCategories).forEach(category => {
    const categoryWords = category.words.map(word => word.toUpperCase());
    const isCategoryComplete = categoryWords.every(word => selectedWords.includes(word));
    if (isCategoryComplete) {
      for (const button of selectedButtons) {
        button.classList.add('found');
        button.classList.remove('selected');
        button.style.setProperty('--found-color', assignColor(category));
      }
      categoryFound = category;
    }
  });
  if (!categoryFound) {
  }
  return categoryFound;
}

function assignColor(category) {
  let color = category.difficulty;
  let colorCode = null;
  if (color === "Green") {
    colorCode = 'hsl(130, 45%, 63%)';
  } else if (color === "Yellow") {
    colorCode = 'hsl(55, 45%, 63%)';
  } else if (color === "Blue") {
    colorCode = 'hsl(190, 45%, 63%)';
  } else if (color === "Purple") {
    colorCode = 'hsl(280, 45%, 63%)';
  }
  return colorCode;
}

function displayResults() {
  let category = checkConnections();
  document.getElementById('splashScreen').style.display = 'block';
  const headline = document.getElementById('splashHeadline');
  const info = document.getElementById('categoryInfo');
  if (category && typeof(category) !== 'number') {
    headline.textContent = `Category Found!`
    info.textContent = `Category: ${category.category} | Difficulty: ${category.difficulty}`;
  } else {
  if (category === 100) {
    headline.textContent = `No words selected!`
    info.textContent = `Please select 4 words before pressing SUBMIT!`
  } else if (category === 200) {
    headline.textContent = `More than 4 words selected!`
    info.textContent = `Please do not select more than 4 words!`
  } else if (category === 300) {
    headline.textContent = `Less than 4 words selected!`
    info.textContent = `Please select 4 words!`
  } else {
    headline.textContent = `No Category Found!`
    info.textContent = `Keep trying!`;
  }
  }
}

function closeSplashScreen() {
  document.getElementById('splashScreen').style.display = 'none';
}

function reshuffle() {
  //Clear the grid
  let buttons = gridContainer.querySelectorAll('.gameButton');
  let found = [];
  let selected = [];
  let colorMap = new Map;
  buttons.forEach(button => {
    if (button.classList.contains('found')) {
      found.push(button.textContent);
      colorMap.set(button.textContent, button.style.getPropertyValue('--found-color'));
    }
    if (button.classList.contains('selected')) {
      selected.push(button.textContent);
    }
    button.textContent = '';
    button.classList.remove('selected', 'found');
  });
  
  //Reassign words to the grid
  assignWords();
  for (const button of buttons) {
    if (found.includes(button.textContent)) {
      button.classList.add('found');
      if (colorMap.has(button.textContent)) {
        button.style.setProperty('--found-color', colorMap.get(button.textContent));
      }
    }
    if (selected.includes(button.textContent)) {
      button.classList.add('selected');
    }
  }
}