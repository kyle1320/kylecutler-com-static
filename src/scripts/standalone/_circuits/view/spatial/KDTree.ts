import BoundingBox from './BoundingBox';

const wrapperKey = Symbol('KD Tree Item Wrapper');
const splitThreshold = 200;

declare type Node<T> = LeafNode<T> | InternalNode<T>;
declare type NodeParent<T> = KDTree<T> | Node<T>;
declare type Item<T> = T & {
  [wrapperKey]: InternalItem<T>
};

export default class KDTree<T> {
  private items: InternalItem<T>[];
  private rootNode: Node<T>;

  constructor () {
    this.items = [];
    this.rootNode = new LeafNode(this);
  }

  public all() {
    return this.items
      .filter(i => i.isValid)
      .map(i => i.innerItem);
  }

  public find(boundingBox: BoundingBox): T[] {
    var items = this.rootNode
      .find(boundingBox)
      .map(i => i.innerItem);

    if (this.rootNode instanceof InternalNode) {
      return Array.from(new Set(items));
    } else {
      return items;
    }
  }

  public insert(item: T, boundingBox: BoundingBox) {
    var internalItem = new InternalItem(item, boundingBox);
    this.items.push(internalItem);
    this.items = this.items.filter(i => i.isValid);
    this.rootNode = this.rootNode.insert(internalItem);
  }

  public remove(item: T) {
    if ((item as Item<T>)[wrapperKey]) {
      (item as Item<T>)[wrapperKey].remove();
    }
  }

  public refresh() {
    this.rootNode = this.rootNode.rebuild();
  }

  public cleanup() {
    this.items = this.items.filter(i => i.isValid);
    this.rootNode = buildNode(this, this.items);
  }
}

// if (process.env.NODE_ENV === 'development') {
//   KDTree.prototype.draw = function (context, boundingBox) {
//     drawNode(context, this.rootNode, boundingBox);
//   };
// }

class InternalItem<T> {
  public innerItem: Item<T>;
  public boundingBox: BoundingBox;
  public isValid: boolean;
  public containerNode: Node<T>;

  constructor (item: T, boundingBox: BoundingBox) {
    this.innerItem = item as Item<T>;
    this.boundingBox = boundingBox;
    this.isValid = true;
    this.containerNode = null;

    (item as Item<T>)[wrapperKey] = this;
  }

  public remove() {
    if (!this.isValid) return;

    this.isValid = false;
    this.containerNode.refresh();

    delete this.innerItem[wrapperKey];
    this.innerItem = null;
  }
}

class InternalNode<T> {
  private axis: number;
  private coord: number;
  private items: InternalItem<T>[];
  private upper: Node<T>;
  private lower: Node<T>;
  private parent: NodeParent<T>;

  constructor (axis: number, coord: number, parent: NodeParent<T>) {
    this.axis = axis;
    this.coord = coord;
    this.items = [];
    this.upper = new LeafNode(this);
    this.lower = new LeafNode(this);
    this.parent = parent;
  }

  public find(boundingBox: BoundingBox): InternalItem<T>[] {
    var items: InternalItem<T>[] = [];

    if (boundingBox.min[this.axis] <= this.coord) {
      items = items.concat(this.lower.find(boundingBox));
    }
    if (boundingBox.max[this.axis] >= this.coord) {
      items = items.concat(this.upper.find(boundingBox));
    }

    return items;
  }

  public insert(item: InternalItem<T>): Node<T> {
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

  public refresh() {
    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < splitThreshold) {
      this.parent && this.parent.refresh();
    } else {
      this.upper = this.upper.rebuild();
      this.lower = this.lower.rebuild();
    }
  }

  public rebuild(): Node<T> {
    if (this.items.length < splitThreshold) {
      return new LeafNode(this.parent, this.items);
    }
    return this;
  }

  public set(items: InternalItem<T>[], lower: Node<T>, upper: Node<T>) {
    this.items = items;
    this.lower = lower;
    this.upper = upper;
  }
}

class LeafNode<T> {
  private items: InternalItem<T>[];
  private parent: NodeParent<T>;

  constructor (parent: NodeParent<T>, items: InternalItem<T>[] = []) {
    this.items = items;
    this.items.forEach(i => i.containerNode = this);
    this.parent = parent;
  }

  public find(boundingBox: BoundingBox) {
    return this.items.filter(
      item => item.isValid && item.boundingBox.intersects(boundingBox)
    );
  }

  public insert(item: InternalItem<T>): Node<T> {
    item.containerNode = this;

    this.items.push(item);

    this.items = this.items.filter(i => i.isValid);

    if (this.items.length >= splitThreshold) {
      return buildNode(this.parent, this.items);
    }

    return this;
  }

  public refresh() {
    this.items = this.items.filter(i => i.isValid);

    if (this.items.length < splitThreshold) {
      this.parent && this.parent.refresh();
    }
  }

  public rebuild(): Node<T> {
    return this;
  }
}

function buildNode<T>(
  parent: NodeParent<T>,
  items: InternalItem<T>[]
): Node<T> {
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
  node.set(
    items,
    buildNode(node, bestBelow),
    buildNode(node, bestAbove)
  );

  return node;
}