const EventEmitter = require('events');

const viewKey = Symbol("View");

var uniqueViewId = 0;

export default class View extends EventEmitter {
  constructor (data, dimensions, attributes = {}) {
    super();

    this._id = uniqueViewId++;

    if (data && data[viewKey]) {
      throw new Error("Cannot bind datasource to two views!");
    }

    this.data = data;
    if (data) data[viewKey] = this;

    this.dimensions = dimensions;
    this.attributes = attributes;

    this.update = () => this.emit('update', this);

    if (data instanceof Array) {
      data.forEach(data => data.on('update', this.update));
    } else if (data) {
      this.data.on('update', this.update);
    }
  }

  setAttribute(name, value) {
    if (this.attributes[name] !== value) {
      this.attributes[name] = value;
      this.emit('update', this);
    }
  }

  move(x, y) {
    if (this.dimensions.x === x && this.dimensions.y === y)
      return;

    this.dimensions.x = x;
    this.dimensions.y = y;

    this.emit('move', this);
  }

  remove() {
    this.emit('remove', this);
  }

  getDimensions() {
    return this.dimensions;
  }

  overlaps(x, y, grow = 0) {
    var dim = this.getDimensions();

    return (dim.x <= x + grow) &&
           (dim.y <= y + grow) &&
           (dim.x + dim.width >= x - grow) &&
           (dim.y + dim.height >= y - grow);
  }

  draw(context) {
    throw new Error("View subclass must override method draw()");
  }

  static GetViewFromDatasource(data) {
    return data[viewKey];
  }
}