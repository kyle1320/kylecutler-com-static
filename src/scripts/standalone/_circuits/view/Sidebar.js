import NodeView from "../view/NodeView";
import CircuitView from "../view/CircuitView";
import Node from "../model/Node";
import Circuit from "../model/Circuit";

import { EventEmitter } from "events";
import { makeElement } from "../../../utils";

export default class Sidebar extends EventEmitter {
  constructor (element, circuits) {
    super();

    this.element = element;

    this.setCircuits(circuits);
  }

  setCircuits(circuits) {
    this.circuitsMap = {
      Node: {
        creator: () => new NodeView(new Node(), 0, 0),
        element: null
      }
    };
    for (var c in circuits) {
      let data = circuits[c];
      this.circuitsMap[c] = {
        creator: () => new CircuitView(new Circuit(data), 0, 0),
        element: null
      };
    }
  }

  deselectCircuit() {
    if (!this.selectedCircuit) return;

    var element = this.circuitsMap[this.selectedCircuit].element

    element.className = element.className.replace(/\s*selected/g, '');
  }

  selectCircuit(name) {
    for (var cName in this.circuitsMap) {
      var element = this.circuitsMap[cName].element;

      element.className = element.className.replace(/\s*selected/g, '');

      if (cName === name) {
        element.className += ' selected';
      }
    }

    this.selectedCircuit = name;

    this.emit('select-circuit', this.circuitsMap[name].creator);
  }

  showCircuitsList() {
    this.showEmpty();
    for (var cName in this.circuitsMap) {
      var c = this.circuitsMap[cName];
      let name = cName;
      if (!c.element) {
        c.element = makeElement(
          { className: "circuit" },
          name,
          { click: () => this.selectCircuit(name) }
        );
      }
      this.element.appendChild(c.element);
    }
  }

  editView(view) {
    this.showEmpty();
    if (!view) {
      this.element.innerHTML = "Select an element to edit";
      return;
    }
    this.element.innerHTML = `Editing ${view.constructor.name} ${view._id}`;
  }

  showEmpty() {
    this.element.innerHTML = "";
  }
}