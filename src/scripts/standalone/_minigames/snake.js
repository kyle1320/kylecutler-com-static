import { makeElement } from '../../_utils';

window.addEventListener('load', function () {
  const el = document.getElementById('minigame-snake');
  el && new SnakeGame(el);
});

const SCALE = 14;
const SNAKE_WIDTH = 0.7;

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
    this.score = 0;

    this.isPaused = false;
    this.isPlaying = false;

    this.centerTouch = null;

    this.update = this.update.bind(this);

    [
      makeElement({ className: 'game-container' }, [
        this.elements.canvas = makeElement({
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
      ]),
      makeElement(
        { className: 'info' },
        'Use W,A,S,D / arrow keys / swipe to turn'
      )
    ].forEach(el => this.elements.root.appendChild(el));

    this.context = this.elements.canvas.getContext('2d');
    scaleCanvas(this.elements.canvas, this.context);

    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.scale(SCALE, SCALE);

    this.elements.canvas.addEventListener('keydown', event => {
      event.preventDefault();

      switch (event.keyCode) {
      case 65: // A
      case 37: return this.setDirection(-1,  0); // left
      case 87: // W
      case 38: return this.setDirection( 0, -1); // up
      case 68: // D
      case 39: return this.setDirection( 1,  0); // right
      case 83: // S
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

            var dx = touch.clientX - this.centerTouch.clientX;
            var dy = touch.clientY - this.centerTouch.clientY;

            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
              this.moveRel(dx, dy);
            }
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

    this.showOverlay('Click to Play');

    this.reset();

    this.update();
  }

  reset() {
    var x = Math.random() * (this.size - 1) + 0.5;
    var y = Math.random() * (this.size - 1) + 0.5;

    this.direction = {x: 0, y: 0};
    this.snake = [{x, y}];
    this.moveRel(this.size / 2 - x, this.size / 2 - y);

    this.speed = 7.5;

    this.setScore(0);

    this.moveStun = 0;
    this.chaseStun = 2;

    this.lastUpdateTime = +new Date();

    this.placeFood();
  }

  update() {
    var time = +new Date();
    var dt = time - this.lastUpdateTime;
    this.lastUpdateTime = time;

    var dist = dt * this.speed / 1000;

    if (!this.isPlaying) {
      this.consultAI();
    }

    var didDie = this.checkForDeath(dist);

    this.move(dist);
    this.chase(dist);

    if (didDie) {
      this.gameOver();
    } else {
      this.tryEat();
    }

    this.draw();

    if (!this.isPaused) {
      window.requestAnimationFrame(this.update);
    }
  }

  draw() {
    var head = this.snake[this.snake.length - 1];
    const ax = this.direction.x;
    const ay = this.direction.y;

    this.context.clearRect(
      0, 0, this.elements.canvas.width, this.elements.canvas.height
    );

    // body
    this.context.strokeStyle = '#009688';
    this.context.lineWidth = SNAKE_WIDTH;
    this.context.beginPath();
    this.context.moveTo(head.x, head.y);
    for (let i = this.snake.length - 2; i >= 0; i--) {
      this.context.lineTo(this.snake[i].x, this.snake[i].y);
    }
    this.context.stroke();
    this.context.strokeStyle = '#00897B';
    this.context.lineWidth = SNAKE_WIDTH * 0.9;
    this.context.setLineDash([0, 0.99]);
    this.context.beginPath();
    this.context.moveTo(head.x, head.y);
    for (let i = this.snake.length - 2; i >= 0; i--) {
      this.context.lineTo(this.snake[i].x, this.snake[i].y);
    }
    this.context.stroke();
    this.context.setLineDash([]);

    // tongue
    this.context.strokeStyle = '#f44336';
    this.context.lineWidth = 0.1;
    this.context.beginPath();
    this.context.moveTo(
      head.x + ax * 0.35,
      head.y + ay * 0.35
    );
    this.context.arcTo(
      head.x + ax * 0.4 + ay * 0.05, head.y + ay * 0.4 + ax * 0.05,
      head.x + ax * 0.45, head.y + ay * 0.45,
      0.07
    );
    this.context.arcTo(
      head.x + ax * 0.5 - ay * 0.05, head.y + ay * 0.5 - ax * 0.05,
      head.x + ax * 0.55, head.y + ay * 0.55,
      0.07
    );
    this.context.stroke();
    this.context.fillStyle = '#00897B';
    this.context.lineWidth = SNAKE_WIDTH * 0.9;
    this.context.beginPath();
    drawDot(this.context, head.x, head.y, SNAKE_WIDTH / 2);
    this.context.fill();

    // eyes
    this.context.fillStyle = 'white';
    this.context.beginPath();
    drawDot(
      this.context,
      head.x - ay * SNAKE_WIDTH * 0.25,
      head.y - ax * SNAKE_WIDTH * 0.25,
      SNAKE_WIDTH * 0.2
    );
    drawDot(
      this.context,
      head.x + ay * SNAKE_WIDTH * 0.25,
      head.y + ax * SNAKE_WIDTH * 0.25,
      SNAKE_WIDTH * 0.2
    );
    this.context.fill();
    this.context.fillStyle = 'black';
    this.context.beginPath();
    drawDot(
      this.context,
      head.x - ay * SNAKE_WIDTH * 0.23 + ax * SNAKE_WIDTH * 0.1,
      head.y - ax * SNAKE_WIDTH * 0.23 + ay * SNAKE_WIDTH * 0.1,
      SNAKE_WIDTH * 0.1
    );
    drawDot(
      this.context,
      head.x + ay * SNAKE_WIDTH * 0.23 + ax * SNAKE_WIDTH * 0.1,
      head.y + ax * SNAKE_WIDTH * 0.23 + ay * SNAKE_WIDTH * 0.1,
      SNAKE_WIDTH * 0.1
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

  checkForDeath(dist) {
    var head = this.snake[this.snake.length - 1];

    if (
      head.x < SNAKE_WIDTH / 2 ||
      head.x > this.size - SNAKE_WIDTH / 2 ||
      head.y < SNAKE_WIDTH / 2 ||
      head.y > this.size - SNAKE_WIDTH / 2
    ) {
      return true;
    }

    var front = getForwardBoundingBox(
      head, this.direction, SNAKE_WIDTH / 1.99, dist
    );

    for (var i = this.snake.length - 3; i >= 0; i--) {
      var bb = getBoundingBox(this.snake[i+1], this.snake[i]);

      if (boundingBoxesIntersect(front, bb)) {
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
      this.pause();

      this.showOverlay(
        '<span>You scored ' + this.score + ' points</span>' +
        '<span>Click to play again</span>'
      );
      this.isPlaying = false;

      this.elements.canvas.blur();
    } else {
      this.reset();
    }
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

    if (!this.isPlaying) {
      this.reset();
      this.isPlaying = true;
    }

    if (!this.isPaused) return;

    this.isPaused = false;
    this.lastUpdateTime = +new Date();
    this.update();
  }

  consultAI() {
    const head = this.snake[this.snake.length - 1];

    const findNearestObstacle = (dir) => {
      var searchBB = getForwardBoundingBox(
        head, dir, SNAKE_WIDTH / 1.99, 10000
      );

      var minObstacle = null;
      for (var i = this.snake.length - 2; i >= 0; i--) {
        var targetBB = getBoundingBox(this.snake[i+1], this.snake[i]);

        if (boundingBoxesIntersect(targetBB, searchBB)) {
          const dist = Math.max(
            Math.min(
              dir.x * (targetBB.minX - head.x),
              dir.x * (targetBB.maxX - head.x)
            ),
            Math.min(
              dir.y * (targetBB.minY - head.y),
              dir.y * (targetBB.maxY - head.y)
            )
          ) - SNAKE_WIDTH / 2;

          if (!minObstacle || minObstacle.dist > dist) {
            minObstacle = { type: 1, dist: dist };
          }
        }
      }

      if (minObstacle) {
        return minObstacle;
      }

      return {
        type: 0,
        dist: Math.max(
          dir.x * (this.size - SNAKE_WIDTH / 2 - head.x),
          dir.x * (SNAKE_WIDTH / 2 - head.x),
          dir.y * (this.size - SNAKE_WIDTH / 2 - head.y),
          dir.y * (SNAKE_WIDTH / 2 - head.y)
        )
      };
    };

    const avoid = (dir, goingForFood = false) => {
      var obstacle = findNearestObstacle(dir);
      return (obstacle.type === 1 && goingForFood)
        ? obstacle.dist < (SNAKE_WIDTH * 2 * Math.sqrt(this.score + 1))
        : obstacle.dist < 0.2;
    };

    var dir, turn = true;
    var dx = this.food.x - head.x;
    var dy = this.food.y - head.y;
    var f = dx * this.direction.x + dy * this.direction.y;

    if (
      f < SNAKE_WIDTH / 4 &&
      (Math.abs(dx) > SNAKE_WIDTH || Math.abs(dy) > SNAKE_WIDTH)
    ) {
      dir = {
        x: Math.abs(this.direction.y) * Math.sign(dx),
        y: Math.abs(this.direction.x) * Math.sign(dy)
      };
      turn = avoid(dir, true);
    }

    if (turn) {
      dir = this.direction;
      turn = avoid(dir);
    }

    if (turn) {
      dir = {
        x: this.direction.y * Math.sign(Math.random() - 0.5),
        y: this.direction.x * Math.sign(Math.random() - 0.5)
      };
      turn = avoid(dir);
    }

    if (turn) {
      dir = { x: -dir.x, y: -dir.y };
      turn = avoid(dir);
    }

    if (!turn) {
      this.setDirection(dir.x, dir.y);
    }
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

function getBoundingBox(a, b) {
  return {
    minX: Math.min(a.x, b.x) - (SNAKE_WIDTH / 2),
    minY: Math.min(a.y, b.y) - (SNAKE_WIDTH / 2),
    maxX: Math.max(a.x, b.x) + (SNAKE_WIDTH / 2),
    maxY: Math.max(a.y, b.y) + (SNAKE_WIDTH / 2)
  };
}

function getForwardBoundingBox(start, direction, min, len) {
  var a = {
    x: start.x + direction.x * min,
    y: start.y + direction.y * min
  };
  var b = {
    x: start.x + direction.x * (min + len),
    y: start.y + direction.y * (min + len)
  };

  return {
    minX: Math.min(a.x, b.x) - (SNAKE_WIDTH / 2) * Math.abs(direction.y),
    minY: Math.min(a.y, b.y) - (SNAKE_WIDTH / 2) * Math.abs(direction.x),
    maxX: Math.max(a.x, b.x) + (SNAKE_WIDTH / 2) * Math.abs(direction.y),
    maxY: Math.max(a.y, b.y) + (SNAKE_WIDTH / 2) * Math.abs(direction.x)
  };
}

function boundingBoxesIntersect(a, b) {
  return a.maxX > b.minX && a.minX < b.maxX
      && a.maxY > b.minY && a.minY < b.maxY;
}