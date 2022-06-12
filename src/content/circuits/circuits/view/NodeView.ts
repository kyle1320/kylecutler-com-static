import View from './View';
import Node from '../model/Node';

export default class NodeView extends View {
  public data: Node;

  public constructor(data: Node, x: number, y: number) {
    super(data, { x, y, width: 0, height: 0 }, {});
  }

  public remove() {
    super.remove();

    this.data.disconnect();
  }

  public intersects(x: number, y: number, grow = 0) {
    const dx = x - this.dimensions.x;
    const dy = y - this.dimensions.y;

    return dx * dx + dy * dy <= grow * grow;
  }

  public draw(context: CanvasRenderingContext2D) {
    const style = this.style.node;

    const strokeColor = this.data.get()
      ? style.strokeColorOn
      : style.strokeColorOff;
    const { x, y } = this.getDimensions();

    context.fillStyle = style.fillColorOff;
    context.strokeStyle = strokeColor;

    if (this.data.isSource) {
      context.beginPath();
      context.arc(
        x,
        y,
        0.15 + this.style.general.lineWidth * 2,
        0,
        2 * Math.PI
      );
      context.closePath();
      context.fill();
      context.stroke();
    }

    if (this.data.get()) {
      context.fillStyle = style.fillColorOn;
    }

    context.beginPath();
    context.arc(x, y, 0.15, 0, 2 * Math.PI);
    context.closePath();

    context.fill();
    context.stroke();

    if (this.attributes.hover || this.attributes.active) {
      context.fillStyle = this.attributes.active
        ? this.style.general.selectedColor
        : this.style.general.highlightColor;
      context.beginPath();
      context.arc(x, y, 0.5, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    }
  }
}
