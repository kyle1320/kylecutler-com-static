import { delay, makeElement, count } from '../../_utils';

window.addEventListener('load', function () {
  const el = document.getElementById('minigame-toggle');
  el && new ToggleGame(el);
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
      makeElement('div', {className: 'game-container'}, [
        makeElement('table', null, count(this.size, y =>
          makeElement('tr', null, this.elements.cells[y] = count(this.size, x =>
            makeElement('td', {
              onclick: this.toggleAround.bind(this, x, y)
            })
          ))
        )),
        makeElement('div', {className: 'win-screen'}, [
          makeElement('div', {className: 'win-text'}, 'You Win!'),
          makeElement('div', {className: 'reset-text'}, 'Play Again')
        ])
      ]),
      makeElement('div', {className: 'text-container'}, [
        makeElement('div', null, 'Turn off all the cells!'),
        makeElement('div', {className: 'hint'}, '(It is possible, I promise)'),
        makeElement('div', {
          className: 'fa fa-undo reset-btn',
          onclick: this.reset.bind(this)
        })
      ]),
      makeElement('div', {className: 'options-container'}, [
        makeElement('div', {className: 'options-row'}, [
          this.elements.options.difficultyEasy =
            makeElement('div', {
              className: 'option',
              onclick: () => this.setDifficulty('easy')
            }, 'Easy'),
          this.elements.options.difficultyMedium =
            makeElement('div', {
              className: 'option',
              onclick: () => this.setDifficulty('medium')
            }, 'Medium'),
          this.elements.options.difficultyHard =
            makeElement('div', {
              className: 'option',
              onclick: () => this.setDifficulty('hard')
            }, 'Hard')
        ]),
        makeElement('div', {className: 'options-row'}, [
          this.elements.options.shapePlus =
            makeElement('div', {
              className: 'option shape-plus',
              onclick: () => this.setShape('plus')
            }, makeElement('span')),
          this.elements.options.shapeDiamond =
            makeElement('div', {
              className: 'option shape-diamond',
              onclick: () => this.setShape('diamond')
            }, makeElement('span')),
          this.elements.options.shapeX =
            makeElement('div', {
              className: 'option shape-x',
              onclick: () => this.setShape('x')
            }, makeElement('span')),
          this.elements.options.shapeO =
            makeElement('div', {
              className: 'option shape-o',
              onclick: () => this.setShape('o')
            }, makeElement('span'))
        ])
      ])
    ].forEach(el => this.elements.root.appendChild(el));

    this.setDifficulty(this.difficulty, false);
    this.setShape(this.shape, false);
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

    this.elements.cells[y][x].className = isLit ? 'active' : '';
  }

  updateClasses(animate) {
    if (animate) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          setTimeout(
            this.updateClass.bind(this, x, y, this.board[y][x]),
            (x + y) * 25
          );
        }
      }
    } else {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
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
    this.elements.root.className = 'game-over';
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

    this.elements.root.className = '';
    this.isGameOver = false;

    if (this.isResetting) {
      return;
    }

    this.isResetting = true;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
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
      let x = Math.floor(Math.random() * this.size);
      let y = Math.floor(Math.random() * this.size);

      this.toggleAround(x, y, false);
    }

    this.updateClasses(true);

    this.isResetting = false;
  }
}