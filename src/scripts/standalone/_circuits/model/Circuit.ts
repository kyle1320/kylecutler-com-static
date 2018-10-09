import Node from './Node';
import bufferEvent from '../utils/eventBuffer';
import parse from './parse';
import { CircuitDefinition, CircuitRule } from './types';

const EventEmitter = require('events');

export default class Circuit extends EventEmitter {
  definition: CircuitDefinition;
  pins: Node[];
  internalPins: Node[];

  constructor (def: CircuitDefinition) {
    super();

    this.definition = def;
    this.update = this.update.bind(this);
    this.doUpdate = getUpdateFunc(def.rules);

    this.pins = def.pins.map(() => new Node());
    this.internalPins = def.pins.map((options, i) => {
      var node = new Node();

      if (!options.ignoreInput) {
        node.on('update', () => bufferEvent('circuit-update', this.update));
      }

      node.connect(this.pins[i]);

      return node;
    });

    this.update();
  }

  _set(index: number, state: boolean) {
    this.internalPins[index].set(state);
  }

  _get(index: number) {
    return this.internalPins[index].get();
  }

  update() {
    this.doUpdate();
    this.emit('update');
  }

  disconnect() {
    this.pins.forEach(pin => pin.disconnect());
    this.emit('update');
  }
}

function getUpdateFunc(rules: CircuitRule[]) {
  var funcs = rules.map(rule => {
    switch (rule.type) {
    case 'output':
      var expr = parse(rule.value);
      return function (this: Circuit, scope: {}) {
        this._set(rule.target, expr(scope));
      };
    }
    return null;
  });

  return function (this: Circuit) {
    var scope = this.pins.map(pin => pin.get());

    funcs.forEach(f => f.call(this, scope));
  };
}