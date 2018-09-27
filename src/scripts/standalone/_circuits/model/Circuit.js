import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './parse';

const EventEmitter = require('events');

export default class Circuit extends EventEmitter {
  constructor (def) {
    super();

    this.definition = def;

    this.pins = def.pins.map((_, i) => new Node(def.name + ":" + i));

    // use internal pins to keep external pins from being powered directly
    // and to prevent toggling the output of a circuit
    this.internalPins = def.pins.map((options, i) => {
      var node = new Node(def.name + ":internal:" + i);

      node.connect(this.pins[i]);

      if (!options.ignoreInput) {
        node.on('update', () => bufferEvent('circuit-update', this.update));
      }

      return node;
    });

    this.update = this.update.bind(this);
    this.update();
  }

  _set(index, state) {
    this.internalPins[index].set(state);
  }

  _get(index) {
    return this.internalPins[index].get();
  }

  update() {
    this.emit('update');
    this.doUpdate();
  }

  doUpdate() {
    var scope = this.internalPins.map(pin => pin.get());
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
}