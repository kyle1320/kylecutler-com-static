import Circuit from './model/Circuit';
import Node from './model/Node';

const circuits = require('./model/circuits');
const tools = require('./model/tools');

import CanvasView from "./view/CanvasView";
import CircuitView from "./view/CircuitView";
import NodeView from "./view/NodeView";
import Toolbar from './view/Toolbar';
import Sidebar from './view/Sidebar';
import Controller from "./controller";
import ConnectionView from './view/ConnectionView';
import View from './view/View';

window.addEventListener('load', function () {
  var canvasView = getCanvasView(document.getElementById('canvas'));
  var toolbar = new Toolbar(document.getElementById('toolbar'), tools);
  var sidebar = new Sidebar(document.getElementById('sidebar'), circuits);

  var controller = new Controller(canvasView, toolbar, sidebar);

  addCanvasListeners(canvasView, controller);
  toolbar.on('change', tool => controller.selectTool(tool));
  sidebar.on('select-circuit', circuit => controller.selectCircuit(circuit));

  window.addEventListener('keydown', e => controller.handleKeyEvent(e));

  addDefaultItems(canvasView);
  toolbar.selectTool(tools[0].name);

  canvasView.drawBuffered();
});

function getCanvasView(canvasEl) {
  const canvasView = new CanvasView(canvasEl);

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

function addCanvasListeners(canvasView, controller) {
  var canvas = canvasView.canvas;

  const positionalAction = type => event => {
    event.preventDefault();

    var x = event.offsetX, y = event.offsetY;
    var root = canvasView.findAll(x, y);

    controller.handleMouseEvent({ type, x, y, root, event });
  };

  canvas.addEventListener('mousedown',  positionalAction('down'));
  canvas.addEventListener('mouseup',    positionalAction('up'));
  canvas.addEventListener('mousemove',  positionalAction('move'));
  canvas.addEventListener('mouseenter', positionalAction('enter'));
  canvas.addEventListener('mouseleave', positionalAction('leave'));
  // canvas.addEventListener('click',     positionalAction('click'));

  canvas.oncontextmenu = () => false;
}

function addItem(canvasView, item, x, y) {
  var view = (item instanceof Node)
              ? new NodeView(item, x, y)
              : new CircuitView(item, x, y);

  canvasView.addChild(view);
}

function addConnection(canvasView, nodeA, nodeB) {
  var nodeViewA = View.getViewFromDatasource(nodeA);
  var nodeViewB = View.getViewFromDatasource(nodeB);

  nodeA.connect(nodeB);

  var connectionView = new ConnectionView(nodeViewA, nodeViewB, canvasView);

  canvasView.addChild(connectionView);
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

  addConnection(canvasView, input1, and1.pins[0]);
  addConnection(canvasView, input2, not1.pins[0]);
  addConnection(canvasView, input1, not2.pins[0]);
  addConnection(canvasView, input2, and2.pins[1]);
  addConnection(canvasView, not1.pins[1], and1.pins[1]);
  addConnection(canvasView, not2.pins[1], and2.pins[0]);
  addConnection(canvasView, and1.pins[2], or.pins[0]);
  addConnection(canvasView, and2.pins[2], or.pins[1]);
  addConnection(canvasView, or.pins[2], output);

  // setInterval(() => input1.set(!input1.isSource), 2000);
  // setTimeout(() => {
  //   setInterval(() => input2.set(!input2.isSource), 2000);
  // }, 1000);
}