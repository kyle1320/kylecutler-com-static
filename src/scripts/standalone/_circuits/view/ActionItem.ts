import { toggleClass, makeElement } from '../../../utils';
import View from './View';

export default class ActionItem {
  public name: string;
  public element: HTMLElement;

  private constructor(name: string, element: HTMLElement) {
    this.name = name;
    this.element = element;
  }

  setSelected(isSelected: boolean) {
    toggleClass(this.element, 'selected', isSelected);
  }

  onClick(cb: (e: MouseEvent) => any) {
    this.element.addEventListener('click', cb);
  }

  static withIcon(name: string, icon: string, title: string) {
    return new ActionItem(name, makeElement(
      { className: 'action-item action-item--icon ' + icon , title },
      ''
    ));
  }

  static withViewCanvas(name: string, view: View, title: string) {
    var canvas = makeElement({ tag: 'canvas', width: 30, height: 30 });

    drawViewOnPreviewCanvas(canvas, view);

    return new ActionItem(name, makeElement(
      { className: 'action-item', title },
      [canvas]
    ));
  }
}

function drawViewOnPreviewCanvas(canvas: HTMLCanvasElement, view: View) {
  var size = 30 * (window.devicePixelRatio || 1);

  canvas.width = size;
  canvas.height = size;

  var dim = view.getDimensions();
  var context = canvas.getContext('2d');
  var scale = Math.min(size*.5, size*.8 / Math.max(dim.width, dim.height));
  var drawWidth = scale * dim.width;
  var drawHeight = scale * dim.height;
  var drawX = (size - drawWidth) / 2;
  var drawY = (size - drawHeight) / 2;

  context.lineWidth = 0.1;

  context.transform(
    scale, 0, 0, scale, drawX, drawY
  );

  view.draw(context);
}