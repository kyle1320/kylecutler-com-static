const EventEmitter = require('events');

// use a static variable so that each node will have a unique, orderable id.
// this is useful when drawing in order to draw each connection only once.
var globalId = 0;

export default class Node extends EventEmitter {
  constructor (name) {
    super();
    this.connections = new Set();

    // keep track of "high voltage" sources
    this.sources = new Set();
    this.isSource = false;

    this.name = name;
    this._id = globalId++;
  }

  get () {
    return this.sources.size > 0;
  }

  set (state) {
    this.isSource = state;
    console.log(`Toggle source "${this.name}" ${this.isSource ? "on" : "off"}`)
    this.update(this);
  }

  update (source) {
    if (source === undefined) {
      throw new TypeError("source must be provided");
    }

    console.log(`Update "${this.name}", source "${source.name}" is ${source.isSource ? "on" : "off"}`);

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

    console.log(`"${this.name}" is ${this.get() ? (this.isSource ? "*on*" : "on") : "off"} (${this.sources.size} sources)`);

    // update connected nodes
    this.connections.forEach(node => node.update(source));
  }

  connect (node) {
    if (node === this) return;

    if (!this.connections.has(node)) {
      this.connections.add(node);
      this.update(node);

      node.connect(this);

      this.emit('update');
    }
  }

  getConnections() {
    return Array.from(this.connections.values()).map(node => {
      if (node._id > this._id) return [this, node];
      else                     return [node, this];
    });
  }
}