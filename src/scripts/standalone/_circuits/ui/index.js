import {AndCircuit, OrCircuit, NotCircuit} from '../model/Circuits';
import Node from '../model/Node';
import Grid from './canvas/Grid';
import bufferEvent from '../utils/eventBuffer';
import { init } from './interaction';

export default class UI {
  constructor(canvas) {
    var grid = new Grid();
    var viewParams = require('./viewParams');

    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      refresh();
    }

    function updateCanvas() {
      const context = canvas.getContext("2d");

      console.log("redraw");

      context.clearRect(0, 0, canvas.width, canvas.height);
      grid.draw(context, viewParams);
    }

    function refresh() {
      bufferEvent('redraw', updateCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    addDefaultItems(grid);

    // TODO: setup toolbar, etc..

    grid.on('update', refresh);
    refresh();

    this.grid = grid;
    this.viewParams = viewParams;
    this.canvas = canvas;
    this.refresh = refresh;

    init(this);
  }
}

// an XOR gate
function addDefaultItems(grid) {
  var input1 = new Node("input A");
  var input2 = new Node("input B");
  var output = new Node("output");

  var and1 = new AndCircuit("and 1");
  var and2 = new AndCircuit("and 2");

  var or = new OrCircuit("or");

  var not1 = new NotCircuit("not 1");
  var not2 = new NotCircuit("not 2");

  input1.connect(and1.pins[0]);
  input2.connect(not1.pins[0]);
  input1.connect(not2.pins[0]);
  input2.connect(and2.pins[1]);
  not1.pins[1].connect(and1.pins[1]);
  not2.pins[1].connect(and2.pins[0]);
  and1.pins[2].connect(or.pins[0]);
  and2.pins[2].connect(or.pins[1]);
  or.pins[2].connect(output);

  grid.addItem(input1, 1, 1);
  grid.addItem(input2, 1, 7);
  grid.addItem(not1, 3, 3);
  grid.addItem(not2, 3, 5);
  grid.addItem(and1, 6, 1);
  grid.addItem(and2, 6, 5);
  grid.addItem(or, 10, 3);
  grid.addItem(output, 14, 4);
}