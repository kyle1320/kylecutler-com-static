import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './Parser';

const EventEmitter = require('events');

export default class Circuit extends EventEmitter {
  constructor (def) {
    super();

    this.definition = def;

    this.pins = def.pins.map((options, i) => {
      var node = new Node(def.name + ":" + i);

      if (!options.ignoreInput) {
        node.on('update', () => bufferEvent('circuit-update', this.update));
      }

      return node;
    });

    this.update = this.update.bind(this);
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
    this.definition.rules.forEach(rule => {
      switch (rule.type) {
        case "output":
          this._set(rule.target, parse(rule.value, this));
          break;
      }
    });
  }

  getConnections() {
    return this.pins
      .map(pin => pin.getConnections())
      .reduce((arr, data) => arr.concat(data), []);
  }
}