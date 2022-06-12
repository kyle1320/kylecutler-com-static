import View from './View';
import ConnectionView from './ConnectionView';
import NodeView from './NodeView';
import CircuitView from './CircuitView';
import Node from '../model/Node';
import Circuit from '../model/Circuit';

import circuits from '../model/Circuits';

type SerializedObject = NodeSerializedObject | CircuitSerializedObject;
type NodeSerializedObject = [string, number, number, number];
type CircuitSerializedObject = [string, number, number, number, string];

type NodeIndex = [number, number] | [number];
type SerializedConnection = [NodeIndex, NodeIndex];

interface SerializedData {
  o: SerializedObject[];
  c: SerializedConnection[];
}

export default class Serialize {
  public static serialize(views: View[]): string {
    const data = {
      objects: [] as SerializedObject[],
      connections: [] as SerializedConnection[]
    };
    const nodesMap = new Map<Node, NodeIndex>();
    const allConnections: ConnectionView[] = [];

    views.forEach((view) => {
      const index = data.objects.length;
      if (view instanceof NodeView) {
        nodesMap.set(view.data, [index]);
        data.objects.push([
          'n',
          +view.dimensions.x.toFixed(3),
          +view.dimensions.y.toFixed(3),
          view.data.isSource ? 1 : 0
        ] as NodeSerializedObject);
      } else if (view instanceof CircuitView) {
        for (let i = view.data.pins.length - 1; i >= 0; i--) {
          nodesMap.set(view.data.pins[i], [index, i]);
        }
        data.objects.push([
          'c',
          +view.dimensions.x.toFixed(3),
          +view.dimensions.y.toFixed(3),
          view.rotation,
          view.data.definition.key
        ] as CircuitSerializedObject);
      } else if (view instanceof ConnectionView) {
        // delay until the end, so we can be sure that all nodes have entries in
        // the nodesMap before we start trying to take values out of it.
        allConnections.push(view);
      }
    });

    allConnections.forEach((conn) => {
      const a = nodesMap.get(conn.data[0].data);
      const b = nodesMap.get(conn.data[1].data);

      if (!a || !b) {
        console.warn('Unable to find node while serializing connection');
        return;
      }

      data.connections.push([a, b]);
    });

    return JSON.stringify({
      o: data.objects,
      c: data.connections
    } as SerializedData);
  }

  public static deserialize(str: string): View[] {
    const data = JSON.parse(str) as SerializedData;

    const objects: View[] = data.o.map((obj: SerializedObject) => {
      switch (obj[0]) {
        case 'n': // Node ['n', x, y, isSource]
          return new NodeView(new Node(!!obj[3]), obj[1], obj[2]);
        case 'c': {
          // Circuit ['c', x, y, rotation, definition]

          // TODO: allow for user-defined circuits
          const circuit = new CircuitView(
            new Circuit(circuits[obj[4]]),
            obj[1],
            obj[2]
          );
          circuit.rotate(obj[3]);
          return circuit;
        }
        default:
          throw new Error('Unexpected object while deserializing data');
      }
    });

    const connections = data.c.map((conn: SerializedConnection) => {
      const nodeA =
        conn[0].length === 1
          ? objects[conn[0][0]]
          : View.getViewFromDatasource(
              objects[conn[0][0]].data.pins[conn[0][1]]
            );
      const nodeB =
        conn[1].length === 1
          ? objects[conn[1][0]]
          : View.getViewFromDatasource(
              objects[conn[1][0]].data.pins[conn[1][1]]
            );

      nodeA.data.connect(nodeB.data);

      return new ConnectionView(nodeA, nodeB);
    });

    return objects.concat(connections);
  }
}
