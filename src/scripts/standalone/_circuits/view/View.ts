import { defaultStyle } from './styles';
import { Dimensions, Position, PositionalTree } from '../model/types';

const EventEmitter = require('events');

const viewKey = Symbol('View');

var uniqueViewId = 0;

export default class View extends EventEmitter {
  dimensions: Dimensions;
  attributes: {
    hidden?: boolean,
    hover?: boolean,
    active?: boolean,
    [key: string]: any
  };
  style: any;
  parent: View;

  constructor (
    data: any,
    dimensions: Dimensions,
    attributes = {},
    style = defaultStyle
  ) {
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

  setAttribute(name: string, value: any): boolean {
    if (this.attributes[name] !== value) {
      this.attributes[name] = value;
      this.emit('update', this);
      return true;
    }
    return false;
  }

  move(x: number, y: number) {
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

  setParent(parent: View) {
    this.parent = parent;
  }

  getDimensions(): Dimensions {
    return this.dimensions;
  }

  intersects(x: number, y: number, grow: number = 0): boolean {
    var dim = this.getDimensions();

    return (dim.x <= x + grow) &&
           (dim.y <= y + grow) &&
           (dim.x + dim.width >= x - grow) &&
           (dim.y + dim.height >= y - grow);
  }

  findAll(x: number, y: number): PositionalTree {
    var relX = x - this.dimensions.x;
    var relY = y - this.dimensions.y;

    return {
      data: this,
      x: relX, y: relY,
      children: []
    };
  }

  getRenderOrder() {
    return this.attributes.zIndex || 0;
  }

  getRelativePosition(x: number, y: number): Position {
    return {
      x: x + this.dimensions.x,
      y: y + this.dimensions.y
    };
  }

  draw(context: CanvasRenderingContext2D) {
    throw new Error('View subclass must override method draw()');
  }

  static getViewFromDatasource(data: any) {
    return data[viewKey];
  }

  static getRelativePosition(view: View, ancestor?: View): Position {
    var { x, y } = view.getDimensions();
    var pos = { x, y } as Position;

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