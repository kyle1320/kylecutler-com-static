import View from "./View";
import KDTree from "./spatial/KDTree";
import BoundingBox from "./spatial/BoundingBox";
import bufferEvent from '../utils/eventBuffer';

export default class CanvasView extends View {
  constructor (canvasEl, style) {
    super(
      null,
      { x: 0, y: 0, width: Infinity, height: Infinity },
      { scale: 20, style }
    );

    this.canvas = canvasEl;
    this.children = new KDTree();

    // TODO: draw connections !!!

    this.update    = view => this.emit('update');
    this.remove    = view => this.children.remove(view);
    this.moveChild = view => {
      // TODO: check for collisions (somewhere)

      this.children.remove(view);

      this.children.insert(view, new BoundingBox(view.getDimensions()));

      this.update();
    }

    this.draw = this.draw.bind(this);
  }

  addChild(view) {
    this.children.insert(view, new BoundingBox(view.getDimensions()));

    view.on('update', this.update);
    view.on('remove', this.remove);
    view.on('move', this.moveChild);

    this.update(view);
  }

  findChild(x, y, grow) {
    return this.children.find(new BoundingBox(x-grow, y-grow, grow*2, grow*2));
  }

  findAll(x, y) {
    var gridX = (x / this.attributes.scale) - this.dimensions.x;
    var gridY = (y / this.attributes.scale) - this.dimensions.y;

    return {
      view: this,
      x: gridX, y: gridY,
      children: this.children
                  .find(new BoundingBox(gridX - 0.5, gridY - 0.5, 1, 1))
                  .map(view => view.findAll(gridX, gridY))
    };
  }

  move(x, y) {
    super.move(x, y);
    this.update();
  }

  drawBuffered() {
    bufferEvent('redraw-' + this._id, this.draw);
  }

  draw() {
    var context = this.canvas.getContext("2d");

    var { scale, style } = this.attributes;

    var offsetX = -this.dimensions.x;
    var offsetY = -this.dimensions.y;

    context.save();

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // transform the context so that children can simply use grid coordinates
    context.transform(
      scale,
      0,
      0,
      scale,
      -offsetX * scale,
      -offsetY * scale
    );

    var width = context.canvas.width / scale;
    var height = context.canvas.height / scale;

    context.lineWidth = style.general.lineWidth;

    for (var x = Math.ceil(offsetX); x < offsetX + width; x++) {
      context.strokeStyle = style.general.gridColor;
      context.beginPath();
      context.moveTo(x, offsetY);
      context.lineTo(x, offsetY + height);
      context.closePath();
      context.stroke();
    }

    for (var y = Math.ceil(offsetY); y < offsetY + height; y++) {
      context.strokeStyle = style.general.gridColor;
      context.beginPath();
      context.moveTo(offsetX, y);
      context.lineTo(offsetX + width, y);
      context.closePath();
      context.stroke();
    }

    var viewport = new BoundingBox(offsetX, offsetY, width, height);
    this.children.find(viewport).forEach(function (item) {
      item.draw(context);
    });

    context.restore();
  }
}