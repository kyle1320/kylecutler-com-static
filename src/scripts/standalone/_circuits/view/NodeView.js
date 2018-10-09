import View from './View';
import CircuitView from './CircuitView';

export default class NodeView extends View {
  constructor (data, x, y, style) {
    super(data, { x, y, width: 0, height: 0 }, {}, style);
  }

  remove() {
    super.remove();

    this.data.disconnect();
  }

  getRenderOrder() {
    return (this.parent instanceof CircuitView)
      ? this.parent.getRenderOrder()
      : super.getRenderOrder();
  }

  intersects(x, y, grow = 0) {
    var dx = x - this.dimensions.x;
    var dy = y - this.dimensions.y;

    return (dx * dx + dy * dy) <= (grow * grow);
  }

  draw(context) {
    var style = this.style.node;

    context.save();

    var strokeColor = this.data.get()
      ? style.strokeColorOn
      : style.strokeColorOff;
    var {x, y} = this.getDimensions();

    context.fillStyle = style.fillColorOff;
    context.strokeStyle = strokeColor;

    if (this.data.isSource) {
      context.beginPath();
      context.arc(
        x, y, 0.15 + this.style.general.lineWidth * 2, 0, 2 * Math.PI
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
      context.save();
      context.fillStyle = this.attributes.active
        ? this.style.general.selectedColor
        : this.style.general.highlightColor;
      context.beginPath();
      context.arc(x, y, .5, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }

    context.restore();
  }
}