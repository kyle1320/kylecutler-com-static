import {Location, Size} from '../../utils/props';

const EventEmitter = require('events');

export default class View extends EventEmitter {
  constructor (item, x, y, width, height, drawFunc) {
    super();
    this.item = item;

    item.on('update', () => this.emit('update'));

    Location.set(item, x, y);
    Size.set(item, width, height);

    this.children = [];
    this.hover = false;

    this.drawFunc = drawFunc;
  }

  move (x, y) {
    Location.set(this.item, x, y);
    this.children.forEach(function (child) {
      Location.set(child.item, x + child.xrel, y + child.yrel);
    });
    this.emit('update');
  }

  setHover (value) {
    if (this.hover === value) return;

    this.hover = value;

    this.emit('update');
  }

  connect (item, xrel, yrel) {
    var {x, y} = Location.get(this.item);
    Location.set(item, x + xrel, y + yrel);
    this.children.push({item, xrel, yrel});
  }

  draw (context, params) {
    this.drawFunc && this.drawFunc(this.item, context, params);

    if (this.hover) {
      var {x, y} = Location.get(this.item);
      var {width, height} = Size.get(this.item);

      context.fillStyle = params.style.general.highlightOverlayColor;
      context.rect(x - 0.5, y - 0.5, width + 1, height + 1);
      context.fill();
    }
  }
}