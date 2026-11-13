# Puzzledex
A collection of small, JavaScript-based puzzle games that run in the browser.

## Games
 • **Connections** - sort 16 words into 4 hidden categories.\
 • **Shikaku** - divide a grid into rectangles.\
 • **Criss-Crossword** - unscramble a 3x3 word square.\
 • **Wordle** - guess the five-letter word.

## Running Locally
The games load their word lists with `fetch`, so open them through a local web server rather than directly from disk:

```
python -m http.server
```

Then visit `http://localhost:8000`.

## How to Play

### Connections
Select four words that share a category and press **Submit**. Found categories are colored and locked in. Use **Reshuffle** to rearrange the remaining words and **New Puzzle** for a fresh board.

### Shikaku
Divide the grid into rectangles so that each rectangle contains exactly one number, equal to its area. Drag to draw a rectangle; click one (or right-click) to remove it. Choose a grid size from 5x5 up to 20x20.

### Criss-Crossword
Word squares are 3x3 squares made of 9 letters, making 6 words: *3 vertical & 3 horizontal.* Use the arrows outside of the word square to unscramble the scrambled word squares.\
This project uses 450+ words allowing for over 30,000 possible word squares!

#### Colors & Their Meanings:
 • White is an invalid word.\
 • Red indicates a valid word that is NOT in the square.\
 • Yellow means a word is valid and in the square, but in the wrong spot.\
 • Green is in the correct spot.\
 • If two colors overlap, the most correct color will take priority.

#### Difficulties:
 • Easy Mode - shows the solution along side scrambled puzzle.\
 • Normal Mode - no solution; all colors are used.\
 • Hard Mode - all colors except green are removed.

### Wordle
Guess the five-letter word in six tries, typing on your keyboard or the on-screen one. Green means the right letter in the right spot, yellow means the letter is in the word elsewhere, and gray means it is not in the word.

## Project Structure
 • `index.html` - game picker.\
 • `pages/` - one HTML page per game.\
 • `css/` - `global.css` holds the shared layout and button styles; each game has its own stylesheet.\
 • `js/` - game logic.\
 • `wordlists/` - JSON word and category data.

## Credits
Word List: ​https://github.com/skedwards88/word_lists/blob/main/compiled/commonWordsLen3.json \
Criss-Crossword inspiration & data structure: https://youtu.be/zWIsnrxL-Zc?si=AcHcsdEU1JvXeZkm
