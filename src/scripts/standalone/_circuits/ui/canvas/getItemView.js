import View from './View';
import rendering from './rendering';

const viewLookupTable = {
  'Node': class NodeView extends View {
    constructor (item) {
        super(item, 0, 0, 0, 0, rendering.drawNode);
    }
  },

  'AndCircuit': class AndCircuitView extends View {
    constructor (item) {
        super(item, 0, 0, 2, 2, rendering.drawAndGate);
  
        this.connect(item.pins[0], 0, 0);
        this.connect(item.pins[1], 0, 2);
        this.connect(item.pins[2], 2, 1);
    }
  },

  'OrCircuit': class OrCircuitView extends View {
    constructor (item) {
        super(item, 0, 0, 2, 2, rendering.drawOrGate);
  
        this.connect(item.pins[0], 0, 0);
        this.connect(item.pins[1], 0, 2);
        this.connect(item.pins[2], 2, 1);
    }
  },
  
  'NotCircuit': class NotCircuitView extends View {
    constructor (item) {
        super(item, 0, 0, 1, 0, rendering.drawNotGate);
  
        this.connect(item.pins[0], 0, 0);
        this.connect(item.pins[1], 1, 0);
    }
  }
};

export default function getItemView (item) {
  return new (viewLookupTable[item.constructor.name])(item);
}