import View from "./View";
import NodeView from "./NodeView";

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

    // TODO: fetch design from circuit definition
    context.beginPath();
        context.rect(x, y, width, height);
    context.closePath();

    context.fill();
    context.stroke();

    // child position is relative to this view, but it doesn't need to know that
    context.translate(x, y);

    this.children.forEach(view => view.draw(context))

    context.restore();
  }
}