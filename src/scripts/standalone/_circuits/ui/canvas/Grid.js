import getItemView from './getItemView';
import {Location, Size} from '../../utils/props';

const EventEmitter = require('events');

function getKey(x, y) {
  return x + ", " + y;
}

export default class Grid extends EventEmitter {
  constructor () {
    super();
    this.items = new Set();
    this.spatial = new Map();
    this.onChange = null;

    this.update = () => this.emit('update');
  }

  addItem (item, x, y) {
    var view = getItemView(item);

    if (!view) {
      console.warn("Got invalid item");
      return;
    }

    view.move(x, y);

    view.on('update', this.update);

    this.insert(view);
  }

  insert (view) {
    var {x: ix, y: iy} = Location.get(view.item);
    var {width, height} = Size.get(view.item);

    if (this.items.has(view)) {
        console.warn("Tried to insert duplicate view");
        return;
    }

    this.items.add(view);

    for (var x = ix; x <= ix + width; x++) {
      for (var y = iy; y <= iy + height; y++) {
        var key = getKey(x, y);

        if (this.spatial.has(key)) {
          this.remove(view);
          throw new Error("Item cannot be inserted: position is already occupied")
        }

        this.spatial.set(key, view);
      }
    }

    this.update();
  }

  remove (view) {
    var {x: ix, y: iy} = Location.get(view.item);
    var {width, height} = Size.get(view.item);

    view.removeListener('update', this.update);

    if (!this.items.delete(view)) {
      console.warn("Tried to remove nonexistant view");
      return;
    }

    for (var x = ix; x <= ix + width; x++) {
      for (var y = iy; y <= iy + height; y++) {
        var key = getKey(x, y);

        this.spatial.delete(key);
      }
    }

    this.update();
  }

  move (view, x, y) {
    var {x: ix, y: iy} = Location.get(view.item);
    var {width, height} = Size.get(view.item);

    // verify that the target position is empty
    for (var tx = x; tx <= x + width; tx++) {
      for (var ty = y; ty <= y + height; ty++) {
        if (tx >= ix && tx <= ix + width && ty >= iy && ty <= iy + height) {
          continue;
        }
        if (this.spatial.has(getKey(tx, ty))) {
          throw new Error("Item cannot be moved: position is already occupied")
        }
      }
    }

    for (var tx = ix; tx <= ix + width; tx++) {
      for (var ty = iy; ty <= iy + height; ty++) {
        this.spatial.delete(getKey(tx, ty));
      }
    }

    view.move(x, y);

    for (var tx = x; tx <= x + width; tx++) {
      for (var ty = y; ty <= y + height; ty++) {
        this.spatial.set(getKey(tx, ty), view);
      }
    }

    this.update();
  }

  find (x, y) {
    return this.spatial.get(
      getKey(Math.round(x), Math.round(y))
    );
  }

  draw (context, params) {
    var {scale, offsetX, offsetY} = params;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // transform the context so that items can simply use grid coordinates
    context.lineWidth = params.style.general.lineWidth;
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

    for (var x = Math.ceil(offsetX); x < offsetX + width; x++) {
      context.strokeStyle = params.style.general.gridColor;
      context.beginPath();
      context.moveTo(x, offsetY);
      context.lineTo(x, offsetY + height);
      context.closePath();
      context.stroke();
    }

    for (var y = Math.ceil(offsetY); y < offsetY + height; y++) {
      context.strokeStyle = params.style.general.gridColor;
      context.beginPath();
      context.moveTo(offsetX, y);
      context.lineTo(offsetX + width, y);
      context.closePath();
      context.stroke();
    }

    // TODO: only draw items within the viewing window.
    //   Be careful to always draw connections.
    this.items.forEach(function (view) {
      view.draw(context, params);
    });

    // undo the transform
    context.resetTransform();
  }
}