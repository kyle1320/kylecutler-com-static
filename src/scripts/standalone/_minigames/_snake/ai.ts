import Field from './model/Field';
import Snake from './model/snake';
import Food from './model/food';
import { Direction, Vec2 } from './types';
import {
  SNAKE_WIDTH,
  getForwardBoundingBox,
  getBoundingBox,
  boundingBoxesIntersect,
  accessUnsafe
} from './utils';

const TYPE_WALL = 0;
const TYPE_SNAKE = 1;

interface Obstacle {
  type: 0 | 1;
  dist: number
}

export default class SnakeAI {
  private field: Field;
  private snake: Snake;
  private food: Food;

  public constructor (field: Field) {
    this.field = field;
    this.snake = accessUnsafe(field, 'snake');
    this.food = accessUnsafe(field, 'food');
  }

  public consult() {
    var head = this.snake.getHead();
    var direction = accessUnsafe<Direction>(this.snake, 'direction');

    var dir: Direction, needToTurn = true;
    var dx = this.food.position.x - head.x;
    var dy = this.food.position.y - head.y;
    var f = dx * direction.x + dy * direction.y;

    // first try going for food
    if (
      f < SNAKE_WIDTH / 4 &&
      (Math.abs(dx) > SNAKE_WIDTH || Math.abs(dy) > SNAKE_WIDTH)
    ) {
      dir = {
        x: Math.abs(direction.y) * Math.sign(dx),
        y: Math.abs(direction.x) * Math.sign(dy)
      } as Direction;
      needToTurn = this.avoid(dir, true);
    }

    // then default to just going straight
    if (needToTurn) {
      dir = direction;
      needToTurn = this.avoid(dir);
    }

    // if we need to turn, pick a random direction
    if (needToTurn) {
      dir = {
        x: direction.y * Math.sign(Math.random() - 0.5),
        y: direction.x * Math.sign(Math.random() - 0.5)
      } as Direction;
      needToTurn = this.avoid(dir);
    }

    // if the previous direction didn't work, turn around
    if (needToTurn) {
      dir = { x: -dir.x, y: -dir.y } as Direction;
      needToTurn = this.avoid(dir);
    }

    this.snake.setDirection(dir);
  }

  private findNearestObstacle(dir: Direction): Obstacle {
    var head = this.snake.getHead();
    var segments = accessUnsafe<Vec2<number>[]>(this.snake, 'segments');

    var searchBB = getForwardBoundingBox(
      head, dir, SNAKE_WIDTH, SNAKE_WIDTH / 1.99, 10000
    );

    var minObstacle: Obstacle = null;
    for (var i = segments.length - 2; i >= 0; i--) {
      var targetBB = getBoundingBox(segments[i+1], segments[i], SNAKE_WIDTH);

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
          minObstacle = { type: TYPE_SNAKE, dist: dist };
        }
      }
    }

    if (minObstacle) {
      return minObstacle;
    }

    var size = accessUnsafe<number>(this.field, 'size');

    return {
      type: TYPE_WALL,
      dist: Math.max(
        dir.x * (size - SNAKE_WIDTH / 2 - head.x),
        dir.x * (SNAKE_WIDTH / 2 - head.x),
        dir.y * (size - SNAKE_WIDTH / 2 - head.y),
        dir.y * (SNAKE_WIDTH / 2 - head.y)
      )
    };
  }

  private avoid(dir: Direction, goingForFood: boolean = false): boolean {
    var obstacle = this.findNearestObstacle(dir);
    var eaten = accessUnsafe<number>(this.snake, 'foodEaten');

    return (obstacle.type === TYPE_SNAKE && goingForFood)
      ? obstacle.dist < (SNAKE_WIDTH * 2 * Math.sqrt(eaten + 1))
      : obstacle.dist < 0.2;
  }
}