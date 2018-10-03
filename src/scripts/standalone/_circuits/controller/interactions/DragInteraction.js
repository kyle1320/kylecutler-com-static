import Interaction from "../Interaction";
import { findFirst } from "../treeUtils";
import ConnectionView from "../../view/ConnectionView";

export default class DragInteraction extends Interaction {
  reset() {
    this.target = null;
    this.offsetX = null;
    this.offsetY = null;
  }

  meetsConditions() {
    return this.controller.selectedTool === 'drag';
  }

  handleMouseEvent(e) {
    this.controller.hover(getMoveableTarget(e.root));

    switch (e.type) {
      case 'down':
        var drag = getMoveableTarget(e.root);
        if (drag) {
          this.target = drag.view;
          this.offsetX = drag.x;
          this.offsetY = drag.y;
        }

        break;
      case 'move':
        if (this.target) {
          if (this.target === this.controller.canvas) {
            var {x, y} = this.controller.canvas.dimensions;
            e.root.x += x;
            e.root.y += y;
          }

          this.controller.move(
            this.target,
            e.root.x - this.offsetX,
            e.root.y - this.offsetY,
            e.event.shiftKey
          );
        }

        break;
      case 'up':
        this.target = null;

        break;
    }
  }
}

function getMoveableTarget(tree) {
  var tree = findFirst(tree, (x, l) => l === 1 && !(x.view instanceof ConnectionView)) || tree;
  tree && (tree.children = null);
  return tree;
}