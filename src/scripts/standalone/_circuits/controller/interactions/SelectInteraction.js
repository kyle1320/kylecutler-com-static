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
            this.select(hoverTarget);
          }
        } else if (canvas.selectionArea) {
          this.select(canvas.getSelected());
        }

        canvas.clearSelection();

        break;
    }
  }

  handleKeyEvent(e) {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          this.select(this.controller.canvas.getAll());
          break;
      }
    }
  }

  select(tree) {
    this.controller.infobar.showInfo('point', tree.children.map(x => x.view));

    this.controller.select(tree);
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