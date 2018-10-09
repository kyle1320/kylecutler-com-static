import View from './View';
import NodeView from './NodeView';
import parse from '../model/parse';
import Circuit from '../model/Circuit';
import { Dimensions, Position, PositionalTree } from '../model/types';

require('path2d-polyfill');

export default class CircuitView extends View {
  data: Circuit;
  rotation: number;
  children: NodeView[];

  constructor (data: Circuit, x: number, y: number) {
    super(data, {
      x, y,
      width: data.definition.size.width,
      height: data.definition.size.height
    }, {});

    // represents the number of 90-degree rotations this circuit has undergone.
    // the top-left of the circuit always remains at the current position.
    this.rotation = 0;

    this.children = data.definition.pins.map((pin, i) => {
      var node = new NodeView(data.pins[i], pin.x, pin.y);
      node.parent = this;

      node.on('update', this.update);

      return node;
    });
  }

  move(x: number, y: number) {
    super.move(x, y);

    this.children.forEach(child => child.emit('move'));
  }

  rotate(delta: number) {
    if (delta % 4 === 0) return;

    this.rotation = ((this.rotation + delta) % 4 + 4) % 4;

    this.emit('move', this);
    this.children.forEach(child => child.emit('move'));
  }

  getDimensions(): Dimensions {
    var dims = super.getDimensions();

    if (this.rotation % 2 !== 0) {
      return {
        x: dims.x,
        y: dims.y,
        width: dims.height,
        height: dims.width
      };
    }

    return dims;
  }

  remove() {
    super.remove();

    this.children.forEach(child => child.remove());

    this.data.disconnect();
  }

  findAll(x: number, y: number): PositionalTree {
    var { x: relX, y: relY } = getUnrotatedPosition({
      x: x - this.dimensions.x,
      y: y - this.dimensions.y
    }, this.dimensions, this.rotation);

    return {
      data: this,
      x: relX, y: relY,
      children: this.children
        .filter(view => view.intersects(relX, relY, 0.5))
        .map(view => view.findAll(relX, relY))
    };
  }

  getRelativePosition(x: number, y: number) {
    var { x: rx, y: ry } = getRotatedPosition(
      {x, y}, this.dimensions, this.rotation
    );
    return super.getRelativePosition(rx, ry);
  }

  eval(stmt: string) {
    var scope = this.data.pins.map(pin => pin.get());
    var expr = parse(stmt);
    return expr(scope);
  }

  draw(context: CanvasRenderingContext2D) {
    var style = this.style.general.gate;

    var {x, y} = this.getDimensions();

    context.save();

    var path = new Path2D(this.data.definition.style.path);

    context.translate(x, y);
    var trans = getRotatedPosition(
      {x: 0, y: 0}, this.dimensions, this.rotation
    );
    context.translate(trans.x, trans.y);
    context.rotate(this.rotation * Math.PI / 2);

    if (this.attributes.hover || this.attributes.active) {
      context.save();
      context.strokeStyle = this.attributes.active
        ? this.style.general.selectedColor
        : this.style.general.highlightColor;
      context.lineWidth = 1;
      context.lineJoin = 'round';
      context.stroke(path);
      context.restore();
    }

    context.fillStyle = this.data.definition.style.fillColor
      ? this.eval(this.data.definition.style.fillColor)
      : style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.fill(path);
    context.stroke(path);

    this.children.forEach(view => view.draw(context));

    context.restore();
  }
}

function getRotatedPosition(
  pos: Position,
  dim: Dimensions,
  rotation: number
): Position {
  switch (rotation) {
  case 0: return { x: pos.x, y: pos.y };
  case 1: return { x: dim.height - pos.y, y: pos.x };
  case 2: return { x: dim.width - pos.x, y: dim.height - pos.y };
  case 3: return { x: pos.y, y: dim.width - pos.x };
  }
  return null;
}

function getUnrotatedPosition(
  pos: Position,
  dim: Dimensions,
  rotation: number
): Position {
  switch (rotation) {
  case 0: return { x: pos.x, y: pos.y };
  case 1: return { x: pos.y, y: dim.height - pos.x };
  case 2: return { x: dim.width - pos.x, y: dim.height - pos.y };
  case 3: return { x: dim.width - pos.y, y: pos.x };
  }
  return null;
}