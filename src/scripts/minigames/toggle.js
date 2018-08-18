import { importStylesheet } from '../utils';

window.addEventListener('load', async function () {
  var element = document.getElementById('minigame-toggle');

  if (element) {
    await importStylesheet("/css/standalone/minigames.css");

    new ToggleGame(element);
  }
});

class ToggleGame {
  constructor(element, size = 8) {
    this.elements = {
      root: element,
      cells: []
    };

    this.size = size;
    this.board = [];
    this.isGaveOver = false;

    for (var y = 0; y < size; y++) {
      var row = [];

      for (var x = 0; x < size; x++) {
        row[x] = false;
      }

      this.board[y] = row;
    }

    this.init();
  }

  init() {
    var gameContainer = document.createElement('div');
    gameContainer.className = "game-container";

    var table = document.createElement('table');
    for (var y = 0; y < this.size; y++) {
      var rowEl = document.createElement('tr');
      var rowContents = [];

      for (var x = 0; x < this.size; x++) {
        var cellEl = document.createElement('td');

        cellEl.addEventListener('click', this.toggleAround.bind(this, x, y));

        rowEl.appendChild(cellEl);
        rowContents[x] = cellEl;
      }

      table.appendChild(rowEl);
      this.elements.cells[y] = rowContents;
    }
    gameContainer.appendChild(table);

    this.elements.root.appendChild(gameContainer);

    var textContainer = document.createElement('div');
    textContainer.className = "text-container";

    var goal = document.createElement('div');
    goal.textContent = "Turn off all the cells!";
    textContainer.appendChild(goal);

    var hint = document.createElement('div');
    hint.textContent = "(It is possible, I promise)";
    hint.className = "hint";
    textContainer.appendChild(hint);

    this.elements.root.appendChild(textContainer);

    var winScreen = document.createElement('div');
    winScreen.className = "win-screen";

    var winText = document.createElement('div');
    winText.className = "win-text";
    winText.textContent = "You Win!"
    winScreen.appendChild(winText);

    var resetText = document.createElement('div');
    resetText.className = "reset-text";
    resetText.textContent = "Play again"
    resetText.addEventListener('click', this.reset.bind(this));
    winScreen.appendChild(resetText);

    this.elements.root.appendChild(winScreen);

    this.reset();
  }

  toggle(x, y, value, showUpdate = true) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
      return;
    }

    var isLit = typeof value === 'undefined'
      ? !this.board[y][x]
      : !!value;

    this.board[y][x] = isLit;

    if (showUpdate) {
      this.updateClass(x, y, isLit);
    }
  }

  toggleAround(x, y, showUpdate) {
    this.toggle(x, y, undefined, showUpdate);

    this.toggle(x + 1, y, undefined, showUpdate);
    this.toggle(x - 1, y, undefined, showUpdate);
    this.toggle(x, y + 1, undefined, showUpdate);
    this.toggle(x, y - 1, undefined, showUpdate);

    if (!this.isGameOver) {
      this.checkForWin();
    }
  }

  updateClass(x, y, isLit) {
    if (typeof isLit === 'undefined') {
      isLit = this.board[y][x];
    }

    this.elements.cells[y][x].className = isLit ? "active" : "";
  }

  updateClasses(animate) {
    if (animate) {
      for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
          setTimeout(
            this.updateClass.bind(this, x, y, this.board[y][x]),
            (x + y) * 25
          );
        }
      }
    } else {
      for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
          this.updateClass(x, y);
        }
      }
    }
  }

  checkForWin() {
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        if (this.board[y][x]) return;
      }
    }

    this.isGameOver = true;
    this.elements.root.className = "game-over";
  }

  reset() {
    this.elements.root.className = "";

    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        this.toggle(x, y, false);
      }
    }

    var numToggles = this.size * this.size * 0.25;
    for (var i = 0; i < numToggles; i++) {
      var x = Math.floor(Math.random() * this.size);
      var y = Math.floor(Math.random() * this.size);

      this.toggleAround(x, y, false);
    }

    this.isGameOver = false;

    this.updateClasses(true);
  }
}