import Interaction from "../Interaction";
import { findFirst, traverse, mapTree } from "../treeUtils";
import ConnectionView from "../../view/ConnectionView";
import View from "../../view/View";

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
    var canvas = this.controller.canvas;
    var selectedHover = findFirst(e.root, x => x.view != canvas && x.view.attributes.active);
    var target = null;

    if (!selectedHover) {
      target = getMoveableTarget(e.root);
    }

    this.controller.hover(target);

    switch (e.type) {
      case 'down':
        if (selectedHover) {
          this.target = mapTree(this.controller.selectedTree, n => {
            if (n instanceof ConnectionView) return null;
            var { x, y } = View.getRelativePosition(n.view, canvas);
            return {
              view: n.view,
              x: e.root.x - x,
              y: e.root.y - y,
              children: n.children
            };
          });
        } else {
          this.target = target;
        }

        break;
      case 'move':
        traverse(this.target, (view, data) => {
          if (view === this.controller.canvas) {

            // don't drag the canvas if there are children
            if (data.children) return;

            var {x, y} = view.dimensions;
            data = {
              x: data.x - x,
              y: data.y - y
            };
          }

          this.controller.move(
            view,
            e.root.x - data.x,
            e.root.y - data.y,
            e.event.shiftKey
          );
        });

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