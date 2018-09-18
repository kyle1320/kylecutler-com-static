import { importStylesheet, delay, makeElement, count } from '../../utils';

window.addEventListener('load', async function () {
  new ToggleGame(document.getElementById('minigame-toggle'));
});

class ToggleGame {
  constructor(element, size = 8, difficulty = 'medium', shape = 'plus') {
    this.elements = {
      root: element,
      options: {},
      cells: []
    };

    this.size = size;
    this.board = [];
    this.isGaveOver = false;
    this.isResetting = false;
    this.difficulty = difficulty;
    this.shape = shape;

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
    [
      makeElement({className: 'game-container'}, [
        makeElement('table', count(this.size, y =>
          makeElement('tr', this.elements.cells[y] = count(this.size, x =>
            makeElement('td', '', {
              click: this.toggleAround.bind(this, x, y)
            })
          ), {})
        )),
        makeElement({className: 'win-screen'}, [
          makeElement({className: 'win-text'}, 'You Win!'),
          makeElement({className: 'reset-text'}, 'Play Again')
        ])
      ]),
      makeElement({className: 'text-container'}, [
        makeElement({}, 'Turn off all the cells!'),
        makeElement({className: 'hint'}, '(It is possible, I promise)'),
        makeElement({className: 'fa fa-undo reset-btn'}, '', {
          click: this.reset.bind(this)
        })
      ]),
      makeElement({className: 'options-container'}, [
        makeElement({className: 'options-row'}, [
          this.elements.options.difficultyEasy =
            makeElement({className: 'option'}, 'Easy', {
            click: () => this.setDifficulty('easy')
          }),
          this.elements.options.difficultyMedium =
            makeElement({className: 'option'}, 'Medium', {
            click: () => this.setDifficulty('medium')
          }),
          this.elements.options.difficultyHard =
            makeElement({className: 'option'}, 'Hard', {
            click: () => this.setDifficulty('hard')
          })
        ]),
        makeElement({className: 'options-row'}, [
          this.elements.options.shapePlus =
            makeElement({className: 'option shape-plus'}, '<span></span>', {
            click: () => this.setShape('plus')
          }),
          this.elements.options.shapeDiamond =
            makeElement({className: 'option shape-diamond'}, '<span></span>', {
            click: () => this.setShape('diamond')
          }),
          this.elements.options.shapeX =
            makeElement({className: 'option shape-x'}, '<span></span>', {
            click: () => this.setShape('x')
          }),
          this.elements.options.shapeO =
            makeElement({className: 'option shape-o'}, '<span></span>', {
            click: () => this.setShape('o')
          })
        ])
      ])
    ].forEach(el => this.elements.root.appendChild(el));

    this.setDifficulty(this.difficulty, false);
    this.setShape(this.shape, false)
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
    switch (this.shape) {
      default:
      case 'plus':
        this.toggle(x, y, undefined, showUpdate);
        this.toggle(x + 1, y, undefined, showUpdate);
        this.toggle(x - 1, y, undefined, showUpdate);
        this.toggle(x, y + 1, undefined, showUpdate);
        this.toggle(x, y - 1, undefined, showUpdate);
        break;
      case 'diamond':
        this.toggle(x + 1, y, undefined, showUpdate);
        this.toggle(x - 1, y, undefined, showUpdate);
        this.toggle(x, y + 1, undefined, showUpdate);
        this.toggle(x, y - 1, undefined, showUpdate);
        break;
      case 'x':
        this.toggle(x, y, undefined, showUpdate);
        this.toggle(x + 1, y + 1, undefined, showUpdate);
        this.toggle(x - 1, y + 1, undefined, showUpdate);
        this.toggle(x + 1, y - 1, undefined, showUpdate);
        this.toggle(x - 1, y - 1, undefined, showUpdate);
        break;
      case 'o':
        this.toggle(x, y + 1, undefined, showUpdate);
        this.toggle(x + 1, y + 1, undefined, showUpdate);
        this.toggle(x + 1, y, undefined, showUpdate);
        this.toggle(x + 1, y - 1, undefined, showUpdate);
        this.toggle(x, y - 1, undefined, showUpdate);
        this.toggle(x - 1, y - 1, undefined, showUpdate);
        this.toggle(x - 1, y, undefined, showUpdate);
        this.toggle(x - 1, y + 1, undefined, showUpdate);
        break;
    }

    if (!this.isGameOver && !this.isResetting) {
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

    if (this.isGameOver || this.isResetting) {
      return;
    }

    this.isGameOver = true;
    this.elements.root.className = "game-over";
  }

  setShape(shape, reset = true) {
    this.shape = shape;

    this.elements.options.shapePlus.className = shape === 'plus'
      ? 'option shape-plus active' : 'option shape-plus';
    this.elements.options.shapeDiamond.className = shape === 'diamond'
      ? 'option shape-diamond active' : 'option shape-diamond';
    this.elements.options.shapeX.className = shape === 'x'
      ? 'option shape-x active' : 'option shape-x';
    this.elements.options.shapeO.className = shape === 'o'
      ? 'option shape-o active' : 'option shape-o';

    if (reset) {
      this.reset();
    }
  }

  setDifficulty(difficulty, reset = true) {
    this.difficulty = difficulty;

    this.elements.options.difficultyEasy.className = difficulty === 'easy'
      ? 'option active' : 'option';
    this.elements.options.difficultyMedium.className = difficulty === 'medium'
      ? 'option active' : 'option';
    this.elements.options.difficultyHard.className = difficulty === 'hard'
      ? 'option active' : 'option';

    if (reset) {
      this.reset();
    }
  }

  async reset() {
    var wasGameOver = this.isGameOver;

    this.elements.root.className = "";
    this.isGameOver = false;

    if (this.isResetting) {
      return;
    }

    this.isResetting = true;

    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        this.toggle(x, y, false, wasGameOver);
      }
    }

    if (!wasGameOver) {
      this.updateClasses(true);

      await delay(250);
    }

    var numToggles;

    switch (this.difficulty) {
      default:
      case 'easy':
        numToggles = this.size * this.size * 0.1;
        break;
      case 'medium':
        numToggles = this.size * this.size * 0.25;
        break;
      case 'hard':
        numToggles = this.size * this.size * 0.5;
        break;
    }

    for (var i = 0; i < numToggles; i++) {
      var x = Math.floor(Math.random() * this.size);
      var y = Math.floor(Math.random() * this.size);

      this.toggleAround(x, y, false);
    }

    this.updateClasses(true);

    this.isResetting = false;
  }
}