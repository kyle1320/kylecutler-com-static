import View from "./View";

export default class ConnectionView extends View {
  constructor (nodeA, nodeB, parent, style) {
    super([], getDimensions(nodeA, nodeB, parent), {}, style);

    this.parent = parent;

    this.setEndpoint(0, nodeA);
    this.setEndpoint(1, nodeB);
    this.update();
  }

  setEndpoint(index, node) {
    if (this.data[index]) {
      this.data[index].removeListener('move', this.update);
      this.data[index].removeListener('remove', this.remove);
    }
    node.on('move', this.update);
    node.on('remove', this.remove);
    this.data[index] = node;
  }

  move(x, y) {

  }

  remove() {
    super.remove();

    this.data[0].data.disconnect(this.data[1].data);
  }

  update() {
    this.start = View.getRelativePosition(this.data[0], this.parent);
    this.end   = View.getRelativePosition(this.data[1], this.parent);

    this.dimensions = {
      x: Math.min(this.start.x, this.end.x),
      y: Math.min(this.start.y, this.end.y),
      width: Math.abs(this.start.x - this.end.x),
      height: Math.abs(this.start.y - this.end.y),
    };

    // TODO: update path here

    this.emit('update');
    this.emit('move', this);
  }

  getRenderOrder() {
    return -1;
  }

  intersects(x, y, grow = 0) {
    var { x: ax, y: ay } = this.start;
    var { x: bx, y: by } = this.end;

    var dx =  x - ax, dy =  y - ay;
    var lx = bx - ax, ly = by - ay;

    var lineSq = lx * lx + ly * ly;
    var diagSq = dx * dx + dy * dy;

    var tmp = lx * dx + ly * dy;
    if (tmp < 0) return diagSq <= grow * grow;
    var parallelSq = (tmp * tmp) / lineSq;
    if (parallelSq > lineSq) {
      var tx = x - bx, ty = y - by;
      return tx * tx + ty * ty <= grow * grow;
    }

    var perpSq = diagSq - parallelSq;

    return perpSq <= grow * grow;
  }

  draw(context) {
    var style = this.style.connection;

    context.save();

    var color = (this.data[0].data.get() || this.data[1].data.get())
                  ? style.colorOn
                  : style.colorOff;

    if (this.attributes.hover || this.attributes.active) {
      context.save();
      context.strokeStyle = this.attributes.active
                              ? this.style.general.selectedColor
                              : this.style.general.highlightColor;
      context.lineWidth = 0.5;
      context.lineJoin = 'round';
      context.beginPath();
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.end.x, this.end.y);
      context.closePath();
      context.stroke();
      context.restore();
    }

    context.strokeStyle = color;

    context.beginPath();
      context.moveTo(this.start.x, this.start.y);
      context.lineTo(this.end.x, this.end.y);
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
  };
}