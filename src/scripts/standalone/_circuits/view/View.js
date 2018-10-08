import { defaultStyle } from './styles';

const EventEmitter = require('events');

const viewKey = Symbol('View');

var uniqueViewId = 0;

export default class View extends EventEmitter {
  constructor (data, dimensions, attributes = {}, style = defaultStyle) {
    super();

    this._id = uniqueViewId++;

    if (data && data[viewKey]) {
      throw new Error('Cannot bind datasource to two views!');
    }

    this.data = data;
    if (data) data[viewKey] = this;

    this.dimensions = dimensions;
    this.attributes = attributes;
    this.style = style;
    this.parent = null;

    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);

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
      return true;
    }
    return false;
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

  update() {
    this.emit('update', this);
  }

  setParent(parent) {
    this.parent = parent;
  }

  getDimensions() {
    return this.dimensions;
  }

  intersects(x, y, grow = 0) {
    var dim = this.getDimensions();

    return (dim.x <= x + grow) &&
           (dim.y <= y + grow) &&
           (dim.x + dim.width >= x - grow) &&
           (dim.y + dim.height >= y - grow);
  }

  findAll(x, y) {
    var relX = x - this.dimensions.x;
    var relY = y - this.dimensions.y;

    return {
      view: this,
      x: relX, y: relY,
      children: []
    };
  }

  getRenderOrder() {
    return 0;
  }

  getRelativePosition(x, y) {
    return {
      x: x + this.dimensions.x,
      y: y + this.dimensions.y
    };
  }

  draw(context) {
    throw new Error('View subclass must override method draw()');
  }

  static getViewFromDatasource(data) {
    return data[viewKey];
  }

  static getRelativePosition(view, ancestor) {
    var pos = view.getDimensions();

    view = view.parent;
    while (view != ancestor) {
      if (view) {
        pos = view.getRelativePosition(pos.x, pos.y);
      } else {
        throw new Error('Did not find ancestor view');
      }

      view = view.parent;
    }

    return pos;
  }
}