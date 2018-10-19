import { Vec2 } from '../types';
import { drawDot } from '../utils';

export default class Food {
  public position: Vec2<number>;

  public constructor(x: number, y: number) {
    this.move(x, y);
  }

  public move(x: number, y: number) {
    this.position = {x, y};
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#f44336';
    drawDot(context, this.position.x, this.position.y, 0.5);

    context.fillStyle = '#00897B';
    context.beginPath();
    context.moveTo(this.position.x, this.position.y - 0.3);
    context.arcTo(
      this.position.x, this.position.y - 0.8,
      this.position.x + 0.5, this.position.y - 0.7, 0.5
    );
    context.arcTo(
      this.position.x + 0.5, this.position.y - 0.3,
      this.position.x, this.position.y - 0.3, 0.5
    );
    context.fill();
  }
}