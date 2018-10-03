export default class BoundingBox {
  constructor (x, y, width, height) {
    var dims = typeof x === 'object' ? x : { x, y, width, height };
    this.min = [dims.x, dims.y];
    this.max = [dims.x + dims.width, dims.y + dims.height];
  }

  intersects(other) {
    return (this.min[0] < other.max[0] && this.max[0] > other.min[0]) &&
           (this.min[1] < other.max[1] && this.max[1] > other.min[1]);
  }

  contains(other) {
    return (this.min[0] < other.min[0] && this.max[0] > other.max[0]) &&
           (this.min[1] < other.min[1] && this.max[1] > other.max[1]);
  }

  grow(amount) {
    return new BoundingBox({
      x: this.min[0] - amount,
      y: this.min[1] - amount,
      width: (this.max[0] - this.min[0]) + amount * 2,
      height: (this.max[1] - this.min[1]) + amount * 2
    });
  }
}