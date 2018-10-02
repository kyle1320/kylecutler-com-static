import View from "./View";
import NodeView from "./NodeView";
import parse from '../model/parse';

require('path2d-polyfill');

export default class CircuitView extends View {
  constructor (data, x, y, style) {
    super(data, {
      x, y,
      width: data.definition.size.width,
      height: data.definition.size.height
    }, {}, style);

    this.children = data.definition.pins.map((pin, i) => {
      var node = new NodeView(data.pins[i], pin.x, pin.y, style);
      node.parent = this;

      node.on('update', this.update);

      return node;
    });
  }

  move(x, y) {
    super.move(x, y);

    this.children.forEach(child => child.emit('move'));
  }

  remove() {
    super.remove();

    this.children.forEach(child => child.remove());

    this.data.disconnect();
  }

  findAll(x, y) {
    var relX = x - this.dimensions.x;
    var relY = y - this.dimensions.y;

    return {
      view: this,
      x: relX, y: relY,
      children: this.children
                  .filter(view => view.intersects(relX, relY, 0.5))
                  .map(view => view.findAll(relX, relY))
    };
  }

  getRenderOrder() {
    return this.attributes.zIndex || 0;
  }

  eval(stmt) {
    var scope = this.data.pins.map(pin => pin.get());
    var expr = parse(stmt);
    return expr(scope);
  }

  draw(context) {
    var style = this.style.general.gate;

    var {x, y} = this.getDimensions();

    context.save();

    var path = new Path2D(this.data.definition.style.path);

    context.translate(x, y);

    if (this.attributes.hover) {
      context.save();
      context.strokeStyle = this.style.general.highlightColor;
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

    this.children.forEach(view => view.draw(context))

    context.restore();
  }
}