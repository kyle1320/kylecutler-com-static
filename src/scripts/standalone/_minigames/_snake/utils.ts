import { Vec2, Unit, BoundingBox, Direction } from './types';

export const SNAKE_WIDTH = 0.7;
export const GAME_SCALE = 14;

export function drawDot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
}

export function getBoundingBox(
  a: Vec2<number>,
  b: Vec2<number>,
  width: number
) {
  return {
    minX: Math.min(a.x, b.x) - (width / 2),
    minY: Math.min(a.y, b.y) - (width / 2),
    maxX: Math.max(a.x, b.x) + (width / 2),
    maxY: Math.max(a.y, b.y) + (width / 2)
  };
}

export function getForwardBoundingBox(
  start: Vec2<number>,
  direction: Vec2<Unit>,
  width: number,
  min: number,
  len: number
): BoundingBox {
  var a = {
    x: start.x + direction.x * min,
    y: start.y + direction.y * min
  };
  var b = {
    x: start.x + direction.x * (min + len),
    y: start.y + direction.y * (min + len)
  };

  return {
    minX: Math.min(a.x, b.x) - (width / 2) * Math.abs(direction.y),
    minY: Math.min(a.y, b.y) - (width / 2) * Math.abs(direction.x),
    maxX: Math.max(a.x, b.x) + (width / 2) * Math.abs(direction.y),
    maxY: Math.max(a.y, b.y) + (width / 2) * Math.abs(direction.x)
  };
}

export function boundingBoxesIntersect(a: BoundingBox, b: BoundingBox) {
  return a.maxX > b.minX && a.minX < b.maxX
      && a.maxY > b.minY && a.minY < b.maxY;
}

export function dirTowards(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return { x: Math.sign(dx) || 1, y: 0 };
  else                             return { x: 0, y: Math.sign(dy) || 1 };
}

export function scaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  var res = window.devicePixelRatio || 1;

  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';

  canvas.width *= res;
  canvas.height *= res;

  context.scale(res, res);
}

export function accessUnsafe<T>(obj: any, member: string): T {
  return obj[member] as T;
}