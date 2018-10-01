import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './parse';

const EventEmitter = require('events');

export default class Circuit extends EventEmitter {
  constructor (def) {
    super();

    this.definition = def;
    this.update = this.update.bind(this);
    this.doUpdate = getUpdateFunc(def.rules);

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

  disconnect() {
    this.pins.forEach(pin => pin.disconnect());
    this.emit('update');
  }
}

function getUpdateFunc(rules) {
  var funcs = rules.map(rule => {
    switch (rule.type) {
      case "output":
        var expr = parse(rule.value);
        return function (scope) { this._set(rule.target, expr(scope)); }
        break;
    }
  });

  return function () {
    var scope = this.pins.map(pin => pin.get());

    funcs.forEach(f => f.call(this, scope));
  }
}