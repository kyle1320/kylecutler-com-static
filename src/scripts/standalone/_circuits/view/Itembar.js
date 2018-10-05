import { EventEmitter } from "events";
import { toggleClass, makeElement } from "../../../utils";

export default class Itembar extends EventEmitter {
  constructor(element) {
    super();

    this.element = element;
    this.items = [];
  }

  addItem(item, selected) {
    this.items.push(item);
    if (selected) toggleClass(item, 'selected', true);
    this.element.appendChild(makeElement({ className: 'item' }, [item]));
  }

  addInfoText(text) {
    var el = makeElement({ className: "info" }, text);
    this.element.appendChild(el);
  }

  selectItem(item) {
    this.items.forEach(i => toggleClass(i, 'selected', item === i));
  }

  clear() {
    this.items = [];
    this.element.innerHTML = "";
  }

  static makeCanvasItem(drawFunc, label, onClick) {
    var canvas = makeElement({ tag: 'canvas', width: '40', height: '40' });

    drawFunc(canvas);

    return Itembar.makeItem(
      [canvas, makeElement({ className: "label" }, label)],
      { className: "item__content--canvas" },
      onClick
    );
  }

  static makeIconItem(iconClass, props, onClick) {
    props = props || {};
    props.className = `item__content--icon ${iconClass} ${props.className || ''}`;

    return Itembar.makeItem('', props, onClick);
  }

  static makeItem(content, props, onClick) {
    props = props || {};
    props.className = 'item__content ' + (props.className || '');

    return makeElement(props, content, { click: e => {
      e.preventDefault();
      onClick(e);
    }});
  }
}