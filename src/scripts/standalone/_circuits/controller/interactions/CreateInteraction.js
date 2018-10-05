import Interaction from "../Interaction";
import { findFirst } from "../treeUtils";
import Node from "../../model/Node";
import NodeView from "../../view/NodeView";
import ConnectionView from "../../view/ConnectionView";
import View from "../../view/View";

export default class CreateInteraction extends Interaction {
  reset() {
    this.dragStart = null;
    this.dragEnd = null;
    this.previewCircuit = null;
    this.creator = null;
  }

  meetsConditions() {
    return this.controller.selectedTool === 'create';
  }

  handleMouseEvent(e) {
    var targetNode = findNode(e.root);

    switch (e.type) {
      case 'down':
        if (targetNode) {
          this.dragStart = targetNode.view;
          this.dragEnd = new NodeView(new Node(), e.root.x, e.root.y);
          this.dragEnd.parent = this.controller.canvas;
          this.previewCircuit = new ConnectionView(this.dragStart, this.dragEnd, this.controller.canvas);
          this.previewCircuit.setAttribute('hidden', true);
          this.controller.canvas.setPreviewChild(this.previewCircuit);
        }

        break;
      case 'move':
        this.controller.hover(targetNode);

        if (this.dragStart) {
          if (targetNode) {
            var pos = View.getRelativePosition(targetNode.view, this.controller.canvas);
            this.controller.move(this.dragEnd, pos.x, pos.y);
          } else {
            this.previewCircuit && this.previewCircuit.setAttribute('hidden', false);
            this.controller.move(this.dragEnd, e.root.x, e.root.y, e.event.shiftKey);
          }
        } else {
          if (targetNode) {
            this.previewCircuit.setAttribute('hidden', true);
          } else if (this.previewCircuit) {
            this.previewCircuit.setAttribute('hidden', false);
            this.controller.move(
              this.previewCircuit,
              e.root.x - this.previewCircuit.dimensions.width / 2,
              e.root.y - this.previewCircuit.dimensions.height / 2,
              e.event.shiftKey
            );
          }
        }

        break;
      case 'up':
        if (this.previewCircuit) {
          if (this.dragStart) {
            if (targetNode) {
              targetNode = targetNode.view;
            } else {
              this.controller.canvas.addChild(this.dragEnd);
              targetNode = this.dragEnd;
            }

            if (this.dragStart !== targetNode) {
              this.previewCircuit.setEndpoint(1, targetNode);
              this.dragStart.data.connect(targetNode.data);
              this.controller.canvas.addPreviewChild();
            }
          } else {
            this.controller.canvas.addPreviewChild();
          }

          this.previewCircuit = null;

          this.createNew();
        }

        this.dragStart = null;
        this.dragEnd = null;

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
    if (this.creator) {
      this.previewCircuit = this.creator();
      this.previewCircuit.setAttribute('hidden', true);
      this.controller.canvas.setPreviewChild(this.previewCircuit);
    }
  }

  handleSelectTool(tool) {
    this.reset();

    if (this.previewCircuit) {
      this.controller.canvas.setPreviewChild(null);
      this.previewCircuit = null;
    }

    this.controller.infobar.selectCircuit('Node');
  }

  handleSelectCircuit(creator) {
    this.creator = creator;
    this.createNew();
  }
}

function findNode(tree) {
  return findFirst(tree, x => x.view instanceof NodeView);
}