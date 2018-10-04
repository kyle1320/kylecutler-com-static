import Interaction from "../Interaction";
import { findFirst } from "../treeUtils";
import NodeView from "../../view/NodeView";
import CircuitView from "../../view/CircuitView";
import ConnectionView from "../../view/ConnectionView";

export default class SelectInteraction extends Interaction {
  reset() {
    this.isClickCandidate = true;
    this.lastHoverTarget = null;
  }

  handleMouseEvent(e) {
    if (this.controller.selectedTool !== 'point') return;

    var canvas = this.controller.canvas;

    var hoverTree = findNode(e.root) || findCircuit(e.root) || findConnection(e.root);

    var hoverTarget = hoverTree && hoverTree.view;
    if (hoverTarget !== this.lastHoverTarget) {
      this.isClickCandidate = false;
    }
    this.lastHoverTarget = hoverTarget;

    switch (e.type) {
      case 'down':
        if (!canvas.selectionArea) {
          this.isClickCandidate = true;
          canvas.startSelection(e.root.x, e.root.y);
        }

        break;
      case 'move':
        if (canvas.selectionArea) {
          canvas.endSelection(e.root.x, e.root.y);
          this.controller.hover(canvas.getSelected());
        } else {
          this.controller.hover(hoverTree);
        }

        break;
      case 'up':
        if (this.isClickCandidate && hoverTree) {
          if (hoverTree.view instanceof NodeView) {
            var node = hoverTree.view.data;
            node.set(!node.isSource);
          } else {
            this.controller.select(hoverTree);
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

  handleSelectTool(tool) {
    if (tool.name !== 'point') return;

    this.controller.infobar.showInfo('point', this.controller.selected);
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