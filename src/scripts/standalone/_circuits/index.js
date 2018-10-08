import { deserialize } from './model/serialize';

const tools = require('./model/tools');

import CanvasView from './view/CanvasView';
import Toolbar from './view/Toolbar';
import Infobar from './view/Infobar';
import Modal from './view/Modal';

import Controller from './controller';

window.addEventListener('load', function () {
  var canvasView = getCanvasView(document.getElementById('canvas'));
  var toolbar = new Toolbar(document.getElementById('toolbar'), tools);
  var infobar = new Infobar(document.getElementById('infobar'));
  var modal = new Modal(this.document.getElementById('modal'));

  var controller = new Controller(canvasView, toolbar, infobar, modal);

  addCanvasListeners(canvasView, controller);
  toolbar.on('change', tool => controller.selectTool(tool));

  window.addEventListener('keydown', e => controller.handleKeyEvent(e));

  addDefaultItems(canvasView);
  toolbar.selectTool(tools[0].name);

  canvasView.drawBuffered();
});

function getCanvasView(canvasEl) {
  const canvasView = new CanvasView(canvasEl);

  function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;

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

  const touchAction = type => event => {
    event.preventDefault();

    var touch = event.changedTouches[0];
    var bounds = touch.target.getBoundingClientRect();

    var x = touch.clientX - bounds.x, y = touch.clientY - bounds.y;
    var root = canvasView.findAll(x, y);

    controller.handleMouseEvent({ type, x, y, root, event });
  };

  canvas.addEventListener('mousedown',  positionalAction('down'));
  canvas.addEventListener('mouseup',    positionalAction('up'));
  canvas.addEventListener('mousemove',  positionalAction('move'));
  canvas.addEventListener('mouseenter', positionalAction('enter'));
  canvas.addEventListener('mouseleave', positionalAction('leave'));
  canvas.addEventListener('wheel',      positionalAction('scroll'));

  canvas.addEventListener('touchstart', touchAction('enter'));
  canvas.addEventListener('touchstart', touchAction('down'));
  canvas.addEventListener('touchend',   touchAction('up'));
  canvas.addEventListener('touchend',   touchAction('leave'));
  canvas.addEventListener('touchmove',  touchAction('move'));

  canvas.oncontextmenu = () => false;
}

function addDefaultItems(canvasView) {
  // eslint-disable-next-line max-len
  const serialized = '{"o":[["n",1,1],["n",1,7],["c",3,3,0,"Not"],["c",3,5,0,"Not"],["c",6,1,0,"And"],["c",6,5,0,"And"],["c",10,3,0,"Or"],["n",14,4]],"c":[[[0],[4,0]],[[1],[2,0]],[[0],[3,0]],[[1],[5,1]],[[2,1],[4,1]],[[3,1],[5,0]],[[4,2],[6,0]],[[5,2],[6,1]],[[6,2],[7]]]}';
  deserialize(serialized).forEach(view => canvasView.addChild(view));
}