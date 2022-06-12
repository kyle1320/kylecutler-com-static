import { Vec2 } from '../types';
import { drawDot, FOOD_RADIUS, FOOD_WIDTH } from '../utils';

export default class Food {
  public position: Vec2<number>;

  public constructor(x: number, y: number) {
    this.move(x, y);
  }

  public move(x: number, y: number) {
    this.position = { x, y };
  }

  public draw(context: CanvasRenderingContext2D) {
    const pos = this.position;

    context.fillStyle = '#f44336';
    drawDot(context, pos.x, pos.y, FOOD_RADIUS);

    context.fillStyle = '#00897B';
    context.beginPath();
    context.moveTo(pos.x, pos.y - 0.3);
    context.arcTo(
      pos.x,
      pos.y - FOOD_WIDTH * 0.8,
      pos.x + FOOD_WIDTH * 0.5,
      pos.y - FOOD_WIDTH * 0.7,
      FOOD_WIDTH * 0.5
    );
    context.arcTo(
      pos.x + FOOD_WIDTH * 0.5,
      pos.y - FOOD_WIDTH * 0.3,
      pos.x,
      pos.y - FOOD_WIDTH * 0.3,
      FOOD_WIDTH * 0.5
    );
    context.fill();
  }
}
