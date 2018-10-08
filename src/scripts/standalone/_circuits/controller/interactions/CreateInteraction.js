import Interaction from '../Interaction';

import { findFirst } from '../treeUtils';

import Node from '../../model/Node';
import Circuit from '../../model/Circuit';

import View from '../../view/View';
import NodeView from '../../view/NodeView';
import CircuitView from '../../view/CircuitView';
import ConnectionView from '../../view/ConnectionView';
import Itembar from '../../view/Itembar';

export default class CreateInteraction extends Interaction {
  constructor(controller) {
    super(controller);

    this.circuits = [];
    this.circuitsMap = {};

    const addCircuit = (name, creator) => {
      var view = creator();
      var item = Itembar.makeCanvasItem(
        canvas => drawViewOnPreviewCanvas(canvas, view),
        name,
        () => this.selectCircuit(name),
        true
      );

      this.circuits.push(name);
      this.circuitsMap[name] = { item, view, creator };
    };

    addCircuit('Node', () => new NodeView(new Node(), 0, 0));

    const circuits = require('../../model/circuits');
    for (let name in circuits) {
      let def = circuits[name];
      addCircuit(name, () => new CircuitView(new Circuit(def), 0, 0));
    }
  }

  reset() {
    this.dragStart = null;
    this.dragEnd = null;
    this.previewCircuit = null;
    this.selectedCircuit = null;
  }

  meetsConditions() {
    return this.controller.selectedTool === 'create';
  }

  handleMouseEvent(e) {
    var targetNode = findNode(e.root);
    var targetView = targetNode && targetNode.view;
    let targetPos = targetNode && View.getRelativePosition(
      targetView,
      this.controller.canvas
    );

    switch (e.type) {
    case 'down':
      if (targetNode) {
        this.dragStart = targetNode.view;
        this.dragEnd = new NodeView(new Node(), targetPos.x, targetPos.y);
        this.dragEnd.parent = this.controller.canvas;
        this.previewCircuit = new ConnectionView(
          this.dragStart, this.dragEnd, this.controller.canvas
        );
        this.controller.canvas.setPreviewChild(this.previewCircuit);
      }

      break;
    case 'move':
      this.controller.hoverTree(targetNode);

      if (this.previewCircuit) {
        this.previewCircuit.setAttribute('hidden', false);
      }

      if (this.dragStart) {
        if (targetNode) {
          this.controller.move(this.dragEnd, targetPos.x, targetPos.y);
        } else {
          this.controller.move(
            this.dragEnd, e.root.x, e.root.y, e.event.shiftKey
          );
        }
      } else if (this.previewCircuit) {
        this.controller.move(
          this.previewCircuit,
          e.root.x - this.previewCircuit.dimensions.width / 2,
          e.root.y - this.previewCircuit.dimensions.height / 2,
          e.event.shiftKey
        );
      }

      break;
    case 'up':
      if (this.previewCircuit && this.dragStart) {
        if (targetView) {
          this.previewCircuit.setEndpoint(1, targetView);
          this.dragEnd = targetView;
        } else {
          this.controller.canvas.addChild(this.dragEnd);
        }

        if (!this.dragStart.data.connect(this.dragEnd.data)) {
          this.controller.canvas.setPreviewChild(null);
          this.previewCircuit = null;
        }
      }

      if (this.previewCircuit) {
        this.controller.canvas.addPreviewChild();
      }

      this.dragStart = null;
      this.dragEnd = null;
      this.previewCircuit = null;

      this.createNew();

      break;
    case 'enter':
      if (this.previewCircuit) {
        this.controller.move(
          this.previewCircuit,
          e.root.x - this.previewCircuit.dimensions.width / 2,
          e.root.y - this.previewCircuit.dimensions.height / 2
        );
        this.previewCircuit.setAttribute('hidden', false);
      }

      break;
    case 'leave':
      if (this.previewCircuit) {
        this.previewCircuit.setAttribute('hidden', true);
      }

      break;
    }
  }

  createNew() {
    if (this.selectedCircuit) {
      this.previewCircuit = this.circuitsMap[this.selectedCircuit].creator();
      this.previewCircuit.setAttribute('hidden', true);
      this.controller.canvas.setPreviewChild(this.previewCircuit);
    }
  }

  handleSelectTool(tool) {
    if (tool.name !== 'create') return;

    this.reset();

    if (this.previewCircuit) {
      this.controller.canvas.setPreviewChild(null);
      this.previewCircuit = null;
    }

    var infobar = this.controller.infobar;

    infobar.clear();

    this.circuits.forEach(name => infobar.addItem(this.circuitsMap[name].item));

    this.selectCircuit('Node');
  }

  selectCircuit(name) {
    this.selectedCircuit = name;
    this.controller.infobar.selectItem(this.circuitsMap[name].item);
    this.createNew();
  }
}

function findNode(tree) {
  return findFirst(tree, x => x.view instanceof NodeView);
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