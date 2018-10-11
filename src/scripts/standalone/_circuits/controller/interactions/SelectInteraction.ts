import Interaction from '../Interaction';
import { findFirst } from '../treeUtils';

import NodeView from '../../view/NodeView';
import CircuitView from '../../view/CircuitView';
import ConnectionView from '../../view/ConnectionView';
import {
  PositionalEvent,
  PositionalTree,
  ActionEvent
} from '../../model/types';
import View from '../../view/View';

export default class SelectInteraction extends Interaction {
  private isClickCandidate: boolean;
  private lastHoverTarget: View;

  protected reset() {
    this.isClickCandidate = true;
    this.lastHoverTarget = null;
  }

  public handleActionEvent(e: ActionEvent) {
    if (e.section !== 'select') return;

    switch (e.name) {
    case 'all':
      this.select(this.controller.canvas.getAll());
      break;
    case 'rotate':
      (<CircuitView>this.controller.selected[0]).rotate(1);
      break;
    case 'delete':
      this.controller.selected.forEach(v => v.remove());
      this.select(null);
      break;
    case 'cancel':
      this.select(null);
      break;
    }
  }

  public handleMouseEvent(e: PositionalEvent) {
    if (this.controller.actionbar.selectedItem !== 'select:tool') return;

    var canvas = this.controller.canvas;

    var hoverTree =  findNode(e.root)
                  || findCircuit(e.root)
                  || findConnection(e.root);
    var hoverTarget = hoverTree && hoverTree.data;
    if (hoverTarget !== this.lastHoverTarget) {
      this.isClickCandidate = false;
    }
    this.lastHoverTarget = hoverTarget;

    switch (e.type) {
    case 'down':
      if (!canvas.hasSelection()) {
        this.isClickCandidate = true;
        canvas.startSelection(e.root.x, e.root.y);
      }

      break;
    case 'move':
      if (canvas.hasSelection()) {
        canvas.endSelection(e.root.x, e.root.y);
        this.controller.hover(canvas.getSelected());
      } else {
        this.controller.hover(hoverTarget && [hoverTarget]);
      }

      break;
    case 'up':
      if (this.isClickCandidate && hoverTarget) {
        if (hoverTarget instanceof NodeView) {
          var node = hoverTarget.data;
          node.set(!node.isSource);
        } else {
          this.selectSingle(hoverTarget, e.event.ctrlKey);
        }
      } else if (canvas.hasSelection()) {
        this.select(canvas.getSelected(), e.event.ctrlKey);
      }

      canvas.clearSelection();

      break;
    }
  }

  public handleKeyEvent(e: KeyboardEvent) {
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

  public handleSelectViews(views: View[]) {
    this.controller.actionbar.setEnabled('select:cancel', !!views);
    this.controller.actionbar.setEnabled('select:delete', !!views);
    this.controller.actionbar.setEnabled(
      'select:rotate',
      views && views.length === 1 && views[0] instanceof CircuitView
    );
  }

  private selectSingle(view: View, adding?: boolean) {
    var selected = this.controller.selected;

    if (selected && adding) {
      selected = selected.filter(v => v !== view);

      if (selected.length === this.controller.selected.length) {
        selected.push(view);
      }

      this.select(selected);
    } else if (selected && selected.length === 1 && selected[0] === view) {
      this.select(null);
    } else {
      this.select([view]);
    }
  }

  private select(views: View[], adding?: boolean) {
    if (adding) {
      this.controller.addToSelection(views);
    } else {
      this.controller.select(views);
    }
  }
}

function findNode(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof NodeView);
}

function findCircuit(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof CircuitView);
}

function findConnection(tree: PositionalTree): PositionalTree {
  return findFirst(tree, x => x.data instanceof ConnectionView);
}