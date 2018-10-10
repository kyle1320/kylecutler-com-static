import View from './View';
import KDTree from './spatial/KDTree';
import BoundingBox from './spatial/BoundingBox';
import bufferEvent from '../utils/eventBuffer';
import ConnectionView from './ConnectionView';

import { Position, PositionalTree } from '../model/types';

export default class CanvasView extends View {
  public canvas: HTMLCanvasElement;
  private children: KDTree<View>;
  private previewChild: View;
  private selectionArea: {
    startX: number, startY: number, endX: number, endY: number
  };
  private removeChild: (view: View) => void;
  private moveChild: (view: View) => void;

  constructor (canvasEl: HTMLCanvasElement) {
    super(
      null,
      { x: 0, y: 0, width: Infinity, height: Infinity },
      { scale: 20 }
    );

    this.canvas = canvasEl;
    this.children = new KDTree();

    this.previewChild = null;
    this.selectionArea = null;

    this.update = this.update.bind(this);
    this.removeChild = (view: View) => {
      this.children.remove(view);
      this.update();
    };
    this.moveChild   = (view: View) => {
      // TODO: check for collisions (somewhere)

      this.children.remove(view);

      this.children.insert(view, new BoundingBox(view.getDimensions()));

      this.update();
    };

    this.draw = this.draw.bind(this);
  }

  public remove() {

  }

  public addChild(view: View) {
    view.setParent(this);

    this.children.insert(view, new BoundingBox(view.getDimensions()));

    view.on('update', this.update);
    view.on('remove', this.removeChild);
    view.on('move', this.moveChild);

    this.update();
  }

  public setPreviewChild(view: View) {
    this.previewChild = view;

    if (view) {
      view.setParent(this);
      view.on('update', this.update);
      view.on('move', this.update);
    }

    this.update();
  }

  public addPreviewChild() {
    if (this.previewChild) {
      this.addChild(this.previewChild);
      this.previewChild = null;
    }
  }

  public findChild(x: number, y: number, grow: number): View[] {
    return this.children.find(new BoundingBox(x-grow, y-grow, grow*2, grow*2));
  }

  public findAll(x: number, y: number): PositionalTree {
    var gridX = (x / this.attributes.scale) - this.dimensions.x;
    var gridY = (y / this.attributes.scale) - this.dimensions.y;

    return {
      data: this,
      x: gridX, y: gridY,
      children: this.children
        .find(new BoundingBox(gridX - 0.5, gridY - 0.5, 1, 1))
        .filter(view => view.intersects(gridX, gridY, 0.5))
        .sort((a, b) => b.getRenderOrder() - a.getRenderOrder())
        .map(view => view.findAll(gridX, gridY))
    };
  }

  public move(x: number, y: number) {
    super.move(x, y);
    this.update();
  }

  public zoomRel(scale: number, cx: number, cy: number) {
    this.zoomAbs((scale - 1) * this.attributes.scale, cx, cy);
  }

  public zoomAbs(delta: number, cx: number, cy: number) {
    var { x, y } = this.getDimensions();
    var curScale = this.attributes.scale;
    var newScale = Math.min(70, Math.max(5, curScale + delta));
    var factor = curScale / newScale;
    var offsetX = (cx + x) * (1 - factor);
    var offsetY = (cy + y) * (1 - factor);

    this.move(x - offsetX, y - offsetY);
    this.setAttribute('scale', newScale);
  }

  public getCoord(clientX: number, clientY: number): Position {
    return {
      x: (clientX / this.attributes.scale) - this.dimensions.x,
      y: (clientY / this.attributes.scale) - this.dimensions.y
    };
  }

  public startSelection(x: number, y: number) {
    this.selectionArea = {
      startX: x,
      startY: y,
      endX: x,
      endY: y
    };
    this.update();
  }

  public endSelection(x: number, y: number) {
    this.selectionArea.endX = x;
    this.selectionArea.endY = y;
    this.update();
  }

  public hasSelection(): boolean {
    return !!this.selectionArea;
  }

  public clearSelection() {
    this.selectionArea = null;
    this.update();
  }

  public getSelected(): View[] {
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

    return this.children
      .find(boundingBox)

    // connections must be fully enclosed in order to be selected
      .filter(v => !(v instanceof ConnectionView) ||
                    boundingBox.contains(new BoundingBox(v.getDimensions())));
  }

  public getAll(): View[] {
    return this.children.all();
  }

  public drawBuffered() {
    bufferEvent('redraw-' + this._id, this.draw, true);
  }

  public draw() {
    var context = this.canvas.getContext('2d');

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

    var viewport = new BoundingBox(
      offsetX - .5, offsetY - .5, width + 1, height + 1
    );
    this.children
      .find(viewport)
      .filter(view => !view.attributes.hidden)
      .sort((a, b) => a.getRenderOrder() - b.getRenderOrder())
      .forEach(item => item.draw(context));

    if (this.previewChild && !this.previewChild.attributes.hidden) {
      context.globalAlpha = 0.5;
      this.previewChild.draw(context);
    }

    // if (process.env.NODE_ENV === 'development') {
    //   this.children.draw(context, viewport);
    // }

    if (this.selectionArea) {
      context.strokeStyle = style.general.selectionStrokeColor;
      context.fillStyle = style.general.selectionFillColor;

      context.beginPath();
      context.rect(
        this.selectionArea.startX,
        this.selectionArea.startY,
        this.selectionArea.endX - this.selectionArea.startX,
        this.selectionArea.endY - this.selectionArea.startY
      );
      context.closePath();

      context.fill();
      context.stroke();
    }

    context.restore();
  }
}