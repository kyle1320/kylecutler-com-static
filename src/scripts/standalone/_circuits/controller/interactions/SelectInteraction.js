import Interaction from "../Interaction";
import { findFirst } from "../treeUtils";

import NodeView from "../../view/NodeView";
import CircuitView from "../../view/CircuitView";
import ConnectionView from "../../view/ConnectionView";
import Itembar from "../../view/Itembar";

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
            this.select(hoverTree);
          }
        } else if (canvas.selectionArea) {
          this.select(canvas.getSelected());
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
          this.select(this.controller.canvas.getAll());
        }
        break;
      case 27: // ESC
      case 13: // Enter
        e.preventDefault();
        this.select(null);
        break;
    }
  }

  handleSelectTool(tool) {
    if (tool.name !== 'point') return;

    this.showInfo();
  }

  select(tree) {
    this.controller.select(tree);
    this.showInfo();
  }

  showInfo() {
    var views = this.controller.selected;
    var infobar = this.controller.infobar;

    infobar.clear();

    if (!views) {
      infobar.showGenericInfo('point');
      return;
    }

    infobar.addInfoText(`${views.length} element${views.length === 1 ? '' : 's'} selected`);

    if (views.length === 1) {
      if (views[0] instanceof CircuitView) {
        infobar.addItem(
          Itembar.makeItem("Rotate 90°", () => views[0].rotate(1))
        );
      }
    }

    infobar.addItem(Itembar.makeItem("Delete", () => {
      views.forEach(v => v.remove());
      this.select(null);
    }));
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