import View from "./View";
import NodeView from "./NodeView";

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

      node.on('update', this.update);

      return node;
    });
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

  draw(context) {
    var style = this.style.general.gate;

    var {x, y, width, height} = this.getDimensions();

    if (this.attributes.hidden) return;

    context.save();

    context.fillStyle = style.fillColor;
    context.strokeStyle = style.strokeColor;

    context.translate(x, y);

    // TODO: fetch design from circuit definition
    var path = new Path2D(this.data.definition.path);
    context.fill(path);
    context.stroke(path);

    this.children.forEach(view => view.draw(context))

    context.restore();
  }
}