import BoundingBox from './spatial/BoundingBox';

const EventEmitter = require('events');

export default class View extends EventEmitter {
  constructor (data, props, drawFunc) {
    super();

    var { location, size, attributes } = props;

    this.data = data;

    this.location = location || { x: 0, y: 0 };
    this.size = size;
    this.attributes = attributes || {};

    this.drawFunc = drawFunc;

    this.update = () => this.emit('update');
    this.data.on('update', this.update);

    this._genBoundingBox();
  }

  setAttribute(name, value) {
    if (this.attributes[name] !== value) {
      this.attributes[name] = value;
      this.update();
    }
  }

  move(x, y) {
    this.location = {x, y};
    this._genBoundingBox();
    this.update();
  }

  _genBoundingBox() {
    this.boundingBox = new BoundingBox(
      this.location.x, this.location.y, this.size.width, this.size.height
    );
  }

  draw(context) {
    this.drawFunc && this.drawFunc(this, context);
  }
}