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
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  private removeChild: (view: View) => void;
  private moveChild: (view: View) => void;
  private boundDraw: () => void;

  public constructor(canvasEl: HTMLCanvasElement) {
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
    this.moveChild = (view: View) => {
      // TODO: check for collisions (somewhere)

      this.children.remove(view);

      this.children.insert(view, new BoundingBox(view.getDimensions()));

      this.update();
    };

    this.boundDraw = this.draw.bind(
      this,
      this.canvas.getContext('2d', { alpha: false })
    );
  }

  public remove() {}

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
    return this.children.find(
      new BoundingBox(x - grow, y - grow, grow * 2, grow * 2)
    );
  }

  public findAll(x: number, y: number): PositionalTree {
    const gridX = x / this.attributes.scale - this.dimensions.x;
    const gridY = y / this.attributes.scale - this.dimensions.y;

    return {
      data: this,
      x: gridX,
      y: gridY,
      children: this.children
        .find(new BoundingBox(gridX - 0.5, gridY - 0.5, 1, 1))
        .filter((view) => view.intersects(gridX, gridY, 0.5))
        .sort((a, b) => b.getRenderOrder() - a.getRenderOrder())
        .map((view) => view.findAll(gridX, gridY))
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
    const { x, y } = this.getDimensions();
    const curScale = this.attributes.scale;
    const newScale = Math.min(70, Math.max(5, curScale + delta));
    const factor = curScale / newScale;
    const offsetX = (cx + x) * (1 - factor);
    const offsetY = (cy + y) * (1 - factor);

    this.move(x - offsetX, y - offsetY);
    this.setAttribute('scale', newScale);
  }

  public getCoord(clientX: number, clientY: number): Position {
    return {
      x: clientX / this.attributes.scale - this.dimensions.x,
      y: clientY / this.attributes.scale - this.dimensions.y
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
    if (!this.selectionArea) return;

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

    const boundingBox = new BoundingBox(0, 0, 0, 0);
    boundingBox.min = [
      Math.min(this.selectionArea.startX, this.selectionArea.endX) - 0.4,
      Math.min(this.selectionArea.startY, this.selectionArea.endY) - 0.4
    ];
    boundingBox.max = [
      Math.max(this.selectionArea.startX, this.selectionArea.endX) + 0.4,
      Math.max(this.selectionArea.startY, this.selectionArea.endY) + 0.4
    ];

    return (
      this.children
        .find(boundingBox)

        // connections must be fully enclosed in order to be selected
        .filter(
          (v) =>
            !(v instanceof ConnectionView) ||
            boundingBox.contains(new BoundingBox(v.getDimensions()))
        )
    );
  }

  public getAll(): View[] {
    return this.children.all();
  }

  public drawBuffered() {
    bufferEvent('redraw-' + this._id, this.boundDraw, true);
  }

  public draw(context: CanvasRenderingContext2D) {
    const scale = this.attributes.scale * (window.devicePixelRatio || 1);
    const style = this.style;
    const offsetX = -this.dimensions.x;
    const offsetY = -this.dimensions.y;

    context.save();

    context.fillStyle = 'white';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // transform the context so that children can simply use grid coordinates
    context.setTransform(
      scale,
      0,
      0,
      scale,
      -offsetX * scale,
      -offsetY * scale
    );

    const width = context.canvas.width / scale;
    const height = context.canvas.height / scale;

    context.lineWidth = style.general.lineWidth;
    context.strokeStyle = style.general.gridColor;

    context.beginPath();
    for (let x = Math.ceil(offsetX); x < offsetX + width; x++) {
      context.moveTo(x, offsetY);
      context.lineTo(x, offsetY + height);
    }

    for (let y = Math.ceil(offsetY); y < offsetY + height; y++) {
      context.moveTo(offsetX, y);
      context.lineTo(offsetX + width, y);
    }
    context.closePath();
    context.stroke();

    const viewport = new BoundingBox(
      offsetX - 0.5,
      offsetY - 0.5,
      width + 1,
      height + 1
    );
    this.children
      .find(viewport)
      .filter((view) => !view.attributes.hidden)
      .sort((a, b) => a.getRenderOrder() - b.getRenderOrder())
      .forEach((item) => item.draw(context));

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

    if (this.previewChild && !this.previewChild.attributes.hidden) {
      context.globalAlpha = 0.5;
      this.previewChild.draw(context);
    }

    context.restore();
  }
}
