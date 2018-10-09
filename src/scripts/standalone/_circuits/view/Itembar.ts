import { EventEmitter } from 'events';
import { toggleClass, makeElement } from '../../../utils';

export default class Itembar extends EventEmitter {
  element: HTMLElement;
  items: HTMLElement[];

  constructor(element: HTMLElement) {
    super();

    this.element = element;
    this.items = [];
  }

  addItem(item: HTMLElement, selected?: boolean) {
    this.items.push(item);
    if (selected) toggleClass(item, 'selected', true);
    this.element.appendChild(makeElement({ className: 'item' }, [item]));
  }

  addInfoText(text: string) {
    var el = makeElement({ className: 'info' }, text);
    this.element.appendChild(el);
  }

  selectItem(item: HTMLElement) {
    this.items.forEach(i => toggleClass(i, 'selected', item === i));
  }

  clear() {
    this.items = [];
    this.element.innerHTML = '';
  }

  static makeCanvasItem(
    drawFunc: (canvas: HTMLCanvasElement) => void,
    label: string,
    onClick: (e: MouseEvent) => any
  ): HTMLElement {
    var canvas = makeElement({ tag: 'canvas', width: '40', height: '40' });

    drawFunc(canvas);

    return Itembar.makeItem(
      [canvas, makeElement({ className: 'label' }, label)],
      { className: 'item__content--canvas' },
      onClick
    );
  }

  static makeIconItem(
    iconClass: string,
    props: { className?: string, [key: string]: any },
    onClick: (e: MouseEvent) => any
  ): HTMLElement {
    props = props || {};
    props.className =
      `item__content--icon ${iconClass} ${props.className || ''}`;

    return Itembar.makeItem('', props, onClick);
  }

  static makeItem(
    content: any,
    props: { className?: string, [key: string]: any },
    onClick: (e: MouseEvent) => any
  ): HTMLElement {
    props = props || {};
    props.className = 'item__content ' + (props.className || '');

    return makeElement(props, content, { click: (e: MouseEvent) => {
      e.preventDefault();
      onClick(e);
    }});
  }
}