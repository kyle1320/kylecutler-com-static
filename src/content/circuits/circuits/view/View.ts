import { defaultStyle } from './styles';
import { Dimensions, Position, PositionalTree } from '../model/types';

import { EventEmitter } from '~/src/common/js/utils';

const viewKey = Symbol('View');

let uniqueViewId = 0;

export default abstract class View extends EventEmitter<{
  update: void;
  move: View;
  remove: View;
}> {
  public attributes: {
    hidden?: boolean;
    hover?: boolean;
    active?: boolean;
    [key: string]: any;
  };
  public data: any;

  // TODO: make this protected
  public dimensions: Dimensions;
  protected style: any;
  protected parent: View;
  protected _id: number;

  public abstract draw(context: CanvasRenderingContext2D): void;

  public constructor(
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
      data.forEach((data) => data.on('update', this.update));
    } else if (data) {
      this.data.on('update', this.update);
    }
  }

  public setAttribute(name: string, value: any): boolean {
    if (this.attributes[name] !== value) {
      this.attributes[name] = value;
      this.emit('update');
      return true;
    }
    return false;
  }

  public move(x: number, y: number) {
    if (this.dimensions.x === x && this.dimensions.y === y) return;

    this.dimensions.x = x;
    this.dimensions.y = y;

    this.emit('move', this);
  }

  public remove() {
    this.emit('remove', this);
  }

  public update() {
    this.emit('update');
  }

  public setParent(parent: View) {
    this.parent = parent;
  }

  public getDimensions(): Dimensions {
    return this.dimensions;
  }

  public intersects(x: number, y: number, grow = 0): boolean {
    const dim = this.getDimensions();

    return (
      dim.x <= x + grow &&
      dim.y <= y + grow &&
      dim.x + dim.width >= x - grow &&
      dim.y + dim.height >= y - grow
    );
  }

  public findAll(x: number, y: number): PositionalTree {
    const relX = x - this.dimensions.x;
    const relY = y - this.dimensions.y;

    return {
      data: this,
      x: relX,
      y: relY,
      children: []
    };
  }

  public getRenderOrder() {
    return this.attributes.zIndex || 0;
  }

  public getRelativePosition(x: number, y: number): Position {
    return {
      x: x + this.dimensions.x,
      y: y + this.dimensions.y
    };
  }

  public static getViewFromDatasource(data: any) {
    return data[viewKey];
  }

  public static getRelativePosition(view: View, ancestor?: View): Position {
    const { x, y } = view.getDimensions();
    let pos = { x, y } as Position;

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
