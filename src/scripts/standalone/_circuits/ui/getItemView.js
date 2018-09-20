import View from '../viewmodel/View';
import rendering from './rendering';

function size(width, height) {
  return { size: { width, height } };
}

const viewLookupTable = {
  'Node':       item => new View(item, size(0, 0), rendering.drawNode),
  'AndCircuit': item => new View(item, size(2, 2), rendering.drawAndGate),
  'OrCircuit':  item => new View(item, size(2, 2), rendering.drawOrGate),
  'NotCircuit': item => new View(item, size(1, 0), rendering.drawNotGate)
};

export default function getItemView(item) {
  return viewLookupTable[item.constructor.name](item);
}