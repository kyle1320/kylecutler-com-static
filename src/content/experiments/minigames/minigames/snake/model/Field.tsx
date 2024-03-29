import Snake from './Snake';
import Food from './Food';
import {
  dirTowards,
  scaleCanvas,
  SNAKE_RADIUS,
  FOOD_RADIUS,
  FOOD_WIDTH,
  SNAKE_WIDTH
} from '../utils';
import { EventEmitter } from '~/src/common/js/utils';

const GAME_SCALE = 14;

export default class Field extends EventEmitter<{
  die: number;
  eat: number;
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

    this.canvas = (
      <canvas
        width={size * GAME_SCALE}
        height={size * GAME_SCALE}
        tabIndex={0}
      />
    );
    this.context = this.canvas.getContext('2d');

    this.centerTouch = null;

    scaleCanvas(this.canvas, this.context);

    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.scale(GAME_SCALE, GAME_SCALE);

    this.addListeners();
  }

  public reset() {
    const x = Math.random() * (this.size - SNAKE_WIDTH) + SNAKE_RADIUS;
    const y = Math.random() * (this.size - SNAKE_WIDTH) + SNAKE_RADIUS;
    const dir = dirTowards(this.size / 2 - x, this.size / 2 - y);

    this.snake.reset(x, y, dir.x, dir.y);

    this.placeFood();
  }

  public update(dt: number) {
    const willDie = this.checkForDeath(dt);

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
    const head = this.snake.getHead();
    const dx = head.x - this.food.position.x;
    const dy = head.y - this.food.position.y;

    const DIST = FOOD_RADIUS + SNAKE_RADIUS;

    if (dx * dx + dy * dy < DIST * DIST) {
      this.snake.eat();
      this.placeFood();
      this.emit('eat', this.snake.foodEaten);
    }
  }

  private checkForDeath(dt: number): boolean {
    const head = this.snake.getHead(dt);
    const hitWall =
      head.x < SNAKE_RADIUS ||
      head.x > this.size - SNAKE_RADIUS ||
      head.y < SNAKE_RADIUS ||
      head.y > this.size - SNAKE_RADIUS;

    return hitWall || this.snake.willEatSelf(dt);
  }

  private placeFood() {
    const x = Math.random() * (this.size - FOOD_WIDTH) + FOOD_RADIUS;
    const y = Math.random() * (this.size - FOOD_WIDTH) + FOOD_RADIUS;

    this.food.move(x, y);
  }

  private addListeners() {
    this.canvas.addEventListener('keydown', (event) => {
      event.preventDefault();

      switch (event.keyCode) {
        case 65: // A
        case 37:
          return this.snake.setDirection({ x: -1, y: 0 }); // left
        case 87: // W
        case 38:
          return this.snake.setDirection({ x: 0, y: -1 }); // up
        case 68: // D
        case 39:
          return this.snake.setDirection({ x: 1, y: 0 }); // right
        case 83: // S
        case 40:
          return this.snake.setDirection({ x: 0, y: 1 }); // down
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
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];

          if (touch.identifier === this.centerTouch.identifier) {
            event.preventDefault();

            const dx = touch.clientX - this.centerTouch.clientX;
            const dy = touch.clientY - this.centerTouch.clientY;

            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
              const dir = dirTowards(dx, dy);
              this.snake.setDirection(dir);
            }
            break;
          }
        }
      }
    });

    this.canvas.addEventListener('touchend', (event) => {
      if (this.centerTouch) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];

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
