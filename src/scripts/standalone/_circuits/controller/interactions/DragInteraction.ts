import Interaction from '../Interaction';
import { findFirst } from '../treeUtils';
import ConnectionView from '../../view/ConnectionView';
import View from '../../view/View';
import {
  PositionalEvent,
  PositionalTree,
  ActionEvent
} from '../../model/types';

type MoveData = {
  view: View,
  x: number,
  y: number
};

export default class DragInteraction extends Interaction {
  private target: MoveData[];

  protected reset() {
    this.target = null;
  }

  public handleActionEvent(e: ActionEvent) {
    if (e.id === 'drag:tool') {

      // TODO: allow for other custom cursors
      this.controller.canvas.canvas.style.cursor =
      e.type === 'select' ? 'grab': null;
    }
  }

  public handleMouseEvent(e: PositionalEvent) {
    if (this.controller.actionbar.selectedItem !== 'drag:tool') return;

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

            var {x, y} = data.view.getDimensions();
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
            e.event.shiftKey
          );
        });
      }

      break;
    case 'up':
      this.target = null;

      break;
    }
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