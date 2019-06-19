import EventEmitter from '../../../js/utils/EventEmitter';

export default class Node extends EventEmitter<{
  update: void
  }> {
  public connections: Set<Node>;
  public sources: Set<Node>;
  public isSource: boolean;

  public constructor (isSource = false) {
    super();
    this.connections = new Set();

    // keep track of "high voltage" sources
    this.sources = new Set();
    this.isSource = isSource;
  }

  public get() {
    return this.isSource || this.sources.size > 0;
  }

  public set(state: boolean) {
    if (state === this.isSource) return;

    this.isSource = state;
    this.update(this, this);
    this.emit('update');
  }

  private update(source: Node, caller?: Node) {
    if (source === undefined) {
      throw new TypeError('source must be provided');
    }

    if (source.isSource) {
      if (this.sources.has(source)) {
        return;
      }

      this.sources.add(source);

      if (this.sources.size === 1) {
        this.emit('update');
      }
    } else {
      if (!this.sources.delete(source)) {
        return;
      }

      if (this.sources.size === 0) {
        this.emit('update');
      }
    }

    // update connected nodes
    this.connections.forEach(
      node => node !== caller && node.update(source, this)
    );
  }

  public connect(node: Node): boolean {
    if (node === this) return false;

    if (!this.connections.has(node)) {
      this.connections.add(node);

      for (var source of this.sources) {
        node.update(source, this);
      }

      node.connect(this);

      this.emit('update');

      return true;
    }

    return false;
  }

  public disconnect(node?: Node) {
    if (node === this) {
      this.sources.delete(this);
      return;
    }

    if (node) {
      this.connections.delete(node);
      node.connections.delete(this);

      // in order to keep sources current, we do a search for connected nodes
      // whenever two nodes are disconnected.
      // Due to this, connections must be bi-directional.
      updateSourcesAfterDisconnect(this, node);
    } else {
      for (var connectedNode of this.connections) {
        this.disconnect(connectedNode);
      }
    }
  }
}

function updateSourcesAfterDisconnect(nodeA: Node, nodeB: Node) {
  var foundA = findAllDFS(nodeA);

  if (foundA.has(nodeB)) {

    // nodes are still connected, no need to update
    return;
  }

  var foundB = findAllDFS(nodeB);

  updateSources(foundA);
  updateSources(foundB);
}

function updateSources(nodes: Set<Node>) {
  var sources = Array.from(nodes.values()).filter(x => x.isSource);
  for (var node of nodes) {
    node.sources = new Set(sources);
    node.emit('update');
  }
}

function findAllDFS(start: Node): Set<Node> {
  var found = new Set<Node>();
  var front = [start];

  while (front.length > 0) {
    var node = front.pop();
    found.add(node);
    front = front.concat(
      Array.from(node.connections.values())
        .filter(nb => !found.has(nb))
    );
  }

  return found;
}