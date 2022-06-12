import { Unit, Vec2, Direction } from '../types';
import {
  getForwardBoundingBox,
  getBoundingBox,
  boundingBoxesIntersect,
  drawDot,
  SNAKE_WIDTH,
  SNAKE_RADIUS
} from '../utils';

const DEFAULT_SPEED = 7.5;
const DEFAULT_LENGTH = 2;

export default class Snake {
  public foodEaten: number;

  private segments: Vec2<number>[];
  private direction: Vec2<Unit>;
  private speed: number;

  private moveStun: number;
  private chaseStun: number;

  public constructor(x: number, y: number, dx: Unit, dy: Unit) {
    this.reset(x, y, dx, dy);
  }

  public reset(x: number, y: number, dx: Unit, dy: Unit) {
    this.segments = [
      { x, y },
      { x, y }
    ];
    this.direction = { x: dx, y: dy };
    this.speed = DEFAULT_SPEED;
    this.foodEaten = 0;

    this.moveStun = 0;
    this.chaseStun = DEFAULT_LENGTH;
  }

  public update(dt: number) {
    this.move(dt * this.speed);
    this.chase(dt * this.speed);
  }

  public eat() {
    this.foodEaten++;
    this.speed += 0.1;
    this.chaseStun += 2;
  }

  public getHead(dt?: number): Vec2<number> {
    const head = this.segments[this.segments.length - 1];

    if (dt) {
      return {
        x: head.x + this.direction.x * this.speed * dt,
        y: head.y + this.direction.y * this.speed * dt
      };
    }

    return head;
  }

  public setDirection(dir: Direction) {
    if (dir.x === this.direction.x && dir.y === this.direction.y) return;
    if (dir.x === -this.direction.x && dir.y === -this.direction.y) return;

    const head = this.getHead();
    this.segments.push({ x: head.x, y: head.y });
    this.direction = dir;
  }

  public willEatSelf(lookaheadTime: number): boolean {
    const head = this.getHead();
    const dist = lookaheadTime * this.speed;
    const front = getForwardBoundingBox(
      head,
      this.direction,
      SNAKE_RADIUS,
      SNAKE_RADIUS * 1.01,
      dist
    );

    for (let i = this.segments.length - 3; i >= 0; i--) {
      const bb = getBoundingBox(
        this.segments[i + 1],
        this.segments[i],
        SNAKE_RADIUS
      );

      if (boundingBoxesIntersect(front, bb)) {
        return true;
      }
    }

    return false;
  }

  public draw(context: CanvasRenderingContext2D) {
    const head = this.getHead();
    const ax = this.direction.x;
    const ay = this.direction.y;

    // body
    context.strokeStyle = '#009688';
    context.lineWidth = SNAKE_WIDTH;
    context.beginPath();
    context.moveTo(head.x, head.y);
    for (let i = this.segments.length - 2; i >= 0; i--) {
      context.lineTo(this.segments[i].x, this.segments[i].y);
    }
    context.stroke();

    context.strokeStyle = '#00897B';
    context.lineWidth = SNAKE_WIDTH * 0.9;
    context.setLineDash([0, 0.99]);
    context.beginPath();
    context.moveTo(head.x, head.y);
    for (let i = this.segments.length - 2; i >= 0; i--) {
      context.lineTo(this.segments[i].x, this.segments[i].y);
    }
    context.stroke();
    context.setLineDash([]);

    // for head features, transform relative to the head
    context.save();
    context.translate(head.x, head.y);
    context.rotate(ax ? (Math.PI * (ax - 1)) / 2 : (Math.PI * ay) / 2);

    // tongue
    context.strokeStyle = '#f44336';
    context.lineWidth = 0.1;
    context.beginPath();
    context.moveTo(0.35, 0);
    context.arcTo(0.4, 0.05, 0.45, 0, 0.07);
    context.arcTo(0.5, -0.05, 0.55, 0, 0.07);
    context.stroke();

    context.fillStyle = '#00897B';
    drawDot(context, 0, 0, SNAKE_RADIUS);

    // eyes
    context.fillStyle = 'white';
    drawDot(context, 0, SNAKE_WIDTH * 0.25, SNAKE_WIDTH * 0.2);
    drawDot(context, 0, SNAKE_WIDTH * -0.25, SNAKE_WIDTH * 0.2);

    context.fillStyle = 'black';
    drawDot(context, SNAKE_WIDTH * 0.1, SNAKE_WIDTH * 0.23, SNAKE_WIDTH * 0.1);
    drawDot(context, SNAKE_WIDTH * 0.1, SNAKE_WIDTH * -0.23, SNAKE_WIDTH * 0.1);

    context.restore();
  }

  private move(dist: number) {
    const x = Math.min(this.moveStun, dist);
    this.moveStun -= x;
    dist -= x;

    if (dist <= 0) return;
    if (this.moveStun > 0) return;

    const head = this.getHead();

    head.x += this.direction.x * dist;
    head.y += this.direction.y * dist;
  }

  private chase(dist: number) {
    const x = Math.min(this.chaseStun, dist);
    this.chaseStun -= x;
    dist -= x;

    if (dist <= 0) return;
    if (this.chaseStun > 0) return;
    if (this.segments.length < 2) return; // TODO: game over

    const from = this.segments[0];
    const to = this.segments[1];

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // one of dx or dy should always be 0, so no need for Euclidean dist
    const d = Math.abs(dx) + Math.abs(dy);

    if (dist >= d) {
      this.segments.shift();
      this.chase(dist - d);
    } else {
      from.x += (dist * dx) / d;
      from.y += (dist * dy) / d;
    }
  }
}
