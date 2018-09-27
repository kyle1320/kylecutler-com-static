import { defaultStyle } from './styles';

const EventEmitter = require('events');

const viewKey = Symbol("View");

var uniqueViewId = 0;

export default class View extends EventEmitter {
  constructor (data, dimensions, attributes = {}, style = defaultStyle) {
    super();

    this._id = uniqueViewId++;

    if (data && data[viewKey]) {
      throw new Error("Cannot bind datasource to two views!");
    }

    this.data = data;
    if (data) data[viewKey] = this;

    this.dimensions = dimensions;
    this.attributes = attributes;
    this.style = style;
    this.parent = null;

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

  intersects(x, y, grow = 0) {
    var dim = this.dimensions;

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

  draw(context) {
    throw new Error("View subclass must override method draw()");
  }

  static getViewFromDatasource(data) {
    return data[viewKey];
  }

  static getRelativePosition(view, ancestor) {
    var pos = { x: 0, y: 0 };

    do {
      var dimens = view.getDimensions();

      pos.x += dimens.x;
      pos.y += dimens.y;

      view = view.parent;
      if (!view) throw new Error("Did not find ancestor view");
    } while (view !== ancestor);

    return pos;
  }
}