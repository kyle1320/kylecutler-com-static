import BoundingBox from "./BoundingBox";

const wrapperKey = Symbol('KD Tree Item Wrapper');

export default class KDTree {
  constructor () {
    this.items = [];
    this.rootNode = new LeafNode();
  }

  all() {
    return this.items
      .filter(i => i.isValid)
      .map(i => i.innerItem);
  }

  find(boundingBox) {
    return this.rootNode
      .find(boundingBox)
      .map(i => i.innerItem);
  }

  insert(item, boundingBox) {
    var internalItem = new InternalItem(item, boundingBox);
    this.items.push(internalItem);
    this.items = this.items.filter(i => i.isValid);
    this.rootNode = this.rootNode.insert(internalItem);
  }

  remove(item) {
    if (item[wrapperKey]) {
      item[wrapperKey].remove();
    }
  }

  cleanup() {
    this.items = this.items.filter(i => i.isValid);
    this.rootNode = buildNode(this.items);
  }

  draw(context, boundingBox) {
    drawNode(context, this.rootNode, boundingBox);
  }
}

class InternalItem {
  constructor (item, boundingBox) {
    this.innerItem = item;
    this.boundingBox = boundingBox;
    this.isValid = true;

    item[wrapperKey] = this;
  }

  remove() {
    if (!this.isValid) return;

    this.isValid = false;

    delete this.innerItem[wrapperKey];
    this.innerItem = null;
  }
}

class InternalNode {
  constructor (axis, coord) {
    this.axis = axis;
    this.coord = coord;
    this.items = [];
    this.upper = new LeafNode();
    this.lower = new LeafNode();
  }

  find(boundingBox) {
    var items = new Set();

    if (boundingBox.min[this.axis] <= this.coord) {
      this.lower.find(boundingBox).forEach(i => items.add(i));
    }
    if (boundingBox.max[this.axis] >= this.coord) {
      this.upper.find(boundingBox).forEach(i => items.add(i));
    }

    return Array.from(items.values());
  }

  insert(item) {
    this.items.push(item);

    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < 5) {
      return new LeafNode(this.items);
    }

    if (item.boundingBox.min[this.axis] <= this.coord) {
      this.lower = this.lower.insert(item);
    }
    if (item.boundingBox.max[this.axis] >= this.coord) {
      this.upper = this.upper.insert(item);
    }

    return this;
  }
}

class LeafNode {
  constructor (items = []) {
    this.items = items;
  }

  find(boundingBox) {
    return this.items.filter(
      item => item.isValid && item.boundingBox.intersects(boundingBox)
    );
  }

  insert(item) {
    this.items.push(item);

    this.items = this.items.filter(i => i.isValid);

    if (this.items.length >= 5) {
      return buildNode(this.items);
    }

    return this;
  }
}

function buildNode(items) {
  if (items.length < 5) {
    return new LeafNode(items);
  }

  var bestHeuristic = Infinity;
  var bestAxis = -1;
  var bestCoord = NaN;
  var bestAbove = null;
  var bestBelow = null;
  for (var axis = 0; axis < 2; axis++) {
    var coords = items.reduce(
      (arr, item) => arr.concat(
        item.boundingBox.min[axis],
        item.boundingBox.max[axis]
      ), []
    ).sort((a, b) => a - b);

    for (var i = 0; i < coords.length - 1; i++) {
      var coord = (coords[i] + coords[i + 1]) / 2;
      var below = items.filter(i => i.boundingBox.min[axis] <= coord);
      var above = items.filter(i => i.boundingBox.max[axis] >= coord);

      // not the best heuristic, but not terrible for an infinite plane
      var heuristic = (above.length**2 * below.length**2);

      if (above.length < items.length &&
          below.length < items.length &&
          heuristic < bestHeuristic) {
        bestHeuristic = heuristic;
        bestAxis = axis;
        bestCoord = coord;
        bestAbove = above;
        bestBelow = below;
      }
    }
  }

  if (bestAxis < 0) {
    return new LeafNode(items);
  }

  var node = new InternalNode(bestAxis, bestCoord);
  node.items = items;
  node.upper = buildNode(bestAbove);
  node.lower = buildNode(bestBelow);

  return node;
}

function drawNode(context, node, bb) {
  if (node instanceof LeafNode) return;

  if (node.coord < bb.min[node.axis]) {
    drawNode(context, node.upper, bb);
  } else if (node.coord > bb.max[node.axis]) {
    drawNode(context, node.lower, bb)
  } else {
    context.save();

    var start = [node.coord, bb.min[1 - node.axis]];
    var end = [node.coord, bb.max[1 - node.axis]];

    if (node.axis === 1) {
      start.reverse();
      end.reverse();
    }

    context.strokeStyle = "rgba(0, 0, 255, 0.1)";

    context.beginPath();
      context.moveTo(start[0], start[1]);
      context.lineTo(end[0], end[1])
    context.closePath();

    context.stroke();

    drawNode(context, node.lower, bbFromBounds(
      bb.min[0],
      bb.min[1],
      Math.min(bb.max[0], end[0]),
      Math.min(bb.max[1], end[1])
    ));

    drawNode(context, node.upper, bbFromBounds(
      Math.max(bb.min[0], start[0]),
      Math.max(bb.min[1], start[1]),
      bb.max[0],
      bb.max[1]
    ));

    context.restore();
  }
}

function bbFromBounds(minx, miny, maxx, maxy) {
  return new BoundingBox(minx, miny, maxx - minx, maxy - miny);
}