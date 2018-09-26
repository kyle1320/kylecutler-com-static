import Circuit from './model/Circuit';
import Node from './model/Node';

const circuits = require('./model/circuits');

import CanvasView from "./view/CanvasView";
import NodeView from "./view/NodeView";
import CircuitView from "./view/CircuitView";
import { defaultStyle } from './view/styles';
import Controller from "./controller";

window.addEventListener('load', function () {
  var canvasView = getCanvasView(document.getElementById('canvas'));

  var toolbarView = null; // document.getElementById('toolbar')
  var sidebarView = null; // document.getElementById('sidebar')

  var controller = new Controller(canvasView, toolbarView, sidebarView);

  // TODO: add listeners here

  addDefaultItems(canvasView);

  canvasView.drawBuffered();
});

function getCanvasView(canvasEl) {
  const canvasView = new CanvasView(canvasEl, defaultStyle);

  function resizeCanvas() {
    canvasEl.width = canvasEl.parentElement.clientWidth;
    canvasEl.height = canvasEl.parentElement.clientHeight;

    canvasView.drawBuffered();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  canvasView.on('update', canvasView.drawBuffered);

  return canvasView;
}

function addItem(canvasView, item, x, y) {
  var view = (item instanceof Node)
              ? new NodeView(item, x, y, defaultStyle)
              : new CircuitView(item, x, y, defaultStyle);

  canvasView.addChild(view);
}

function addDefaultItems(canvasView) {
  var input1 = new Node("input A");
  var input2 = new Node("input B");
  var output = new Node("output");

  var and1 = new Circuit(circuits.And);
  var and2 = new Circuit(circuits.And);

  var or = new Circuit(circuits.Or);

  var not1 = new Circuit(circuits.Not);
  var not2 = new Circuit(circuits.Not);

  addItem(canvasView, input1, 1, 1);
  addItem(canvasView, input2, 1, 7);
  addItem(canvasView, not1, 3, 3);
  addItem(canvasView, not2, 3, 5);
  addItem(canvasView, and1, 6, 1);
  addItem(canvasView, and2, 6, 5);
  addItem(canvasView, or, 10, 3);
  addItem(canvasView, output, 14, 4);

  input1.connect(and1.pins[0]);
  input2.connect(not1.pins[0]);
  input1.connect(not2.pins[0]);
  input2.connect(and2.pins[1]);
  not1.pins[1].connect(and1.pins[1]);
  not2.pins[1].connect(and2.pins[0]);
  and1.pins[2].connect(or.pins[0]);
  and2.pins[2].connect(or.pins[1]);
  or.pins[2].connect(output);

  setTimeout(() => input1.set(true), 1000);
  setTimeout(() => input2.set(true), 2000);
}