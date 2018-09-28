import View from "./View";

export default class ConnectionView extends View {
  constructor (nodeA, nodeB, parent, style) {
    super([], getDimensions(nodeA, nodeB, parent), {}, style);

    this.parent = parent;

    this.setEndpoint(0, nodeA);
    this.setEndpoint(1, nodeB);
  }

  setEndpoint(index, node) {
    node.on('move', () => this.update());
    node.on('remove', () => this.remove());
    node.on('update', this.update);
    this.data[index] = node;
  }

  remove() {
    super.remove();

    this.data[0].data.disconnect(this.data[1].data);
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

    if (this.attributes.hover) {
      context.save();
      context.strokeStyle = this.style.general.highlightColor;
      context.lineWidth = 0.5;
      context.lineJoin = 'round';
      context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
      context.closePath();
      context.stroke();
      context.restore();
    }

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