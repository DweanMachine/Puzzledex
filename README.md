# Puzzledex
A collection of small JavaScript puzzle games. Run it from a web server (e.g. `python -m http.server`, then open `http://localhost:8000`) or GitHub Pages; opening the files directly with `file://` blocks the word list and worker from loading.

## Shikaku
Divide the grid into rectangles so each one contains exactly one number equal to its area. Drag to draw a rectangle (a new one replaces any it overlaps); click or right-click a rectangle to remove it. Sizes: 5x5, 7x7, 10x10, 20x20.

## Criss-Crossword

## How to Play:
Word squares are 3x3 squares made of 9 letters, making 6 words: *3 vertical & 3 horizontal.* Use the arrows outside of the word square to unscramble the scrambled word squares.\
This project uses 490+ words allowing for over 12,000 possible word squares!

### Colors & Their Meanings:
 • White is an invalid word.\
 • Red indicates a valid word that is NOT in the square.\
 • Yellow means a word is valid and in the square, but in the wrong spot.\
 • Green is in the correct spot.\
 • If two colors overlap, the most correct color will take priority.
 • The puzzle is solved when all six words are valid.

### Credits:
Word List: ​https://github.com/skedwards88/word_lists/blob/main/compiled/commonWordsLen3.json \
Inspiration for this game & data structure: https://youtu.be/zWIsnrxL-Zc?si=AcHcsdEU1JvXeZkm