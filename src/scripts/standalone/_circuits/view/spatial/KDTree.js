import BoundingBox from "./BoundingBox";

const wrapperKey = Symbol('KD Tree Item Wrapper');
const splitThreshold = 200;

export default class KDTree {
  constructor () {
    this.items = [];
    this.rootNode = new LeafNode(this);
  }

  all() {
    return this.items
      .filter(i => i.isValid)
      .map(i => i.innerItem);
  }

  find(boundingBox) {
    return Array.from(
      new Set(this.rootNode.find(boundingBox))
    ).map(i => i.innerItem);
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

  refresh() {
    this.rootNode = this.rootNode.rebuild();
  }

  cleanup() {
    this.items = this.items.filter(i => i.isValid);
    this.rootNode = buildNode(this, this.items);
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
    this.containerNode = null;

    item[wrapperKey] = this;
  }

  remove() {
    if (!this.isValid) return;

    this.isValid = false;
    this.containerNode.refresh();

    delete this.innerItem[wrapperKey];
    this.innerItem = null;
  }
}

class InternalNode {
  constructor (axis, coord, parent) {
    this.axis = axis;
    this.coord = coord;
    this.items = [];
    this.upper = new LeafNode(this);
    this.lower = new LeafNode(this);
    this.parent = parent;
  }

  find(boundingBox) {
    var items = [];

    if (boundingBox.min[this.axis] <= this.coord) {
      items = items.concat(this.lower.find(boundingBox));
    }
    if (boundingBox.max[this.axis] >= this.coord) {
      items = items.concat(this.upper.find(boundingBox));
    }

    return items;
  }

  insert(item) {
    this.items.push(item);

    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < splitThreshold) {
      return new LeafNode(this.parent, this.items);
    }

    if (item.boundingBox.min[this.axis] <= this.coord) {
      this.lower = this.lower.insert(item);
    }
    if (item.boundingBox.max[this.axis] >= this.coord) {
      this.upper = this.upper.insert(item);
    }

    return this;
  }

  refresh() {
    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < splitThreshold) {
      this.parent && this.parent.refresh();
    } else {
      this.upper = this.upper.rebuild();
      this.lower = this.lower.rebuild();
    }
  }

  rebuild() {
    if (this.items.length < splitThreshold) {
      return new LeafNode(this.parent, this.items);
    }
    return this;
  }
}

class LeafNode {
  constructor (parent, items = []) {
    this.items = items;
    this.items.forEach(i => i.containerNode = this);
    this.parent = parent;
  }

  find(boundingBox) {
    return this.items.filter(
      item => item.isValid && item.boundingBox.intersects(boundingBox)
    );
  }

  insert(item) {
    item.containerNode = this;

    this.items.push(item);

    this.items = this.items.filter(i => i.isValid);

    if (this.items.length >= splitThreshold) {
      return buildNode(this.parent, this.items);
    }

    return this;
  }

  refresh() {
    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < splitThreshold) {
      this.parent && this.parent.refresh();
    }
  }

  rebuild() {
    return this;
  }
}

function buildNode(parent, items) {
  if (items.length < splitThreshold) {
    return new LeafNode(parent, items);
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
      var heuristic = (above.length**2 + below.length**2);

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
    return new LeafNode(parent, items);
  }

  var node = new InternalNode(bestAxis, bestCoord, parent);
  node.items = items;
  node.upper = buildNode(node, bestAbove);
  node.lower = buildNode(node, bestBelow);

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