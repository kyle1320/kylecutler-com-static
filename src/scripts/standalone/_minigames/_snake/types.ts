export interface Vec2<T extends number> {
  x: T,
  y: T
}

export type Unit = 0|1|-1;

export type Direction =
  {readonly x: -1 | 1, readonly y: 0} |
  {readonly x: 0, readonly y: -1 | 1};

export interface BoundingBox {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
}