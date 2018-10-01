import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './parse';

const EventEmitter = require('events');

export default class Circuit extends EventEmitter {
  constructor (def) {
    super();

    this.definition = def;
    this.update = this.update.bind(this);

    this.pins = def.pins.map((options, i) => {
      var node = new Node(def.name + ":" + i);

      if (!options.ignoreInput) {
        node.on('update', () => bufferEvent('circuit-update', this.update));
      }

      return node;
    });

    this.internalPins = def.pins.map((_, i) => {
      var node = new Node(def.name + ":internal:" + i);

      node.connect(this.pins[i]);

      return node;
    });

    this.update();
  }

  _set(index, state) {
    this.internalPins[index].set(state);
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

  disconnect() {
    this.pins.forEach(pin => pin.disconnect());
    this.emit('update');
  }
}