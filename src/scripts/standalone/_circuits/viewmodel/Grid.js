import KDTree from './spatial/KDTree';
import BoundingBox from './spatial/BoundingBox';
import Connection from './Connection';
import rendering from '../ui/rendering';

const EventEmitter = require('events');

export default class Grid extends EventEmitter {
  constructor (style) {
    super();

    // TODO: cleanup the tree as a background process
    //       likely using a service worker?
    this.items = new KDTree();

    this.connections = new Map();

    this.renderParams = {
      scale: 20,
      offsetX: 0,
      offsetY: 0
    };
    this.renderStyle = style;

    const _updateConnections = view => {
      if (view.data.getConnections) {
        var conns = view.data.getConnections();

        conns.forEach(c => {
          var key = c[0]._id + ", " + c[1]._id;
          if (!this.connections.has(key)) {
            var connView = new Connection(c[0], c[1], rendering.drawConnection)
            this.connections.set(key, connView);
            this.insert(connView);
          }
        });
      }
    }

    this.update = view => {
      view && _updateConnections(view);
      this.emit('update');
    };
    this.remove = view => this.items.remove(view);
    this.move   = view => {
      // TODO: check for collisions (somewhere)

      this.items.remove(view);

      this.items.insert(view, new BoundingBox(view.getDimensions()));

      this.update();
    }
  }

  insert(view) {
    // TODO: check for collisions (somewhere)

    this.items.insert(view, new BoundingBox(view.getDimensions()));

    view.on('update', this.update);
    view.on('remove', this.remove);
    view.on('move', this.move);

    this.update(view);
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
    var { scale, offsetX, offsetY } = this.renderParams;

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