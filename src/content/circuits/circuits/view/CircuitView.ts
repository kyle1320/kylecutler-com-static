import View from './View';
import NodeView from './NodeView';
import { parse } from '../model/parse';
import Circuit from '../model/Circuit';
import { Dimensions, Position, PositionalTree } from '../model/types';

export default class CircuitView extends View {
  public data: Circuit;
  public rotation: number;
  private children: NodeView[];
  private path: Path2D;

  public constructor(data: Circuit, x: number, y: number) {
    super(
      data,
      {
        x,
        y,
        width: data.definition.size.width,
        height: data.definition.size.height
      },
      {}
    );

    // represents the number of 90-degree rotations this circuit has undergone.
    // the top-left of the circuit always remains at the current position.
    this.rotation = 0;

    this.children = data.definition.pins.map((pin, i) => {
      const node = new NodeView(data.pins[i], pin.x, pin.y);
      node.setParent(this);

      node.on('update', this.update);

      return node;
    });
    this.path = new Path2D(this.data.definition.style.path);
  }

  public move(x: number, y: number) {
    super.move(x, y);

    this.children.forEach((child) => child.emit('move', child));
  }

  public rotate(delta: number) {
    if (delta % 4 === 0) return;

    this.rotation = (((this.rotation + delta) % 4) + 4) % 4;

    this.emit('move', this);
    this.children.forEach((child) => child.emit('move', child));
  }

  public getDimensions(): Dimensions {
    const dims = super.getDimensions();

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

  public remove() {
    super.remove();

    this.children.forEach((child) => child.remove());

    this.data.disconnect();
  }

  public findAll(x: number, y: number): PositionalTree {
    const { x: relX, y: relY } = getUnrotatedPosition(
      {
        x: x - this.dimensions.x,
        y: y - this.dimensions.y
      },
      this.dimensions,
      this.rotation
    );

    return {
      data: this,
      x: relX,
      y: relY,
      children: this.children
        .filter((view) => view.intersects(relX, relY, 0.5))
        .map((view) => view.findAll(relX, relY))
    };
  }

  public getRelativePosition(x: number, y: number) {
    const { x: rx, y: ry } = getRotatedPosition(
      { x, y },
      this.dimensions,
      this.rotation
    );
    return super.getRelativePosition(rx, ry);
  }

  private eval(stmt: string) {
    const scope = this.data.pins.map((pin) => pin.get());
    const expr = parse(stmt);
    return expr(scope);
  }

  public draw(context: CanvasRenderingContext2D) {
    const style = this.style.general.gate;

    const { x, y } = this.getDimensions();

    context.save();

    context.translate(x, y);
    const trans = getRotatedPosition(
      { x: 0, y: 0 },
      this.dimensions,
      this.rotation
    );
    context.translate(trans.x, trans.y);
    context.rotate((this.rotation * Math.PI) / 2);

    if (this.attributes.hover || this.attributes.active) {
      context.save();
      context.strokeStyle = this.attributes.active
        ? this.style.general.selectedColor
        : this.style.general.highlightColor;
      context.lineWidth = 1;
      context.lineJoin = 'round';
      context.stroke(this.path);
      context.restore();
    }

    context.fillStyle = this.data.definition.style.fillColor
      ? this.eval(this.data.definition.style.fillColor)
      : style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.fill(this.path);
    context.stroke(this.path);

    this.children.forEach((view) => view.draw(context));

    context.restore();
  }
}

function getRotatedPosition(
  pos: Position,
  dim: Dimensions,
  rotation: number
): Position {
  switch (rotation) {
    case 0:
      return { x: pos.x, y: pos.y };
    case 1:
      return { x: dim.height - pos.y, y: pos.x };
    case 2:
      return { x: dim.width - pos.x, y: dim.height - pos.y };
    case 3:
      return { x: pos.y, y: dim.width - pos.x };
  }
  return null;
}

function getUnrotatedPosition(
  pos: Position,
  dim: Dimensions,
  rotation: number
): Position {
  switch (rotation) {
    case 0:
      return { x: pos.x, y: pos.y };
    case 1:
      return { x: pos.y, y: dim.height - pos.x };
    case 2:
      return { x: dim.width - pos.x, y: dim.height - pos.y };
    case 3:
      return { x: dim.width - pos.y, y: pos.x };
  }
  return null;
}
