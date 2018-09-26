const EventEmitter = require('events');

const viewKey = Symbol("View");

export default class View extends EventEmitter {
  constructor (data, attributes, drawFunc) {
    super();

    if (data[viewKey]) {
      throw new Error("Cannot bind datasource to two views!");
    }

    this.data = data;
    data[viewKey] = this;

    this.attributes = attributes || {};
    this.drawFunc = drawFunc;

    this.children = [];

    const update = () => this.emit('update', this);

    if (data instanceof Array) {
      data.forEach(data => data.on('update', update));
    } else {
      this.data.on('update', update);
    }
  }

  addChild(data, attributes, drawFunc) {
    attributes.parent = this;
    var subview = new Subview(data, attributes, drawFunc);
    this.children.push(subview);
    return this;
  }

  setAttribute(name, value) {
    if (this.attributes[name] !== value) {
      this.attributes[name] = value;
      this.emit('update', this);
    }
  }

  move(x, y) {
    if (this.attributes.dimensions &&
        this.attributes.dimensions.x === x &&
        this.attributes.dimensions.y === y)
      return;

    this.attributes.dimensions.x = x;
    this.attributes.dimensions.y = y;

    this.emit('move', this);
  }

  remove() {
    this.emit('remove', this);
  }

  getDimensions() {
    return this.attributes.dimensions || { x: 0, y: 0, width: 0, height: 0 };
  }

  overlaps(x, y, grow = 0) {
    var dim = this.getDimensions();

    return (dim.x <= x + grow) &&
           (dim.y <= y + grow) &&
           (dim.x + dim.width >= x - grow) &&
           (dim.y + dim.height >= y - grow);
  }

  findChild(x, y, grow) {
    return this.children.find(view => view.overlaps(x, y, grow));
  }

  draw(context) {
    this.drawFunc && this.drawFunc(this, context);

    this.children.forEach(view => view.draw(context));
  }

  static GetViewFromDatasource(data) {
    return data[viewKey];
  }
}

class Subview extends View {
  constructor (data, attributes, drawFunc) {
    super(data, attributes, drawFunc);
  }

  getDimensions() {
    var {x, y} = this.attributes.parent.getDimensions();

    var dim = this.attributes.dimensions;

    return {
      x: dim.x + x,
      y: dim.y + y,
      width: dim.width,
      height: dim.height
    };
  }
}