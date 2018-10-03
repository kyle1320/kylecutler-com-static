import View from "./View";
import KDTree from "./spatial/KDTree";
import BoundingBox from "./spatial/BoundingBox";
import bufferEvent from '../utils/eventBuffer';
import ConnectionView from "./ConnectionView";

export default class CanvasView extends View {
  constructor (canvasEl, style) {
    super(
      null,
      { x: 0, y: 0, width: Infinity, height: Infinity },
      { scale: 20 },
      style
    );

    this.canvas = canvasEl;
    this.children = new KDTree();

    this.previewChild = null;
    this.selectionArea = null;

    this.update      = view => this.emit('update');
    this.removeChild = view => {
      this.children.remove(view);
      this.update();
    }
    this.moveChild   = view => {
      // TODO: check for collisions (somewhere)

      this.children.remove(view);

      this.children.insert(view, new BoundingBox(view.getDimensions()));

      this.update();
    }

    this.draw = this.draw.bind(this);
  }

  remove() {

  }

  addChild(view) {
    this.children.insert(view, new BoundingBox(view.getDimensions()));

    view.parent = this;

    view.on('update', this.update);
    view.on('remove', this.removeChild);
    view.on('move', this.moveChild);

    this.update(view);
  }

  setPreviewChild(view) {
    this.previewChild = view;

    if (view) {
      view.parent = this;
      view.on('update', this.update);
      view.on('move', this.update);
    }

    this.update();
  }

  addPreviewChild() {
    if (this.previewChild) {
      this.addChild(this.previewChild);
      this.previewChild = null;
    }
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
                  .filter(view => view.intersects(gridX, gridY, 0.5))
                  .map(view => view.findAll(gridX, gridY))
    };
  }

  move(x, y) {
    super.move(x, y);
    this.update();
  }

  startSelection(x, y) {
    this.selectionArea = {
      startX: x,
      startY: y,
      endX: x,
      endY: y
    };
    this.update();
  }

  endSelection(x, y) {
    this.selectionArea.endX = x;
    this.selectionArea.endY = y;
    this.update();
  }

  clearSelection() {
    this.selectionArea = null;
    this.update();
  }

  getSelected() {
    if (!this.selectionArea) return null;

    var boundingBox = new BoundingBox(0, 0, 0, 0);
    boundingBox.min = [
      Math.min(this.selectionArea.startX, this.selectionArea.endX) - 0.4,
      Math.min(this.selectionArea.startY, this.selectionArea.endY) - 0.4
    ];
    boundingBox.max = [
      Math.max(this.selectionArea.startX, this.selectionArea.endX) + 0.4,
      Math.max(this.selectionArea.startY, this.selectionArea.endY) + 0.4
    ];

    return {
      view: this,
      children: this.children
        .find(boundingBox)

        // connections must be fully enclosed in order to be selected
        .filter(v => !(v instanceof ConnectionView) ||
                    boundingBox.contains(new BoundingBox(v.getDimensions())))
        .map(view => ({ view }))
    };
  }

  drawBuffered() {
    bufferEvent('redraw-' + this._id, this.draw, true);
  }

  draw() {
    var context = this.canvas.getContext("2d");

    var scale = this.attributes.scale * (window.devicePixelRatio || 1);
    var style = this.style;
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
    this.children
      .find(viewport)
      .filter(view => !view.attributes.hidden)
      .sort((a, b) => a.getRenderOrder() - b.getRenderOrder())
      .forEach(item => item.draw(context));

    if (this.previewChild && !this.previewChild.attributes.hidden) {
      context.globalAlpha = 0.5;
      this.previewChild.draw(context);
    }

    this.children.draw(context, viewport);

    if (this.selectionArea) {
      context.strokeStyle = style.general.selectionStrokeColor;
      context.fillStyle = style.general.selectionFillColor;

      context.beginPath();
        context.rect(
          this.selectionArea.startX,
          this.selectionArea.startY,
          this.selectionArea.endX - this.selectionArea.startX,
          this.selectionArea.endY - this.selectionArea.startY,
        );
      context.closePath();

      context.fill();
      context.stroke();
    }

    context.restore();
  }
}