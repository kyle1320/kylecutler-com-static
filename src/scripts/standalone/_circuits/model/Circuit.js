import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './parse';

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

    this.internalPins = def.pins.map((_, i) => new Node(def.name + ":internal:" + i));

    this.update = this.update.bind(this);
    this.update();
  }

  _set(index, state) {
    this.internalPins[index].set(state);
    this.pins[index].update(this.internalPins[index]);
  }

  _get(index) {
    return this.pins[index].get();
  }

  update() {
    this.emit('update');
    this.doUpdate();
  }

  doUpdate() {
    var scope = this.pins.map(pin => pin.get());
    this.definition.rules.forEach(rule => {
      switch (rule.type) {
        case "output":
          var expr = parse(rule.value);
          var res = expr(scope);
          this._set(rule.target, res);
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