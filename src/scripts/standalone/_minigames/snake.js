import { makeElement } from '../../_utils';

window.addEventListener('load', function () {
  const el = document.getElementById('minigame-snake');
  el && new SnakeGame(el);
});

const SCALE = 14;

class SnakeGame {
  constructor(element, size = 20) {
    this.elements = {
      root: element,
      canvas: null,
      overlay: null,
      score: null
    };

    this.size = size;
    this.snake = [];
    this.food = null;
    this.direction = {x: 0, y: 0};
    this.lastUpdateTime = 0;
    this.speed = 0;
    this.moveStun = 0;
    this.chaseStun = 0;
    this.isPaused = false;
    this.score = 0;
    this.isPlaying = false;

    this.centerTouch = null;

    this.update = this.update.bind(this);

    [ this.elements.canvas = makeElement({
      tag: 'canvas',
      width: size * SCALE,
      height: size * SCALE,
      tabIndex: 0
    }),
    makeElement({ className: 'score' }, [
      makeElement('span', 'Score: '),
      this.elements.score = makeElement('span', '' + this.score)
    ]),
    this.elements.overlay = makeElement(
      { className: 'overlay' }, 'Click to Play'
    )
    ].forEach(el => this.elements.root.appendChild(el));

    this.context = this.elements.canvas.getContext('2d');
    scaleCanvas(this.elements.canvas, this.context);

    this.elements.canvas.addEventListener('keydown', event => {
      event.preventDefault();

      switch (event.keyCode) {
      case 37: return this.setDirection(-1,  0); // left
      case 38: return this.setDirection( 0, -1); // up
      case 39: return this.setDirection( 1,  0); // right
      case 40: return this.setDirection( 0,  1); // down
      }
    });
    this.elements.canvas.addEventListener('focus', () => this.resume());
    this.elements.canvas.addEventListener('blur', () => this.pause());
    this.elements.canvas.addEventListener('touchstart', (event) => {
      if (!this.centerTouch) {
        this.resume();
        event.preventDefault();
        this.centerTouch = event.changedTouches[0];
      }
    });
    this.elements.canvas.addEventListener('touchmove', (event) => {
      if (this.centerTouch) {
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];

          if (touch.identifier === this.centerTouch.identifier) {
            event.preventDefault();
            this.moveRel(
              touch.clientX - this.centerTouch.clientX,
              touch.clientY - this.centerTouch.clientY
            );
            break;
          }
        }
      }
    });
    this.elements.canvas.addEventListener('touchend', (event) => {
      if (this.centerTouch) {
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];

          if (touch.identifier === this.centerTouch.identifier) {
            event.preventDefault();
            this.centerTouch = null;
            break;
          }
        }
      }
    });

    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.scale(SCALE, SCALE);

    this.showOverlay('Click to Play');

    this.reset();

    this.update();
  }

  reset() {
    var x = Math.random() * this.size;
    var y = Math.random() * this.size;

    this.snake = [{x, y}, {x, y}];
    this.speed = 7.5;

    this.setScore(0);
    this.moveRel(this.size / 2 - x, this.size / 2 - y);

    this.isMoving = true;
    this.isChasing = false;

    this.lastUpdateTime = +new Date();

    this.chaseStun = 2;
    this.placeFood();
  }

  update() {
    var time = +new Date();
    var dt = time - this.lastUpdateTime;
    this.lastUpdateTime = time;

    if (this.checkForDeath()) {
      this.gameOver();
    } else {
      this.tryEat();

      this.move(dt * this.speed / 1000);
      this.chase(dt * this.speed / 1000);
    }

    this.draw();

    if (!this.isPaused) {
      window.requestAnimationFrame(this.update);
    }
  }

  draw() {
    var head = this.snake[this.snake.length - 1];

    this.context.clearRect(
      0, 0, this.elements.canvas.width, this.elements.canvas.height
    );

    // tongue
    this.context.strokeStyle = '#f44336';
    this.context.lineWidth = 0.15;
    this.context.beginPath();
    this.context.moveTo(
      head.x + this.direction.x * 0.3,
      head.y + this.direction.y * 0.3
    );
    this.context.lineTo(
      head.x + this.direction.x * 0.45,
      head.y + this.direction.y * 0.45
    );
    this.context.stroke();

    // body
    this.context.strokeStyle = '#009688';
    this.context.lineWidth = 0.7;
    this.context.beginPath();
    this.context.moveTo(head.x, head.y);
    for (let i = this.snake.length - 2; i >= 0; i--) {
      this.context.lineTo(this.snake[i].x, this.snake[i].y);
    }
    this.context.stroke();
    this.context.strokeStyle = '#00897B';
    this.context.lineWidth = 0.6;
    this.context.setLineDash([0, 0.99]);
    this.context.beginPath();
    this.context.moveTo(head.x, head.y);
    for (let i = this.snake.length - 2; i >= 0; i--) {
      this.context.lineTo(this.snake[i].x, this.snake[i].y);
    }
    this.context.stroke();
    this.context.setLineDash([]);

    // eyes
    this.context.fillStyle = 'white';
    this.context.beginPath();
    drawDot(
      this.context,
      head.x - this.direction.y * 0.2,
      head.y - this.direction.x * 0.2,
      0.15
    );
    drawDot(
      this.context,
      head.x + this.direction.y * 0.2,
      head.y + this.direction.x * 0.2,
      0.15
    );
    this.context.fill();
    this.context.fillStyle = 'black';
    this.context.beginPath();
    drawDot(
      this.context,
      head.x - this.direction.y * 0.16 + this.direction.x * 0.04,
      head.y - this.direction.x * 0.16 + this.direction.y * 0.04,
      0.08
    );
    drawDot(
      this.context,
      head.x + this.direction.y * 0.16 + this.direction.x * 0.04,
      head.y + this.direction.x * 0.16 + this.direction.y * 0.04,
      0.08
    );
    this.context.fill();

    // food
    this.context.fillStyle = '#f44336';
    this.context.beginPath();
    drawDot(this.context, this.food.x, this.food.y, 0.5);
    this.context.fill();
    this.context.fillStyle = '#00897B';
    this.context.beginPath();
    this.context.moveTo(this.food.x, this.food.y - 0.3);
    this.context.arcTo(
      this.food.x, this.food.y - 0.8,
      this.food.x + 0.5, this.food.y - 0.7, 0.5
    );
    this.context.arcTo(
      this.food.x + 0.5, this.food.y - 0.3,
      this.food.x, this.food.y - 0.3, 0.5
    );
    this.context.fill();
  }

  checkForDeath() {
    var head = this.snake[this.snake.length - 1];

    if (head.x < 0 || head.x > this.size || head.y < 0 || head.y > this.size) {
      return true;
    }

    var headSegment = [ head, this.snake[this.snake.length - 2] ];

    for (var i = this.snake.length - 3; i >= 0; i--) {
      var segment = [this.snake[i+1], this.snake[i]];

      if (segmentsIntersect(headSegment, segment)) {
        return true;
      }
    }

    return false;
  }

  tryEat() {
    var head = this.snake[this.snake.length - 1];

    var dx = this.food.x - head.x;
    var dy = this.food.y - head.y;

    if (dx*dx + dy*dy < .75*.75) {
      this.eat();
    }
  }

  move(dist) {
    var x = Math.min(this.moveStun, dist);
    this.moveStun -= x;
    dist -= x;

    if (dist <= 0) return;
    if (this.moveStun > 0) return;

    var head = this.snake[this.snake.length - 1];

    head.x += this.direction.x * dist;
    head.y += this.direction.y * dist;
  }

  chase(dist) {
    var x = Math.min(this.chaseStun, dist);
    this.chaseStun -= x;
    dist -= x;

    if (dist <= 0) return;
    if (this.chaseStun > 0) return;
    if (this.snake.length < 2) return; // TODO: game over

    var from = this.snake[0];
    var to = this.snake[1];

    var dx = to.x - from.x;
    var dy = to.y - from.y;

    // one of dx or dy should always be 0, so no need for Euclidean dist
    var d = Math.abs(dx) + Math.abs(dy);

    if (dist >= d) {
      this.snake.shift();
      this.chase(dist - d);
    } else {
      from.x += dist * dx / d;
      from.y += dist * dy / d;
    }
  }

  eat() {
    this.chaseStun += 2;

    this.setScore(this.score + 1);
    this.placeFood();

    this.speed += 0.1;
  }

  gameOver() {
    if (this.isPlaying) {
      this.showOverlay(
        '<span>You got ' + this.score + '.</span>' +
        '<span>Click to play again</span>'
      );
    }

    this.isPlaying = false;

    this.elements.canvas.blur();

    this.reset();
  }

  setScore(score) {
    this.score = score;
    this.elements.score.textContent = score;
  }

  pause() {
    if (this.isPlaying) {
      this.showOverlay('Click to Resume');

      this.isPaused = true;
    }
  }

  resume() {
    this.hideOverlay();
    this.isPlaying = true;

    if (!this.isPaused) return;

    this.isPaused = false;
    this.lastUpdateTime = +new Date();
    this.update();
  }

  showOverlay(text) {
    this.elements.overlay.style.display = '';
    this.elements.overlay.innerHTML = text;
    this.elements.canvas.style.opacity = '0.5';
  }

  hideOverlay() {
    this.elements.overlay.style.display = 'none';
    this.elements.canvas.style.opacity = '1';
  }

  clearGrid() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.grid[y][x] = CELL_TYPES.EMPTY;
      }
    }
  }

  placeFood() {
    var x = Math.random() * (this.size - 1) + 0.5;
    var y = Math.random() * (this.size - 1) + 0.5;

    this.food = {x, y};
  }

  setDirection(x, y) {
    if (x === 0 && y === 0) return;
    if (x * y !== 0) return;
    if (x === this.direction.x && y === this.direction.y) return;
    if (x === -this.direction.x && y === -this.direction.y) return;

    var head = this.snake[this.snake.length - 1];
    this.snake.push({ x: head.x, y: head.y });
    this.direction = {x, y};
  }

  moveRel(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) this.setDirection(Math.sign(dx) || 1, 0);
    else                             this.setDirection(0, Math.sign(dy) || 1);
  }
}

function scaleCanvas(canvas, context) {
  var res = window.devicePixelRatio || 1;

  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';

  canvas.width *= res;
  canvas.height *= res;

  context.scale(res, res);
}

function drawDot(context, x, y, radius) {
  context.arc(x, y, radius, 0, 2 * Math.PI);
}

function segmentsIntersect(a, b) {
  return boundingBoxesIntersect(
    getBoundingBox(a[0], a[1]),
    getBoundingBox(b[0], b[1])
  );
}

function getBoundingBox(a, b) {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y)
  };
}

function boundingBoxesIntersect(a, b) {
  return a.maxX > b.minX && a.minX < b.maxX
      && a.maxY > b.minY && a.minY < b.maxY;
}