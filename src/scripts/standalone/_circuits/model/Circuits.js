import Node from './Node';
import bufferEvent from '../utils/eventBuffer';

const EventEmitter = require('events');

class Circuit extends EventEmitter {
  constructor (name, pins) {
    super();
    this.update = this.update.bind(this);
    this.pins = pins.map((options, i) => {
      var node = new Node(name + ":" + options.name || i);

      if (!options.ignore) {
        node.on('update', () => bufferEvent('circuit-update', this.update));
      }

      return node;
    });
    this.update();
  }

  _set(index, state) {
    this.pins[index].set(state);
  }

  _get(index) {
    return this.pins[index].get();
  }

  update() {
    this.emit('update');
    this.doUpdate();
  }

  doUpdate() {
    throw new Error("doUpdate() must be overridden by subclass");
  }

  getConnections() {
    return this.pins
      .map(pin => pin.getConnections())
      .reduce((arr, data) => arr.concat(data), []);
  }
}

class AndCircuit extends Circuit {
  constructor (name) {
    super(name, [
      {name: "input A"},
      {name: "input B"},
      {name: "output", ignore: true}
    ]);
  }

  doUpdate() {
    this._set(2, this._get(0) && this._get(1));
  }
}

class OrCircuit extends Circuit {
  constructor (name) {
    super(name, [
      {name: "input A"},
      {name: "input B"},
      {name: "output", ignore: true}
    ]);
  }

  doUpdate() {
    this._set(2, this._get(0) || this._get(1));
  }
}

class NotCircuit extends Circuit {
  constructor (name) {
    super(name, [
      {name: "input"},
      {name: "output", ignore: true}
    ]);
  }

  doUpdate() {
    this._set(1, !this._get(0));
  }
}

export {
  AndCircuit,
  OrCircuit,
  NotCircuit
};