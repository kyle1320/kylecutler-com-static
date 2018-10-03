import Interaction from "../Interaction";
import { findFirst, diff } from "../treeUtils";
import NodeView from "../../view/NodeView";
import CircuitView from "../../view/CircuitView";
import ConnectionView from "../../view/ConnectionView";

export default class SelectInteraction extends Interaction {
  reset() {
    this.isClickCandidate = true;
    this.hovering = null;
  }

  handleMouseEvent(e) {
    if (this.controller.selectedTool !== 'point') return;

    var canvas = this.controller.canvas;

    var hoverTarget = findNode(e.root) || findCircuit(e.root) || findConnection(e.root);
    this.controller.hover(hoverTarget, () => this.isClickCandidate = false);

    switch (e.type) {
      case 'down':
        this.isClickCandidate = true;
        canvas.startSelection(e.root.x, e.root.y);

        break;
      case 'move':
        if (canvas.selectionArea) {
          canvas.endSelection(e.root.x, e.root.y);
          this.controller.hover(canvas.getSelected());
        }

        break;
      case 'up':
        if (this.isClickCandidate) {
          if (hoverTarget && hoverTarget.view instanceof NodeView) {
            var node = hoverTarget.view.data;
            node.set(!node.isSource);
          } else {
            this.controller.select(hoverTarget);
          }
        } else if (canvas.selectionArea) {
          this.controller.select(canvas.getSelected());
        }

        canvas.clearSelection();

        break;
    }
  }

  handleKeyEvent(e) {
    switch (e.keyCode) {
      case 65: // A
        if (e.ctrlKey) {
          e.preventDefault();
          this.controller.select(this.controller.canvas.getAll());
        }
        break;
      case 27: // ESC
      case 13: // Enter
        e.preventDefault();
        this.controller.select(null);
        break;
    }
  }
}

function findNode(tree) {
  return findFirst(tree, x => x.view instanceof NodeView);
}

function findCircuit(tree) {
  return findFirst(tree, x => x.view instanceof CircuitView);
}

function findConnection(tree) {
  return findFirst(tree, x => x.view instanceof ConnectionView);
}