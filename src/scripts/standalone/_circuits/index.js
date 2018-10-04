import Circuit from './model/Circuit';
import Node from './model/Node';

const circuits = require('./model/circuits');
const tools = require('./model/tools');

import CanvasView from "./view/CanvasView";
import CircuitView from "./view/CircuitView";
import NodeView from "./view/NodeView";
import Toolbar from './view/Toolbar';
import Infobar from './view/Infobar';
import Controller from "./controller";
import ConnectionView from './view/ConnectionView';
import View from './view/View';
import { deserialize } from './model/serialize';
import Modal from './view/Modal';

window.addEventListener('load', function () {
  var canvasView = getCanvasView(document.getElementById('canvas'));
  var toolbar = new Toolbar(document.getElementById('toolbar'), tools);
  var infobar = new Infobar(document.getElementById('infobar'), circuits);
  var modal = new Modal(this.document.getElementById('modal'));

  var controller = new Controller(canvasView, toolbar, infobar, modal);

  addCanvasListeners(canvasView, controller);
  toolbar.on('change', tool => controller.selectTool(tool));
  infobar.on('select-circuit', c => controller.selectCircuit(c));

  window.addEventListener('keydown', e => controller.handleKeyEvent(e));

  addDefaultItems(canvasView);
  // stressTest(canvasView);
  toolbar.selectTool(tools[0].name);

  // window.serialize = () => serialize(canvasView.children.all());
  // window.deserialize = s => deserialize(s).forEach(v => canvasView.addChild(v));

  canvasView.drawBuffered();
});

function getCanvasView(canvasEl) {
  const canvasView = new CanvasView(canvasEl);
  const scale = window.devicePixelRatio || 1;

  function resizeCanvas() {
    var rawWidth = canvasEl.parentElement.clientWidth;
    var rawHeight = canvasEl.parentElement.clientHeight;

    canvasEl.style.width = rawWidth + 'px';
    canvasEl.style.height = rawHeight + 'px';

    canvasEl.width = rawWidth * scale;
    canvasEl.height = rawHeight * scale;

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
  canvas.addEventListener('wheel',      positionalAction('scroll'));

  canvas.oncontextmenu = () => false;
}

function addDefaultItems(canvasView) {
  const serialized = `{"o":[["n",1,1],["n",1,7],["c",3,3,0,"Not"],["c",3,5,0,"Not"],["c",6,1,0,"And"],["c",6,5,0,"And"],["c",10,3,0,"Or"],["n",14,4]],"c":[[[0],[4,0]],[[1],[2,0]],[[0],[3,0]],[[1],[5,1]],[[2,1],[4,1]],[[3,1],[5,0]],[[4,2],[6,0]],[[5,2],[6,1]],[[6,2],[7]]]}`;
  deserialize(serialized).forEach(view => canvasView.addChild(view));
}

function stressTest(canvasView) {
  var ccts = Object.values(circuits);
  const randomCircuit = () => new Circuit(ccts[Math.floor(Math.random() * ccts.length)]);
  const randomObject = () => Math.random() < (1 / (ccts.length + 1)) ? new Node() : randomCircuit();
  const numObjects = 3000;
  const numConnections = 3000;
  const span = 150;

  var nodes = [];

  for (var i = 0; i < numObjects; i++) {
    var item = randomObject();
    var view = (item instanceof Node)
      ? new NodeView(item, (Math.random() - .5) * span, (Math.random() - .5) * span)
      : new CircuitView(item, (Math.random() - .5) * span, (Math.random() - .5) * span);
    canvasView.addChild(view);
    if (item instanceof Node) {
      nodes.push(item);
    } else {
      nodes = nodes.concat(item.pins);
    }
    console.log(i);
  }

  for (var i = 0; i < numConnections; i++) {
    var nodeA = nodes[Math.floor(Math.random() * nodes.length)];
    var nodeViewA = View.getViewFromDatasource(nodeA);
    var {x, y} = View.getRelativePosition(nodeViewA, canvasView)
    var nearby = canvasView.findChild(x, y, 5);
    var nearbyNodes = nearby.reduce((agg, view) => {
      return agg.concat(view instanceof NodeView ? view.data : view.data.pins)
    }, []).filter(x => !!x);
    if (nearbyNodes.length === 0) continue;
    var nodeB = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];

    nodeA.connect(nodeB);
    canvasView.addChild(new ConnectionView(
      View.getViewFromDatasource(nodeA),
      View.getViewFromDatasource(nodeB), canvasView));
    console.log(i);
  }
}