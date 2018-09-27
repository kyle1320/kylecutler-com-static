import View from "./View";

export default class NodeView extends View {
  constructor (data, x, y, style) {
    super(data, { x, y, width: 0, height: 0 }, {}, style);
  }

  getRenderOrder() {
    return 3;
  }

  draw(context) {
    var style = this.style.node;

    context.save();

    var strokeColor = this.data.get()    ? style.strokeColorOn   : style.strokeColorOff;
    var fillColor   = this.data.isSource ? style.fillColorSource : style.fillColorReceiver;
    var {x, y} = this.getDimensions();

    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;

    context.beginPath();
        context.arc(x, y, style.size, 0, 2 * Math.PI);
    context.closePath();

    context.fill();
    context.stroke();

    context.restore();
  }
}