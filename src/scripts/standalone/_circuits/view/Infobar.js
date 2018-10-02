import NodeView from "./NodeView";
import CircuitView from "./CircuitView";
import Node from "../model/Node";
import Circuit from "../model/Circuit";

import { EventEmitter } from "events";
import { makeElement } from "../../../utils";

const toolText = {
  point: "Select an element to edit",
  drag: "Drag an object or the grid to move it",
  debug: "Move the cursor around to print information for debugging",
  zoomin: "Click on the grid to zoom in",
  zoomout: "Click on the grid to zoom out"
};

export default class Infobar extends EventEmitter {
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

  showCircuitsInfo() {
    this.showEmpty();
    for (var cName in this.circuitsMap) {
      var c = this.circuitsMap[cName];
      let name = cName;
      if (!c.element) {
        c.element = makeElement(
          { className: "item__content circuit" },
          name,
          { click: () => this.selectCircuit(name) }
        );
      }
      this.element.appendChild(makeElement({ className: 'item' }, [c.element]));
    }
  }

  showPointerInfo(view) {
    this.showEmpty();
    if (view instanceof CircuitView) {
      this.element.appendChild(makeElement("button", "Rotate 90", {
        click: () => view.rotate(1)
      }))
    } else {
      this.element.textContent = `Editing ${view.constructor.name} ${view._id}`;
    }
  }

  showInfo(toolName) {
    this.element.innerHTML = `<div class="info">${toolText[toolName]}</div>`;
  }

  showEmpty() {
    this.element.innerHTML = "";
  }
}