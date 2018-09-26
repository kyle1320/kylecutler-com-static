import {AndCircuit, OrCircuit, NotCircuit} from '../model/Circuits';
import Node from '../model/Node';
import Grid from '../viewmodel/Grid';
import bufferEvent from '../utils/eventBuffer';
import { defaultStyle } from './styles';
import getItemView from './getItemView';

const Interaction = require('./interaction');

export default class UI {
  constructor(canvas, toolbar, sidebar) {
    var grid = new Grid(defaultStyle);

    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      refresh();
    }

    function updateCanvas() {
      const context = canvas.getContext("2d");

      console.log("redraw");

      context.clearRect(0, 0, canvas.width, canvas.height);
      grid.draw(context);
    }

    function refresh() {
      bufferEvent('redraw', updateCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    addDefaultItems(grid);

    grid.on('update', refresh);
    refresh();

    this.grid = grid;
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.sidebar = sidebar;

    Interaction.init(this);
  }
}

function addItem(grid, item, x, y) {
  var view = getItemView(item, defaultStyle);

  view.move(x, y);

  grid.insert(view);
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

  addItem(grid, input1, 1, 1);
  addItem(grid, input2, 1, 7);
  addItem(grid, not1, 3, 3);
  addItem(grid, not2, 3, 5);
  addItem(grid, and1, 6, 1);
  addItem(grid, and2, 6, 5);
  addItem(grid, or, 10, 3);
  addItem(grid, output, 14, 4);

  input1.connect(and1.pins[0]);
  input2.connect(not1.pins[0]);
  input1.connect(not2.pins[0]);
  input2.connect(and2.pins[1]);
  not1.pins[1].connect(and1.pins[1]);
  not2.pins[1].connect(and2.pins[0]);
  and1.pins[2].connect(or.pins[0]);
  and2.pins[2].connect(or.pins[1]);
  or.pins[2].connect(output);
}