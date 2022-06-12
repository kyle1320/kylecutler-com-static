import View from './View';
import NodeView from './NodeView';

import { Position } from '../model/types';

export default class ConnectionView extends View {
  public data: [NodeView, NodeView];
  private start: Position;
  private end: Position;

  public constructor(nodeA: NodeView, nodeB: NodeView, parent?: View) {
    super([], getDimensions(nodeA, nodeB, parent), {});

    this.parent = parent;

    this.setEndpoint(0, nodeA);
    this.setEndpoint(1, nodeB);
    this.update();
  }

  public setEndpoint(index: 0 | 1, node: NodeView) {
    if (this.data[index]) {
      this.data[index].removeListener('move', this.update);
      this.data[index].removeListener('remove', this.remove);
    }
    node.on('move', this.update);
    node.on('remove', this.remove);
    this.data[index] = node;
  }

  public move(x: number, y: number) {}

  public remove() {
    super.remove();

    this.data[0].data.disconnect(this.data[1].data);
  }

  public setParent(parent: View) {
    this.parent = parent;

    this.update();
  }

  public update() {
    this.start = View.getRelativePosition(this.data[0], this.parent);
    this.end = View.getRelativePosition(this.data[1], this.parent);

    this.attributes.zIndex =
      Math.min(this.data[0].getRenderOrder(), this.data[1].getRenderOrder()) -
      0.001;

    this.dimensions = {
      x: Math.min(this.start.x, this.end.x),
      y: Math.min(this.start.y, this.end.y),
      width: Math.abs(this.start.x - this.end.x),
      height: Math.abs(this.start.y - this.end.y)
    };

    // TODO: update path here

    this.emit('update');
    this.emit('move', this);
  }

  public intersects(x: number, y: number, grow = 0) {
    const { x: ax, y: ay } = this.start;
    const { x: bx, y: by } = this.end;

    const dx = x - ax,
      dy = y - ay;
    const lx = bx - ax,
      ly = by - ay;

    const lineSq = lx * lx + ly * ly;
    const diagSq = dx * dx + dy * dy;

    const tmp = lx * dx + ly * dy;
    if (tmp < 0) return diagSq <= grow * grow;
    const parallelSq = (tmp * tmp) / lineSq;
    if (parallelSq > lineSq) {
      const tx = x - bx,
        ty = y - by;
      return tx * tx + ty * ty <= grow * grow;
    }

    const perpSq = diagSq - parallelSq;

    return perpSq <= grow * grow;
  }

  public draw(context: CanvasRenderingContext2D) {
    const style = this.style.connection;

    const color =
      this.data[0].data.get() || this.data[1].data.get()
        ? style.colorOn
        : style.colorOff;

    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.closePath();

    if (this.attributes.hover || this.attributes.active) {
      context.save();
      context.strokeStyle = this.attributes.active
        ? this.style.general.selectedColor
        : this.style.general.highlightColor;
      context.lineWidth = 0.5;
      context.lineJoin = 'round';
      context.stroke();
      context.restore();
    }

    context.strokeStyle = color;

    context.stroke();
  }
}

function getDimensions(nodeA: NodeView, nodeB: NodeView, parent: View) {
  const start = View.getRelativePosition(nodeA, parent);
  const end = View.getRelativePosition(nodeB, parent);

  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y)
  };
}
