import ConnectionView from "../view/ConnectionView";
import CircuitView from "../view/CircuitView";
import NodeView from "../view/NodeView";
import Circuit from "./Circuit";
import View from "../view/View";
import Node from "./Node";

const circuits = require('./circuits');

export function serialize(views) {
  var data = {
    objects: [],
    connections: []
  };
  var nodesMap = new Map();
  var allConnections = [];

  views.forEach(view => {
    var index = data.objects.length;
    if (view instanceof NodeView) {
      nodesMap.set(view.data, [index]);
      data.objects.push([
        'n',
        view.dimensions.x,
        view.dimensions.y
      ]);
    } else if (view instanceof CircuitView) {
      for (var i = view.data.pins.length - 1; i >= 0; i--) {
        nodesMap.set(view.data.pins[i], [index, i]);
      }
      data.objects.push([
        'c',
        view.dimensions.x,
        view.dimensions.y,
        view.rotation,
        view.data.definition.key
      ]);
    } else if (view instanceof ConnectionView) {
      // delay until the end, so we can be sure that all nodes have entries in
      // the nodesMap before we start trying to take values out of it.
      allConnections.push(view);
    }
  });

  allConnections.forEach(conn => {
    var a = nodesMap.get(conn.data[0].data);
    var b = nodesMap.get(conn.data[1].data);

    if (!a || !b) {
      console.warn("Unable to find node while serializing connection");
      return;
    }

    data.connections.push([a, b]);
  });

  return JSON.stringify({ o: data.objects, c: data.connections });
}

export function deserialize(str) {
  var data = JSON.parse(str);

  var objects = data.o.map(obj => {
    switch (obj[0]) {
      case 'n': // Node ['n', x, y]
        return new NodeView(new Node(), obj[1], obj[2]);
      case 'c': // Circuit ['c', x, y, rotation, definition]

        // TODO: allow for user-defined circuits
        var circuit = new CircuitView(new Circuit(circuits[obj[4]]), obj[1], obj[2]);
        circuit.rotate(obj[3]);
        return circuit;
      default:
        throw new Error("Unexpected object while deserializing data");
    }
  });

  var connections = data.c.map(conn => {
    var nodeA = conn[0].length === 1
                ? objects[conn[0][0]]
                : View.getViewFromDatasource(objects[conn[0][0]].data.pins[conn[0][1]]);
    var nodeB = conn[1].length === 1
                ? objects[conn[1][0]]
                : View.getViewFromDatasource(objects[conn[1][0]].data.pins[conn[1][1]]);

    nodeA.data.connect(nodeB.data);

    return new ConnectionView(nodeA, nodeB);
  });

  return objects.concat(connections);
}