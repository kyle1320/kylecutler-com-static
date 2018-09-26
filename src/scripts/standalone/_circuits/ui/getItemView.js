import View from '../viewmodel/View';
import rendering from './rendering';

function size(w, h) {
  return { dimensions: dims(0, 0, w, h) };
}

function location(x, y) {
  return { dimensions: dims(x, y, 0, 0) };
}

function dims(x, y, width, height) {
  return { x, y, width, height };
}

const viewLookupTable = {
  'Node':       item => new View(item, size(0, 0), rendering.drawNode),
  'AndCircuit': item => new View(item, size(2, 2), rendering.drawAndGate)
                          .addChild(item.pins[0], location(0, 0), rendering.drawNode)
                          .addChild(item.pins[1], location(0, 2), rendering.drawNode)
                          .addChild(item.pins[2], location(2, 1), rendering.drawNode),
  'OrCircuit':  item => new View(item, size(2, 2), rendering.drawOrGate)
                          .addChild(item.pins[0], location(0, 0), rendering.drawNode)
                          .addChild(item.pins[1], location(0, 2), rendering.drawNode)
                          .addChild(item.pins[2], location(2, 1), rendering.drawNode),
  'NotCircuit': item => new View(item, size(1, 0), rendering.drawNotGate)
                          .addChild(item.pins[0], location(0, 0), rendering.drawNode)
                          .addChild(item.pins[1], location(1, 0), rendering.drawNode)
};

export default function getItemView(item) {
  return viewLookupTable[item.constructor.name](item);
}