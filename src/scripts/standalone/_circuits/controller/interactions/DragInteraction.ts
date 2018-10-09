import Interaction from '../Interaction';
import { findFirst } from '../treeUtils';
import ConnectionView from '../../view/ConnectionView';
import View from '../../view/View';
import Itembar from '../../view/Itembar';
import { toggleClass } from '../../../../utils';
import { PositionalEvent, Tool, PositionalTree } from '../../model/types';

declare type MoveData = {
  view: View,
  x: number,
  y: number
};

export default class DragInteraction extends Interaction {
  target: MoveData[];
  offsetX: number;
  offsetY: number;
  forceSnapping: boolean;

  reset() {
    this.target = null;
    this.offsetX = null;
    this.offsetY = null;
    this.forceSnapping = false;
  }

  meetsConditions() {
    return this.controller.selectedTool === 'drag';
  }

  handleMouseEvent(e: PositionalEvent) {
    var canvas = this.controller.canvas;
    var selectedHover = findFirst(
      e.root,
      x => x.data != canvas && x.data.attributes.active
    );
    var target = null;

    if (!selectedHover) {
      target = getMoveableTarget(e.root);
    }

    this.controller.hoverTree(target);

    switch (e.type) {
    case 'down':
      if (selectedHover && this.controller.selected) {
        this.target = this.controller.selected.map(view => {
          if (view instanceof ConnectionView) return null;
          var { x, y } = View.getRelativePosition(view, canvas);
          return {
            view,
            x: e.root.x - x,
            y: e.root.y - y
          };
        }).filter(x => !!x);
      } else {
        this.target = [{
          view: target.data,
          x: target.x,
          y: target.y
        }];
      }

      break;
    case 'move':
      if (this.target && this.target.length) {
        this.target.forEach(data => {
          if (data.view === this.controller.canvas) {

            // don't drag the canvas if there are other targets
            if (this.target.length > 1) return;

            var {x, y} = data.view.dimensions;
            data = {
              view: data.view,
              x: data.x - x,
              y: data.y - y
            };
          }

          this.controller.move(
            data.view,
            e.root.x - data.x,
            e.root.y - data.y,
            data.view !== this.controller.canvas
                && (e.event.shiftKey || this.forceSnapping)
          );
        });
      }

      break;
    case 'up':
      this.target = null;

      break;
    }
  }

  handleSelectTool(tool: Tool) {
    if (tool.name !== 'drag') return;

    var item = Itembar.makeItem('Snap To Grid', null, () => {
      this.forceSnapping = !this.forceSnapping;
      toggleClass(item, 'selected', this.forceSnapping);
    });
    this.controller.infobar.addItem(item, this.forceSnapping);
  }
}

function getMoveableTarget(tree: PositionalTree): PositionalTree {
  var found = findFirst(
    tree,
    (x, l) => l === 1 && !(x.data instanceof ConnectionView)
  ) || tree;
  if (found) found.children = null;
  return found;
}