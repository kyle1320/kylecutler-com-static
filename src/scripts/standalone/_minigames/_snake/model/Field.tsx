import Snake from './snake';
import Food from './food';
import {
  dirTowards,
  scaleCanvas,
  SNAKE_RADIUS,
  FOOD_RADIUS,
  FOOD_WIDTH,
  SNAKE_WIDTH
} from '../utils';
import EventEmitter from '../../../_circuits/utils/EventEmitter';
import { makeElement } from '../../../../_utils';

const GAME_SCALE = 14;

export default class Field extends EventEmitter<{
  die: number,
  eat: number
  }> {
  private size: number;
  private snake: Snake;
  private food: Food;

  public canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private centerTouch: Touch;

  public constructor(size: number) {
    super();

    this.size = size;
    this.snake = new Snake(0, 0, 0, 0);
    this.food = new Food(0, 0);

    this.canvas = <canvas
      width={size * GAME_SCALE}
      height={size * GAME_SCALE}
      tabIndex={0} />;
    this.context = this.canvas.getContext('2d');

    this.centerTouch = null;

    scaleCanvas(this.canvas, this.context);

    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.scale(GAME_SCALE, GAME_SCALE);

    this.addListeners();
  }

  public reset() {
    var x = Math.random() * (this.size - SNAKE_WIDTH) + SNAKE_RADIUS;
    var y = Math.random() * (this.size - SNAKE_WIDTH) + SNAKE_RADIUS;
    var dir = dirTowards(this.size / 2 - x, this.size / 2 - y);

    this.snake.reset(x, y, dir.x, dir.y);

    this.placeFood();
  }

  public update(dt: number) {
    var willDie = this.checkForDeath(dt);

    this.snake.update(dt);

    if (willDie) {
      this.emit('die', this.snake.foodEaten);
    } else {
      this.tryEat();
    }

    this.draw();
  }

  private draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.snake.draw(this.context);
    this.food.draw(this.context);
  }

  private tryEat() {
    var head = this.snake.getHead();
    var dx = head.x - this.food.position.x;
    var dy = head.y - this.food.position.y;

    const DIST = FOOD_RADIUS + SNAKE_RADIUS;

    if (dx * dx + dy * dy < DIST * DIST) {
      this.snake.eat();
      this.placeFood();
      this.emit('eat', this.snake.foodEaten);
    }
  }

  private checkForDeath(dt: number): boolean {
    var head = this.snake.getHead(dt);
    var hitWall =
      head.x < SNAKE_RADIUS ||
      head.x > this.size - SNAKE_RADIUS ||
      head.y < SNAKE_RADIUS ||
      head.y > this.size - SNAKE_RADIUS;

    return hitWall || this.snake.willEatSelf(dt);
  }

  private placeFood() {
    var x = Math.random() * (this.size - FOOD_WIDTH) + FOOD_RADIUS;
    var y = Math.random() * (this.size - FOOD_WIDTH) + FOOD_RADIUS;

    this.food.move(x, y);
  }

  private addListeners() {
    this.canvas.addEventListener('keydown', event => {
      event.preventDefault();

      switch (event.keyCode) {
      case 65: // A
      case 37: return this.snake.setDirection({x: -1, y: 0}); // left
      case 87: // W
      case 38: return this.snake.setDirection({x: 0, y: -1}); // up
      case 68: // D
      case 39: return this.snake.setDirection({x: 1, y: 0}); // right
      case 83: // S
      case 40: return this.snake.setDirection({x: 0, y: 1}); // down
      }
    });

    this.canvas.addEventListener('touchstart', (event) => {
      if (!this.centerTouch) {
        event.preventDefault();
        this.centerTouch = event.changedTouches[0];
      }
    });

    this.canvas.addEventListener('touchmove', (event) => {
      if (this.centerTouch) {
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];

          if (touch.identifier === this.centerTouch.identifier) {
            event.preventDefault();

            var dx = touch.clientX - this.centerTouch.clientX;
            var dy = touch.clientY - this.centerTouch.clientY;

            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
              var dir = dirTowards(dx, dy);
              this.snake.setDirection(dir);
            }
            break;
          }
        }
      }
    });

    this.canvas.addEventListener('touchend', (event) => {
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
  }
}