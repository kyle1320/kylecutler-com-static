import { EventEmitter } from "events";
import { makeElement } from "../../../utils";

export default class Sidebar extends EventEmitter {
  constructor (element, circuits) {
    super();

    this.element = element;

    this.setCircuits(circuits);
  }

  setCircuits(circuits) {
    this.circuitsMap = {};
    for (var c in circuits) {
      this.circuitsMap[c] = {
        data: circuits[c],
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

    this.emit('select-circuit', this.circuitsMap[name].data);
  }

  showCircuitsList() {
    this.element.innerHtml = "";
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
}