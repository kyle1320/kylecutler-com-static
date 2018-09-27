import View from "./View";

export default class ConnectionView extends View {
  constructor (nodeA, nodeB, parent, style) {
    super([nodeA, nodeB], getDimensions(nodeA, nodeB, parent), {}, style);

    this.parent = parent;

    nodeA.on('move', () => this.update());
    nodeB.on('move', () => this.update());
  }

  update() {
    this.dimensions = getDimensions(this.data[0], this.data[1], this.parent);

    // TODO: update path here
  }

  getRenderOrder() {
    return 1;
  }

  draw(context) {
    var style = this.style.connection;

    context.save();

    var color = (this.data[0].data.get() || this.data[1].data.get())
                  ? style.colorOn
                  : style.colorOff;
    var start = View.getRelativePosition(this.data[0], this.parent);
    var end = View.getRelativePosition(this.data[1], this.parent);

    context.strokeStyle = color;

    context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
    context.closePath();

    context.stroke();

    context.restore();
  }
}

function getDimensions(nodeA, nodeB, parent) {
  var start = View.getRelativePosition(nodeA, parent);
  var end = View.getRelativePosition(nodeB, parent);

  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
  }
}