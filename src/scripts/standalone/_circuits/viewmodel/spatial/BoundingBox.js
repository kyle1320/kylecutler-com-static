export default class BoundingBox {
  constructor (x, y, width, height) {
    this.min = [x, y];
    this.max = [x + width, y + height];
  }

  intersects(other) {
    return (this.min[0] < other.max[0] && this.max[0] > other.min[0]) &&
           (this.min[1] < other.max[1] && this.max[1] > other.min[1]);
  }

  grow(amount) {
    return new BoundingBox(
      this.min[0] - amount,
      this.min[1] - amount,
      (this.max[0] - this.min[0]) + amount * 2,
      (this.max[1] - this.min[1]) + amount * 2
    );
  }
}