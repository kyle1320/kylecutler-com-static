import KDTree from './spatial/KDTree';
import BoundingBox from './spatial/BoundingBox';
import { errorStyle, defaultStyle } from '../ui/styles';

const EventEmitter = require('events');

export default class Grid extends EventEmitter {
  constructor (style) {
    super();

    // TODO: cleanup the tree as a background process
    //       likely using a service worker?
    this.items = new KDTree();

    this.renderParams = {
      scale: 20,
      offsetX: 0,
      offsetY: 0
    };
    this.renderStyle = style;

    this.update = () => this.emit('update');
  }

  insert(view) {
    // TODO: check for collisions (somewhere)

    this.items.insert(view, view.boundingBox);

    view.on('update', this.update);

    this.update();
  }

  move(view, x, y) {
    // TODO: check for collisions (somewhere)

    this.items.remove(view);

    view.move(x, y);

    this.items.insert(view, view.boundingBox);

    this.update();
  }

  remove(view) {
    this.items.remove(view);
  }

  find(x, y) {
    return this.items.find(new BoundingBox(x - 0.5, y - 0.5, 1, 1));
  }

  scroll(scrollX, scrollY) {
    this.renderParams.offsetX += scrollX;
    this.renderParams.offsetY += scrollY;

    this.update();
  }

  draw(context) {
    var {scale, offsetX, offsetY} = this.renderParams;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.lineWidth = this.renderStyle.general.lineWidth;

    // transform the context so that items can simply use grid coordinates
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
      context.strokeStyle = this.renderStyle.general.gridColor;
      context.beginPath();
      context.moveTo(x, offsetY);
      context.lineTo(x, offsetY + height);
      context.closePath();
      context.stroke();
    }

    for (var y = Math.ceil(offsetY); y < offsetY + height; y++) {
      context.strokeStyle = this.renderStyle.general.gridColor;
      context.beginPath();
      context.moveTo(offsetX, y);
      context.lineTo(offsetX + width, y);
      context.closePath();
      context.stroke();
    }

    var viewport = new BoundingBox(offsetX, offsetY, width, height);

    // TODO: only draw items within the viewing window.
    //   Be careful to always draw connections.
    this.items.find(viewport).forEach(function (item) {
      item.draw(context);
    });

    context.resetTransform();
  }
}