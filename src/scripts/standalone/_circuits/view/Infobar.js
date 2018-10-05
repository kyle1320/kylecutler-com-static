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
        view: null,
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
        var canvas = makeElement({tag: 'canvas', width: '40', height: '40'});
        c.view = c.creator();
        c.element = makeElement(
          { className: "item__content item__content--canvas circuit" },
          [canvas, makeElement({ className: "label" }, name)],
          { click: () => this.selectCircuit(name) }
        );
        drawViewOnPreviewCanvas(canvas, c.view);
      }
      this.element.appendChild(makeElement({ className: 'item' }, [c.element]));
    }
  }

  showPointerInfo(views) {
    this.showEmpty();

    var buttons = [];

    this.showInfoText(`${views.length} element${views.length === 1 ? '' : 's'} selected`);

    if (views.length === 1) {
      if (views[0] instanceof CircuitView) {
        buttons.push(makeElement(
          { className: "item__content" },
          "Rotate 90°",
          { click: e => { e.preventDefault(); views[0].rotate(1); } }
        ));
      }
    }

    buttons.forEach(btn => this.element.appendChild(
      makeElement({ className: 'item' }, [btn])
    ));
  }

  showInfo(toolName, data) {
    switch(toolName) {
      case 'point':
        if (data && data.length) return this.showPointerInfo(data);
        break;
      case 'create':
        return this.showCircuitsInfo();
    }

    // default content
    this.showInfoText(toolText[toolName]);
  }

  showInfoText(text) {
    this.element.innerHTML = `<div class="info">${text}</div>`
  }

  showEmpty() {
    this.element.innerHTML = "";
  }
}

function drawViewOnPreviewCanvas(canvas, view) {
  var size = 30 * (window.devicePixelRatio || 1);

  canvas.style.width = '30px';
  canvas.style.height = '30px';
  canvas.width = size;
  canvas.height = size;

  var dim = view.getDimensions();
  var context = canvas.getContext('2d');
  var scale = Math.min(size*.5, size*.8 / Math.max(dim.width, dim.height));
  var drawWidth = scale * dim.width;
  var drawHeight = scale * dim.height;
  var drawX = (size - drawWidth) / 2;
  var drawY = (size - drawHeight) / 2;

  context.lineWidth = 0.1;

  context.transform(
    scale, 0, 0, scale, drawX, drawY
  );

  view.draw(context);
}